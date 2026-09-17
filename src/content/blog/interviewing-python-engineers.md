---
title:  "What I look for when I interview Python engineers"
date: 2026-02-10T12:00:00
categories:
  - backend
  - convo
---

At Convo I interviewed about twenty mid and senior Python engineers for the same role. I used the same bar each time, and every interview started with the same question.

I do not ask live coding puzzles, and I do not ask people to recite syntax. After fourteen years I still mix up Python’s `append` with JavaScript’s `push`, and even as a Python developer I still cannot keep every detail of both languages in my head, so I stopped treating trivia as proof that someone is good at the job. These interviews were for Python roles, and I cared about concepts, not about whether someone could remember a method name under pressure.

#### **The questions I keep coming back to**

Every interview opens with the same plain question.

> We have a slow application. How would you make it faster?

Then I follow the answer. That can mean databases, queries, indexes, `EXPLAIN ANALYZE`, replication, sharding, partitioning, processes and threads and how the OS actually schedules work, async code, the GIL, queues, or caching. Whatever the candidate brings up, I keep asking about it.

That first question usually fills most of the hour. When there is time left, I ask a second one that is just as open.

> What happens when you type a URL in the browser and hit enter?

That one pulls in DNS, TCP, TLS, HTTP, load balancers, caches, and the browser itself. It works the same way: a short prompt, then a long walk through whatever they know.

Neither question is a trick. What matters is the follow-up questions.

#### **What good answers look like**

Strong candidates do not jump to a tool. They ask what “slow” means. Is it one endpoint or the whole product? Is it CPU, waiting on the database, waiting on a network call, or waiting on a lock? They want numbers before they want a rewrite.

When we get to the database, the people I trust talk about reading a query plan before they talk about buying a bigger instance. They know an index can help and that the wrong index can hurt. They can explain when replication helps reads and when it only moves the problem. They bring up sharding and partitioning as last resorts with clear tradeoffs, not as the first idea that sounds senior.

On concurrency, good answers stay practical. Threads, processes, async, and the GIL are not buzzwords to them. They can say what Python can do in parallel and what it cannot, and when a queue is the right place to push work off the request path.

Caching is its own check. Anyone can say the word, but the ones I trust can tell me what is cached, how it is invalidated, and what happens when the cache is wrong.

If we get to the URL question, I want the same kind of thinking on a different path. A weak answer stops at the browser sending a request and getting HTML back. A good one walks through the DNS lookup and where that gets cached, what the TCP handshake costs, what TLS actually agrees on, and where a load balancer or a CDN sits in the middle. The best ones tie it back to the first question and point at the places in that path where things get slow.

I am less interested in whether they name every option, and more interested in whether they can keep breaking the problem down without getting lost or defensive.

#### **What weak answers look like**

Some people start listing technologies like Redis, Kafka, Kubernetes, and microservices. The list grows and they never start diagnosing the problem. Others freeze because they expected a coding pad and a sorted array.

A few give one correct idea and stop. “Add an index” is fine, but which column? How would you prove it helped? What if the plan still shows a sequential scan? That first answer is easy. I care about whether they can keep going.

I also watch for people who only know the happy path of a framework. They have used Django or FastAPI for years and still cannot say what happens when a hundred workers hit one database, or why an async endpoint still blocks if the code inside it is synchronous. Shipping features for years is not the same as understanding how the system underneath actually works.

#### **What I stopped asking**

I stopped asking candidates to reverse a linked list on a whiteboard, and I stopped asking for the exact signature of a standard library function. Watching someone code while a timer runs does not tell me if they can find why a system is slow.

Those exercises are easy to grade, but they are also easy to game with practice, and they reward people who memorize patterns over people who think carefully. I still need people who can write code, so I get at it a different way. I ask them to walk me through something they built, then I keep asking why until we are down at the code itself: where the retries live, what they did about a race condition, why one function ended up doing too much, and what they would change now. Someone who has actually written the thing can go that deep. I do not learn any of this from whether they remember that Python uses `append`.

I also stopped asking a dozen disconnected trivia questions, because one deep thread tells me more than ten shallow ones. If someone can stay with a slow app for forty minutes and keep finding the next place to look, I trust them more than someone who can recite definitions and never apply them.

#### **What actually predicts a good hire**

The thing that matters most is how they think when the first answer is not enough. Do they measure before they rebuild? Do they know what the database is doing? Do they understand that Python’s concurrency model has limits and work around those limits with processes, queues, or clearer boundaries? Can they describe an outage or a performance fix they worked on without exaggerating their part?

You can see curiosity early, because the strong candidates ask clarifying questions. They admit what they have not done and still reason from what they do know, while the weak ones try to sound like they already have the answer.

After those twenty interviews I trust this more than I did before. I do not need a clever puzzle to hire well. I need someone who can stay with a messy problem and keep thinking, and those are usually the people I want on the team.
