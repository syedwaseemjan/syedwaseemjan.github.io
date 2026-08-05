---
title:  "What I look for when I interview Python engineers"
date: 2026-02-10T12:00:00
categories:
  - backend
  - convo
---

At Convo I interviewed about twenty mid and senior Python engineers. They were all for the same role with the same bar, and the conversation was almost the same every time.

I do not ask live coding puzzles and I do not ask people to recite syntax. After fourteen years I still mix up Python’s `append` with JavaScript’s `push`. I am a Python developer and I still cannot keep every detail of every language in my head. So I stopped pretending that remembering trivia is what makes someone good at the job. These interviews were for Python roles, and I cared about concepts, not whether someone could recall a method name under pressure.

#### **The questions I keep coming back to**

I open with something plain.

> We have a slow application. How would you make it faster?

Then I follow wherever the answer goes. Databases, queries, indexes, `EXPLAIN ANALYZE`, replication, sharding, partitioning. Processes and threads, and how the OS actually schedules work. Async code. The GIL. Queues. Caching. Whatever the candidate reaches for, I dig.

My other favourite is just as open.

> What happens when you type a URL in the browser and hit enter?

That one pulls in DNS, TCP, TLS, HTTP, load balancers, caches, and the browser itself. It is the same idea. A short prompt, and then a long walk through whatever they know.

I ask almost everyone one of these on purpose. The question is not clever. The digging is the interview.

#### **What good answers look like**

Strong candidates do not jump to a tool. They ask what “slow” means. Is it one endpoint or the whole product? Is it CPU, waiting on the database, waiting on a network call, or waiting on a lock? They want numbers before they want a rewrite.

When we land on the database, the people I trust talk about reading a query plan before they talk about buying a bigger instance. They know an index can help and that the wrong index can hurt. They can explain when replication helps reads and when it only moves the problem. They bring up sharding and partitioning as last resorts with clear tradeoffs, not as the first idea that sounds senior.

On concurrency, good answers stay practical. Threads, processes, async, and the GIL are not buzzwords to them. They can say what Python can do in parallel and what it cannot, and when a queue is the right place to push work off the request path. When they mention caching, they have a reason for it. They can say what is cached, how it is invalidated, and what happens when the cache is wrong.

I am less interested in whether they name every option. I am more interested in whether they can keep breaking the problem down without getting lost or defensive.

#### **What weak answers look like**

Some people start listing technologies. Redis. Kafka. Kubernetes. Microservices. The list grows and the diagnosis never starts. Others freeze because they expected a coding pad and a sorted array.

A few give one correct idea and stop. “Add an index.” Fine. Which column? How would you prove it helped? What if the plan still shows a sequential scan? That first answer is the easy part. I care about whether they can keep going.

I also watch for people who only know the happy path of a framework. They have used Django or FastAPI for years and still cannot say what happens when a hundred workers hit one database, or why an async endpoint still blocks if the code inside it is synchronous. Shipping features for years is not the same as understanding how the system underneath actually works.

#### **What I stopped asking**

I stopped asking candidates to reverse a linked list on a whiteboard. I stopped asking for the exact signature of a standard library function. Watching someone code while a timer runs does not tell me if they can find why a system is slow.

Those exercises are easy to grade. They are also easy to game with practice, and they reward people who memorize patterns over people who think carefully. I still need people who can write code. I learn that from how they reason about real systems, from their past work, and from follow up questions about designs they have owned. I do not learn it from whether they remember that Python uses `append`.

I also stopped asking a dozen disconnected trivia questions. One deep thread tells me more than ten shallow ones. If someone can stay with a slow app for forty minutes and keep finding the next place to look, I trust them more than someone who can recite definitions and never apply them.

#### **What actually predicts a good hire**

The signal that matters most is how they think when the first answer is not enough. Do they measure before they rebuild? Do they know what the database is doing? Do they understand that Python’s concurrency model has limits and work around those limits with processes, queues, or clearer boundaries? Can they describe an outage or a performance fix they worked on without exaggerating their part?

Curiosity shows up early. The strong ones ask clarifying questions. They admit what they have not done and still reason from first principles. The weak ones try to sound like they already have the answer.

After those twenty interviews I trust this more than I did before. I do not need a clever puzzle to hire well. I need someone who can stay with a messy problem and keep thinking. Those are usually the people I want on the team.
