---
title:  "Four years on Chef Galaxy"
date: 2018-09-15T23:13:00
categories:
  - chefgalaxy
---

In 2014 I took a small Upwork contract to build a profiles module in Python Flask. The client liked the work and sent another. Then another. After a few of those I was deep enough in the product that they asked if I wanted to come on as a partner. I said yes right away.

The company was Chef Galaxy. The idea was simple enough. Connect people who needed a chef for a birthday, a wedding, or some other event with chefs who could cook for them. Basically an Upwork for chefs.

<img src="/assets/img/posts/what-i-learned-from-my-failed-startup/img-1.png" alt="Chef Galaxy landing page" />

We shut the servers down on 23 August 2018. Four years. It failed. I still think about that stretch of my life a lot, mostly because of what it taught me, not because of what it earned.

### We never really checked if anyone wanted it

Chef Galaxy was not my idea. I joined when the MVP was already being built. At the time I did not know much about validating an idea, so I kept my head down and wrote code. Looking back, that was the first mistake.

You do not need an MVP to find out if a market exists. A landing page and a manual process behind it is enough. We should have asked early whether customers had this problem and whether they would pay to solve it. A cool product is not the point. Solving something people actually struggle with is. We built for what felt exciting to us instead of for the people who were supposed to open their wallets. Validation would have saved years and a lot of money.

### The MVP took almost three years

I started the MVP in early 2014. We put it on production in late 2016. Almost three years. An MVP should never take that long.

We told ourselves we were building an MVP, then kept adding things. Admin panels. Dispute flows. Live notifications. None of that was needed for the core loop of booking a chef. We also spent far too long on how the site looked. Icons and graphics were redone several times. Page layouts were redesigned again and again. On top of that we tried to become a Facebook and Quora for chefs, a whole social network around food. That should have been a separate product, if it was worth building at all. Cloning something that already exists is not a strong bet.

I felt we were doing too much and I pushed back a few times. Not hard enough. I was the engineer, not the business person, and that is how the pushback landed.

The servers matched that same habit. Test ran on a single EC2 with RDS, Elasticsearch, Celery, and Redis on the box. Production was set up for high scale from day one. Auto Scaling, a load balancer, VPC, S3, ElastiCache, OpenSearch. The bill sat around **$800 a month**.

That was not an empty product either. People did use Chef Galaxy. Chefs signed up. Customers booked. The system had real traffic and real accounts behind it. We just never got enough consistent revenue for the business to stand on its own. Cutting the AWS bill down would have been the easy part. One quieter box could have hosted what we had. The harder truth was that cheaper servers would not have created more paying customers, and that is what we were missing.

By the time we launched in 2016 it still did not feel ready. I wish we had shipped earlier, failed while it was still cheap, and learned from that instead. One long failure drains you in a way a short one does not.

### Building was the easy part

The other big reason we failed was that nobody really sold the product hard enough to make the economics work.

We assumed launch would bring a steady stream of paying customers. Some people showed up, but not enough of them paid, and not often enough. For an engineer like me, building is often the comfortable part. Selling is harder, and we treated it like someone else's job. During development there were talks about sales, marketing, and partnerships. I thought people were on it. My partner's wife and her friend were supposed to be handling that side. I never met them. We all worked remotely and my partner managed that group. After launch it was obvious there was no real plan.

I tried to push for SEO. My partner never bought in. Waiting for a B2C product to go viral on its own is a long shot. Later he wanted to create content to teach the market what we offered. That would have helped SEO too. Family issues got in the way and it never happened.

### Leaving made shutting down possible

After launch I moved to another city and took a full time job. Chef Galaxy could run in my evenings unless it somehow took off, in which case I could always quit. That decision looks even better now. If I had stayed in the same place, living inside the startup every day, I would have struggled to let it go. Walking away would have cost me more, in money and in headspace.

### What I kept

Chef Galaxy failed, and it still gave me a lot. Technical habits from those years show up in my full time work even now. The bigger thing is the friendship with our founder. It is still there. We used to stay on long calls that wandered off work into cars, homes, weddings, news, family problems. He was in the UK. I was in Pakistan. I would not trade those nights for a cleaner outcome on paper.
