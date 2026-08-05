---
title:  "Cache generation went from 23 minutes to 12 seconds"
date: 2021-07-19T12:00:00
categories:
  - backend
  - britecore
---

At BriteCore I work on BriteLines, the product definition and rating service for property and casualty insurers. Carriers configure coverages, rate tables, and rules there. Quoting and rating need that configuration constantly, so we do not want every premium calculation hitting the database.

The rating engine already reads from Redis. Once a product version’s shape is cached, rating stays on the cache. The pain was not the read path. It was building the cache in the first place.

#### **What we were building**

When someone changed a product, we had to regenerate a JSON snapshot of each risk type. Fields, items, calculations, rate tables, inheritance, the lot. That snapshot is what lived in Redis (and a copy on S3 as backup). Call it a risk type state.

A risk type is a category of thing on a policy, like a vehicle, driver, or building, with its own fields and coverages. A product version is a dated cut of the whole product config. Regenerating one risk type is a slice of that. A full version reset rebuilds every risk type in that cut.

Generation ran in the background. An API request mostly scheduled work onto SQS. Each message spun up a Lambda that used our Django serializers to pull the risk type out of MySQL, shape it into that JSON, and write it to the cache. Roughly one Lambda per risk type, not one giant job for the whole product.

For ordinary products that was fine. Then a huge client configuration showed up. Cache jobs started timing out. A Lambda can run for at most **15 minutes**. Ours were set near that ceiling for background work. When a risk type took longer, AWS killed the function, SQS retried it, and the clock kept running. Wall time for the bad cases sat around **23 minutes**, with failures and retries along the way. After we fixed the generation path, the same kind of work landed near **12 seconds**.

#### **The boring bug that everyone already knows**

If you have spent time with an ORM, you have heard of N+1 queries. You load a list of parents. Then, for each parent, you load its children. Then maybe grandchildren. Each “for each” is another trip to the database. Ten parents become ten queries. A deep product tree becomes thousands.

Django makes this easy to write by accident. You walk a model graph in Python and it looks clean. Underneath, every attribute access that was not loaded up front can fire another SQL statement. The usual fixes are `select_related` and `prefetch_related`. They tell Django to pull related rows in fewer, wider queries before you start walking the tree.

We already knew that pattern. The team had fixed N+1 in other corners of BriteLines. Knowing the name of the problem and finding it in a serializer that walks calculations, rate tables, field references, and inheritance are different jobs. The second one is where we spent our time.

#### **Finding it was harder than fixing it**

A single risk type state is not one table. The serializer walks a graph. Calculations reference fields. Fields reference other calculations. Rate tables have sources that point at fields or more tables. Ancestors and descendants in the product hierarchy get pulled in too. On a small fixture it looks fine. On a carrier product with a deep tree, the query count climbs quietly until Lambda hits its limit and the job dies.

We used Django’s debug tooling to see the query log for a generation run. Which statements repeated, which loops were driving them, which relation we had forgotten to prefetch. With `DEBUG` on, Django keeps the SQL on `connection.queries`. [Django Debug Toolbar](https://django-debug-toolbar.readthedocs.io/) makes that list readable in the browser. For background Lambdas we logged the same query list, or ran the serializer path locally against a fat product fixture and watched the count climb. That part is tedious. The log is long. A lot of queries look “legitimate” until you notice the same shape repeating once per node. You fix one hotspot, regenerate, and another shows up further down the graph.

The main win was boring on purpose. Prefetch the calculations and rate tables for the related risk types in bulk. Keep hashes of them in memory while the serializer resolves references, instead of asking the database again for each edge in the graph. Once those round trips were gone, the same Lambda work that had been timing out finished in seconds.

#### **The lesson**

N+1 is famous because it is common, and common because ORMs hide the cost until the data gets large. People ignore it on small products, then treat the timeout as an infrastructure problem. More memory, longer Lambda limits, bigger connection pools. Sometimes you need those. Often you are just asking the database the same question a thousand times.

The lesson is to separate the read path from the build path. Our rating engine was already doing the right thing with Redis. The build path was the one that assumed “serialize the graph” would stay cheap. When a client’s configuration got big enough, that assumption failed in public.

If a background job only hurts on the largest tenant, start with the query log for that tenant’s shape. The fix is usually unglamorous. Prefetch what you walk. Load related data once. We did not invent any of that. We just finally measured the generation path carefully enough to apply it where it counted.
