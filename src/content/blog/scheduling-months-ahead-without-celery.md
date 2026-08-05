---
title:  "Scheduling work months ahead, and why Celery was wrong for it"
date: 2024-09-10T12:00:00
categories:
  - aws
  - backend
  - chefgalaxy
---

Chef Galaxy had a lot of work that had to happen later. Not later as in a few seconds later. Later as in next month.

A customer hires a chef for a wedding in November. It is August. When the event date arrives we close the event. A few hours after that we mark the order complete, and if nobody opens a dispute we close the order and pay the chef. Around that there is a pile of shorter deadlines. A chef has a day to accept an order or the system rejects it for them. A customer has half a day to pay or the order cancels itself. If a dispute is opened, the chef gets a day to respond, and if they stay quiet we resolve it and move the money.

So the delays ran from a few hours to a full day, and the big ones stretched out to whenever the event was, sometimes two or three months away. I built all of it with Celery and Redis on Flask. It worked well enough that I stopped thinking about it. Looking back now, it was the wrong tool, and I want to write down why, plus what I would use instead.

#### What I actually built in 2016

The stack was Flask on EC2, Postgres on RDS, and Redis on ElastiCache. Redis was the Celery broker. Celery workers ran on the same EC2 instances as the web app.

When an event was booked, I scheduled the close right there, pointed at the event date.

```python
@celery.task(name='close_event', max_retries=None)
def close_event(user_id, event_id):
    event = _events.get_or_404(event_id)
    event.locked = True
    event.public_state = EVENT_PUBLIC_STATES["past"]
    _events.save(event)


task = close_event.apply_async(
    (user_id, event_id),
    eta=event_date_time,
)
event.event_ending_task_id = task.task_id
```

That is it. One call, and Celery promises to run it whenever the event is, which could be three months out. It reads beautifully. That is exactly the problem, because the line hides where that promise is actually being kept.

#### The task sits in a worker's memory

When you call `apply_async` with an `eta`, Celery does not hold the message anywhere clever. It puts the message on the broker immediately. A worker then picks it up immediately, sees the due date is far away, and just keeps it in memory until then.

The worker does not freeze while it waits. It keeps taking and running other tasks. One worker can hold several future jobs in memory at the same time and still stay busy. If you have ten workers and twenty events booked for next month, those twenty close tasks just sit in memory across the workers. The workers keep working. The problem is not capacity. The problem is where the future work lives.

So the close task for a November wedding is a Python object living inside a Celery process from August. Nothing about that process is designed to be alive in November.

Every deploy restarts the workers. We deployed often. On a clean shutdown Celery tries to put unacknowledged messages back on the broker, so most of the time it recovers. On a hard kill, an out of memory error, an instance that Auto Scaling decided to replace, or an EC2 host that just went away, that recovery does not happen. I had chef payouts and event closings sitting in the memory of a process that could disappear at any moment.

#### The visibility timeout problem

This is the part I only half understood back then.

A real broker like RabbitMQ tracks who is holding each message. The worker sends back an acknowledgement when it finishes the work. If the worker crashes, or its network drops, the broker watches that connection close and puts the message back on the queue right away. There is no timer in that story. The dead connection is the signal.

Redis cannot do any of that. It is a data store. It has no idea what a consumer is and it never tracks who read a value, so it can never tell anyone that a worker disappeared. The library Celery uses to talk to Redis builds the missing piece itself. There is even a setting named `ack_emulation` whose whole job is to imitate the acknowledgement part of AMQP.

The only way to imitate it is with a clock. When a worker takes a message, the library moves that message into a holding area in Redis and stamps it with the time. Acknowledging it means removing it from the holding area. Redis itself never watches that holding area. The Celery workers do. As they run, each worker periodically asks Redis for stamps older than the visibility timeout and pushes those messages back onto the queue for somebody else.

That is the best you can do without connection tracking. Time is the only signal available. It also means nothing in the system can tell the difference between a worker that died and a worker that is deliberately holding a message until November.

The default for Redis is one hour.

Now put a task with a three month `eta` into that. The worker takes the message and holds it in memory while it keeps doing other work. One hour later another Celery worker's sweep decides that worker must be dead and hands the same message to somebody else. That worker also holds it. An hour after that it happens again. The Celery documentation says this plainly, that a task whose execution time is beyond the visibility timeout will be executed again, and again, in a loop.

The official fix is to raise the visibility timeout so it is longer than your longest delay. Here is what I actually had in my config.

```python
# 1209600 sec = 336 hours = 14 days
BROKER_TRANSPORT_OPTIONS = {"visibility_timeout": 1209600}
```

Fourteen days. Look at that number next to a wedding booked two months out. My close task and my complete task were both tied to the event date, so plenty of them were scheduled further ahead than fourteen days. The setting did not even cover my longest delay. Past that window a Celery worker's sweep would decide the holder was gone and hand the same task out again. I had written the timeout that everyone writes, patted myself on the back, and still left my longest running jobs exposed to the exact loop it was meant to stop.

And there is no good number to put there anyway. The Celery docs say straight out that raising it is not recommended, because it is really an answer to a different question. It says how long to wait before recovering a genuinely lost task after a crash. Set it to cover a two month event and you are also telling that sweep to leave any truly dead task sitting for two months. Far future work simply does not belong here.

I mostly got away with it. A duplicate close on an event that is already closed does nothing the second time, because the handler checks the state first. But the same tasks also paid chefs and refunded customers, and those are not things you want fired twice. The only reason a double payout never bit me is that those handlers happened to check state too. That was luck dressed up as design.

#### Redis was holding data I could not afford to lose

Redis on ElastiCache was our cache and our notification store. It was fine for both. Then it quietly became the system of record for every future payment and every dispute deadline, because that is where the Celery messages lived.

A cache is a thing you are allowed to lose. If ElastiCache failed over, or a node restarted, or we hit the memory limit and eviction kicked in, the answer was supposed to be that we rebuild it and move on. That answer stops working when the lost data is the list of chefs we owe money to.

#### Changing a schedule meant chasing Celery

The real cost showed up in normal product work.

A customer moves the wedding from November to December. Now the close task is scheduled for the wrong day. A dispute opens on an order. Now the complete task that would have paid the chef has to be stopped. Change any of these and you have to reach back into Celery and cancel what you queued.

I did handle this, and the handling is the tell. Every one of these tasks came back with an id, and I saved that id on the row it belonged to. There are columns all over the schema for exactly this, `event_ending_task_id` on the event, `scheduled_task_id` on the order, `dispute_resolving_task_id` on the dispute, `auction_ending_task_id` on the auction. When something changed I looked up the id and called revoke.

```python
def revoke_task(task_id):
    celery.control.revoke(task_id)
```

Think about what that is. I was keeping a pointer, in Postgres, to a job that was living somewhere inside Celery. The real thing I cared about, the fact that this event closes on this date, was not a row I could read. It was a message held in a worker, and all my database had was its tracking number. To move a date I revoked the old task and scheduled a new one and swapped the id. To cancel I revoked and hoped the worker holding it got the message. I could not run a query to see everything due next week. The schedule was not data. It was a side effect I was chasing with sticky notes.

And there is a slower problem. A task queued in August runs in November against November's code. If I changed the arguments of `close_event` in September, the messages already sitting in workers still carried the old arguments. Three month old messages meeting three month newer code is not a fun thing to debug.

#### What I should have done, with what already existed

It just needed a table.

```sql
CREATE TABLE scheduled_jobs (
    id          bigserial PRIMARY KEY,
    booking_id  int NOT NULL,
    job_type    text NOT NULL,
    run_at      timestamptz NOT NULL,
    status      text NOT NULL DEFAULT 'pending',
    attempts    int NOT NULL DEFAULT 0,
    payload     jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX scheduled_jobs_due
    ON scheduled_jobs (run_at)
    WHERE status = 'pending';
```

Scheduling something is now an insert. Cancelling is a delete. Moving an event is an update to `run_at`. Answering what is scheduled for this booking is a select. All of it is in the same transaction as the booking itself, so you cannot end up with a booking that has no reminder or a reminder with no booking.

Then one small Celery beat task runs every minute and picks up whatever is due.

```sql
UPDATE scheduled_jobs
SET status = 'running', attempts = attempts + 1
WHERE id = (
    SELECT id FROM scheduled_jobs
    WHERE status = 'pending' AND run_at <= now()
    ORDER BY run_at
    FOR UPDATE SKIP LOCKED
    LIMIT 1
)
RETURNING id, job_type, payload;
```

`SKIP LOCKED` lets several workers run this at the same time without fighting over the same row. If one worker is holding a row, the next one skips past it and takes a different one. Postgres shipped that in 9.5, which came out in January 2016. It was sitting right there while I was writing `eta` calls.

Periodic tasks were never the weak part of Celery. Running one job every minute is exactly what Celery is good at. My mistake was asking Celery to remember something for three months instead of asking Postgres to remember it and asking Celery to check the clock.

The cost is that a job can fire up to a minute late. For a reminder about an event next week, nobody notices.

#### What I would use on AWS today

If I were building this now, I would still start with the table above, because it is boring and it lives next to the data. But there are AWS pieces now that did the hard part for you, and two of them are genuinely better than anything available in 2016.

**EventBridge Scheduler** is the one I would reach for first. It arrived at the end of 2022 and it does exactly this job. You create a schedule that fires once at a given moment and points at a Lambda, an SQS queue, or a Step Functions workflow.

```python
scheduler.create_schedule(
    Name=f"release-payment-{booking.id}",
    ScheduleExpression="at(2024-11-12T09:00:00)",
    ScheduleExpressionTimezone="UTC",
    FlexibleTimeWindow={"Mode": "OFF"},
    ActionAfterCompletion="DELETE",
    Target={
        "Arn": release_payment_lambda_arn,
        "RoleArn": scheduler_role_arn,
        "Input": json.dumps({"booking_id": booking.id}),
        "RetryPolicy": {"MaximumRetryAttempts": 5},
        "DeadLetterConfig": {"Arn": dlq_arn},
    },
)
```

The important bits are all things Celery could not give me. The schedule is a real object with a name, so cancelling a booking is a `delete_schedule` call. It retries on failure and drops what it cannot deliver into a dead letter queue. `ActionAfterCompletion` cleans it up after it fires, which matters because completed schedules still count against your account limit. The default limit is a million schedules per region, and you can ask for more, so one schedule per booking is completely normal usage.

The closest thing in 2016 was CloudWatch Events rules, which were built for cron style jobs and capped at a small number per account. You could not make one per booking. That is a real gap that got filled.

**Step Functions** is the better fit for the dispute flow, because that flow is not one alarm, it is a sequence of waits and decisions. A Standard workflow can wait up to a year, and a `Wait` state can wait until a timestamp you pass in.

```json
{
  "StartAt": "WaitForChefReply",
  "States": {
    "WaitForChefReply": {
      "Type": "Wait",
      "TimestampPath": "$.reply_deadline",
      "Next": "CheckReply"
    },
    "CheckReply": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:111122223333:function:check-dispute",
      "Next": "Decide"
    },
    "Decide": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.chef_replied",
          "BooleanEquals": true,
          "Next": "HumanReview"
        }
      ],
      "Default": "AutoResolve"
    },
    "HumanReview": { "Type": "Succeed" },
    "AutoResolve": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:111122223333:function:auto-resolve",
      "End": true
    }
  }
}
```

Standard workflows bill you per state transition, not per second, so a workflow that waits one day costs the same as one that waits one second. You also get the execution history, which means you can open a dispute in the console and see exactly where it is and what already ran. That was the thing I most wanted in 2016 and could not have.

There is also a callback pattern where the workflow pauses and hands out a token, and the chef replying is what sends the token back. Then the wait and the timeout are the same piece of the workflow instead of two things you have to keep in sync.

#### The options that look right and are not

**DynamoDB TTL** comes up constantly for this, and I nearly wrote it into an old design myself. You set an expiry timestamp on an item, the item gets deleted, and a stream sends that deletion to a Lambda. It is free and it is very little code.

The catch is in the AWS docs and it is not subtle. DynamoDB deletes expired items on a best effort basis and typically within forty eight hours of the expiry time. Not at the expiry time. Up to two days after it. That is fine for cleaning up old sessions. It is not fine for closing an order on time, and it is definitely not fine for paying a chef.

**Redis TTL with keyspace notifications** has the same shape of problem, only worse. Two things go wrong here.

The first is delivery. Keyspace notifications go out over Redis pub sub, and pub sub is fire and forget. If your subscriber is restarting or the connection drops, every event during that gap is gone forever. There is nothing to replay. On ElastiCache with more than one node you also have to subscribe to each node separately, because events do not travel across the cluster.

The second is timing, and this is the interesting one. Redis does not delete a key the moment its TTL hits zero. It checks twenty random keys with a TTL ten times a second, deletes the expired ones it found, and repeats only if more than a quarter of the sample was expired. The expired event fires when Redis actually deletes the key. If you have a large pile of keys that all expire months from now, a key that expired ten minutes ago can go unnoticed for a long time, because random sampling keeps landing on keys that are nowhere near due. People have hit this in production and watched the event show up only after something else touched the key.

So Redis TTL is a decent cache expiry mechanism and a bad scheduler.

**SQS delay queues** are the shortest answer of all. The maximum delay on a message is fifteen minutes and the maximum retention is fourteen days. SQS is a great place to send work once it is due. It is not a place to park work for a month.

#### The part that matters more than the tool

Everything above fires at least once, not exactly once. EventBridge Scheduler retries. A Postgres poller can hand out the same row twice if a worker stalls and a reaper puts it back. Celery duplicated my tasks for a completely different reason, the visibility timeout. So the handler has to check state before it acts.

My old code did this, almost by accident. The complete task looked at the order before touching it.

```python
def complete_order(user_id, order_id):
    order = _orders.get_or_404(order_id)
    if order.is_live and not order.dispute:
        order.order_state = ORDER_STATES['completed_order']
        ...
```

That check is what saved me. If the task ran twice, the second run saw the order was already past `live` and quietly did nothing. Without it, every redelivery from that fourteen day timeout becomes a real bug. With it, a duplicate is a wasted database read. The lesson is that this check is not optional decoration. It is the thing standing between at least once delivery and a double payout, so write it on purpose rather than hoping it is there.

The real lesson from Chef Galaxy is simple. Store the future work in a database row next to the booking. Then you can look it up, change the date, or cancel it like any other data. How you wake up and run that row later is a separate choice. Celery, EventBridge, or a small poller can all do that part. I did the opposite. I hid the future work inside Celery, so I could not look it up, could not change it easily, and could not trust it to still be there after a restart.
