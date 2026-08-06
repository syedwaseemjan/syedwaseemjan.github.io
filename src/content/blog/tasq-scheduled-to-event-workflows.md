---
title:  "How we moved Tasq model runs from schedules to events"
date: 2024-05-28T10:00:00
categories:
  - aws
  - backend
  - tasq
---

<a href="/work#tasq" target="_blank" rel="noopener noreferrer">Tasq</a> watched oil and gas wells for operators. A well is just a production site out in the field. Sensors on each one sent readings like pressure and flow, and we called those readings signals. Our job was to turn that stream of data into work for the people who keep wells healthy.

Most readers are not from oil and gas so a few terms may help here. A setpoint is a target value a control system aims for. On a well that often means the open and close pressures that decide when equipment starts or stops a production cycle. When a well makes less than it should, we treated that as lost production. The product turned those findings into work tickets that field crews and engineers could pick up.


#### **Where the data went**

Operators shipped us sensor data as Parquet files into an S3 bucket. Parquet is a columnar file format that packs a lot of rows into a small object, which is common for bulk analytics data. A new file landing in S3 kicked off an ingest Lambda. That Lambda read the Parquet, mapped device ids to wells, and wrote the signals into Rockset. Rockset was a realtime analytics database. We used it as the query store for recent pressure and volume, so models and APIs did not have to scan S3 every time. OpenAI acquired Rockset in 2024 and shut down the public cloud product, so it is no longer something you can just sign up for.

The models wrote their outputs somewhere else. Recommendations, lost production flags, and the work tickets themselves lived in DynamoDB. So the path was roughly S3 for raw files, Rockset for queryable signals, and DynamoDB for predictions and tickets. The Lambdas and queues for that path were spread across AWS SAM, the Serverless Framework, and CDK stacks, so the later event wiring had to work across all three.


#### **How the system used to run**

The models did not start when a file landed. They started when a schedule said so. We used EventBridge schedule rules, the rate and cron style rules that used to live under CloudWatch Events, with expressions like once an hour or once a day. When the rule fired, it invoked a trigger Lambda.

That trigger Lambda loaded the enabled wells for an operator and put one SQS message per well onto a queue. A worker Lambda on that queue pulled the well's signals from Rockset, ran the model, and wrote the result to DynamoDB. Failed messages retried, then landed on a dead letter queue.

Setpoint recommendations had that shape. Lost production checks had that shape. Creating and closing work tickets had their own schedules that scanned DynamoDB and pushed more SNS and SQS traffic downstream.

It was easy to follow. The cost showed up as we scaled. Every hour we reprocessed wells that had no new data. A well that just got a fresh Parquet file still waited until the next schedule tick.


#### **Moving the trigger to ingest**

The useful moment is when new signals land for a well. That is when a model has something new to look at. So after the ingest Lambda finished writing to Rockset, it published a small SNS message per well.

```python
sns.publish(
    TopicArn=INGESTION_COMPLETION_TOPIC_ARN,
    Message=json.dumps({
        "operator": operator_name,
        "well": well_name,
        "signal_types": ["Gas Today", "Tubing Pressure"],
        "latest_time": latest_time,
    }),
)
```

The payload named the operator, the well, and which signal types were in that batch. Volume and pressure are the ones that mattered for the models below.

SNS is a publish and subscribe topic. You publish once, and any number of subscribers can get a copy. It is good at fan out, but it is not a backlog. SNS pushes the message and moves on. There is nowhere for work to sit if a consumer is slow, and failure handling is thin compared to a queue.

That is why we did not point SNS straight at the model Lambdas. Each model got its own SQS queue subscribed to the topic, and the Lambda listened to that queue. SNS still fans the ingest completion out to lost production, setpoints, and anything else we add later, without the ingest Lambda knowing about them. SQS is where messages can pile up, retry, and land on a dead letter queue if a worker keeps failing. Other subscribers keep moving while one model is backed up.


#### **How a queue only sees the signals it cares about**

Not every model wants every message. Lost production cares about volume style signals. Setpoints care about pressure. If both queues received every ingest event, each Lambda would wake up, inspect the payload, and exit most of the time. That is wasted invocations.

SNS subscription filter policies fix that. When you subscribe an SQS queue to the topic, you attach a filter on the message body or attributes. SNS evaluates it before delivery. Matching messages land on that queue. Everything else never reaches it.

```json
{
  "signal_types": ["Gas Today"]
}
```

That is the lost production subscription. The setpoint queue used a different filter for pressure signals. Same publish, different deliveries.

Once a message does land, the Lambda runs for that well only. If the well looks fine, it stops. If not, it publishes into another SNS and SQS chain that creates or updates a work ticket in DynamoDB and assigns it to someone.


#### **What got better**

Quiet wells stopped waking models. Busy wells got a run soon after their Parquet file was ingested instead of waiting on the next schedule rule. A bad message for one well stayed on that consumer's queue and did not block other wells or other models. Adding a new model meant a new queue, a filter for the signal types it needed, and a Lambda. We did not have to bolt another fleet wide schedule onto the system.

The unit of work changed from "every enabled well on this timer" to "this well just got new data." That was the whole migration.


If you are building something similar, start from the moment new data is already in the store you query. Publish from there. Put SNS in front when more than one consumer will care. Put SQS behind each consumer so retries and backlog stay local. Filter at the subscription so workers only wake for the signal types they need.
