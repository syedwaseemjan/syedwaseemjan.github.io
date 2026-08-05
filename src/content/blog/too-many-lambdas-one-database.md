---
title:  "Too many Lambdas, one database"
date: 2021-06-28T12:00:00
categories:
  - backend
  - britecore
---

At BriteCore, BriteLines rebuilds product caches in the background. Change a product version and we queue work on SQS. Each message starts a Lambda that rebuilds the cache for one risk type and writes it to Redis.

A risk type is one category on a policy, like a vehicle or a building. A product version is a dated cut of the full product config. A full version reset means rebuild the cache for every risk type in that cut, not just the one that changed.

That design was deliberate. One big job for a whole product would have been brittle. Splitting by risk type meant failures stayed smaller and work could run in parallel. For a full version reset, though, “in parallel” meant a lot of Lambdas at once.

#### **What broke**

Every Lambda opened a connection to MySQL. The database only allows so many. When dozens of workers landed together, some could not get a connection. Jobs failed. SQS retried them. Retries piled on more workers. From the outside it looked like cache generation was still broken, even when a single risk type rebuild was fine on its own.

The symptoms sat next to the [slow serializer problems we had elsewhere](/blog/britelines-cache-generation). Timeouts, failed jobs, a product whose cache never quite finished. It was easy to treat it as the same bug. It was not. One path was too many queries inside a worker. This one was too many workers asking the database for a seat at the same moment.

#### **What we changed**

We wrote a small helper that staggered jobs when we enqueued them. SQS accepts a `DelaySeconds` value on each message, so instead of dumping every risk type job onto the queue at once, we assigned delays across the batch and Lambdas woke up in waves.

The idea was simple. Keep some parallelism so a full reset does not drag forever. Cap how many workers hit MySQL at once so the connection limit stops being the bottleneck. We were not trying to make one job faster. We were trying to stop a healthy fan out from drowning the database.

#### **Why this is easy to miss**

Fan out feels like the cloud doing its job. You have a queue, you have Lambdas, you have a product with many pieces. Of course you process them together. The database does not scale that story for free. Connection limits are a hard ceiling. Retries turn a short spike into a longer outage of the same shape.

I have seen the same pattern outside BriteLines. People migrate a table with a swarm of workers, warm a cache for every tenant at deploy time, or fan out “just regenerate everything.” Each worker looks innocent. Together they exhaust a shared resource that is not in the Lambda metrics you stare at first.

#### **The lesson**

After you fix the work inside one job, look at how many of those jobs you start together. If the shared dependency is a database with a fixed connection pool, limiting concurrency can matter as much as speeding up any single worker.

We already had the split by risk type. The missing piece was admitting that the split could succeed too well. Once the workers stopped landing on MySQL all at once, full version resets stopped failing on connection limits.
