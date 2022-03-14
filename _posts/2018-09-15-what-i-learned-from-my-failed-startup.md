---
layout: post
title:  "What I learned from my failed startup"
date:   2018-09-15 23:13:00
categories: chefgalaxy
---
In 2014 I was hired for a small contract on upwork for building a module related to profiles in python flask. I completed the task, my worked was liked and I was given another small contract. After finishing multiple small contracts and getting more and more involved in what was being developed, I was offered an oppurtinity to become a partner and co-founder. I instantly accepted the offer.

It was a startup related to culinary industry named Chef Galaxy. The basic idea of Chef Galaxy was to connect customers with chefs for their events like birthdays, weddings etc, an Upwork for chefs.

After spending 4 years on it, we finally shutdown the server on 23rd August 2018. It FAILED, but I still learned a lot from it. Here is what I learned from it.



## Validate

The first and most important thing is to validate your idea. In our case, as Chef Galaxy was not originally my idea, I am not really sure if my partner had actually validated the whole idea. I joined it when MVP was already being developed and at that time I didn't know much about the idea validation so I just kept my focus on development. Beware that MVP is not needed for idea validation, it can be done even with a simple landing page offering a service which is fully manual behind the scenes. Validating the idea gives you the idea about how big is a market for your product or whether the customer exists at all. Additionally, startups are not about how cool your product is, it is about whether the product is actually solving a problem customers are facing. We should not be building our product for ourselves, but for the customers who are ultimately going to pay for our product. Validating the idea saves a lot of time and money.

### How to validate startup idea? 

Just google it and you will get a lot of results for it. I don't want to paste any links here :)


## Speed

This is one of the most important reasons for Chef Galaxy's failure. I started building Chef Galaxy's MVP in early 2014 and finally launched it on production in late 2016, almost 3 years of development. A MVP should never ever take this long. Development was started keeping in mind MVP but during the course of it we slipped from our trajectory and kept adding features, convincing ourselves that a fully completed product is much better than a not so shiny broken product. By the time we went to the market, our competitors were already in good shape. The thing is, even after launching in 2016 we felt like it was not ready. So we should always jump in before we are ready, fail early, learn from it and iterate over it. Small failures are easily affordable compared to one huge failure where energy to take more risks is already drained.

### Where exactly we wasted so much time ?

1. Adding more and more features like admin panels, dispute resolutions and real time notifications. None of this was necessary for our core functionality.
2. Spent way too much money and time on the look and feel of the product. All icons and graphics were recreated several times and pages layout redesigned multiple times.
3. We also wanted to be a Facebook and Quora for Chefs so a whole new social network around culinary services was developed which should have been a product of its own. Moreover, that is not an innovation and chances for success are tiny for clones. I felt like we were doing too many things and actually tried to resist but maybe I didn't resist enough. I think my resistance was dismissed because I was an engineer and not a business person.


## Money

Save as much money as possible and spend money only on development. This is something I feel we followed as we didn't had any office, bills, or expensive subscriptions but I feel there was a lot of room for improvement. Like if we didn't waste time on the look and feel of the website we would have saved a lot of money we were paying to our graphics designer from Ukraine and Layout designer from China. Additionally, we also had a CSS guy from Pakistan so everytime there was a redesign of a page, we payed our CSS guy too for a rework. All of that was a waste.

Other than that I feel the amount of money we spent on servers was also too much. We had two environments, Test and Production. Test was a simple EC2 instance using an RDS instance with everything installed on the EC2 like Elasticsearch, Celery and Redis but Production was designed to be highly scalable and reliable from the day one where Auto Scaling Group and Load Balancer was configured along with services like VPC, S3, Elasticache and OpenSearch. All of this was charging us around $180 a month and I think it was unnessary. We could have done all of that on a single EC2 instance and then used another tiny one just for testing. 

One more thing that was not needed was registering the company. One can always do it later when the product is profitable. Similarly if you are too tight on a budget then even creating a private Github repo is a waste, one can always use other alternatives like Bitbucket or Gitlab.

In the end, it's always easier to save money than it is to make money.



## Sell

After losing on speed during MVP development, the second most important reason for Chef Galaxy's failure was not being able to sell the product.
We always thought we just have to build and launch it and customers would start signing up. That's not how it works, it didn't matter how cool our product was, only building something is not enough. Infact building a product for engineers like me is most of the time easiest part, selling it is the difficult part. During the develpment we always had discussions on sales, marketing and partnerships and I always thought there were some guys (Founder's wife and wife's friend whom I never met as we all were working remotely and my partner was managing them) working on it. It was only once we launched the product I realized we didn't had any solid plan. I tried to convince my partner on spending some energy on SEO but he never agreed. Relying upon a product to go viral amongst customers if it’s B2C is a little naive.

One thing that my partner realized later and actually wanted to work on but never got a chance because he got some family issues was content creation for educating our target market on our product. I think a good content would definitely had helped us in our SEO too.



## Partner

I think we did a pretty good job in finding partners for Chef Galaxy. During the course of development we let go two persons. One a Business Analyst from Spain and another a database administrator from UK. The reason for letting go the Business Analyst was that instead of focusing on the business she spent way too much energy on the look and feel of the website. That was not her job, there should be a balance in efforts on product and business.

DB administrator was let go because we simply didn't need him. We were already using AWS RDS in addition to other AWS services like VPC, security groups and network firewalls which in combination took care of a lot of things like backups, performance, security and integrity of the data. Moreover these things were not an issue for us because we simply didn't had much data and load on our database. I am a full stack engineer and I was already taking care of the database through Flask Sqlalchemy models, automated management commands to alter the data and using Alembic for data migrations.

Lastly, I was also chosen as a partner by our founder. Now I am not a graduate from a top university in US or UK, though I am a graduate from GIK which considered one of the best Institite in Pakistan, but ofcourse we cannot compare Pakistan's top Institute with that of US. I was also not from our founder's friend circle or someone he knew before. But I was someone who shared a same vision and had a same passion about the product as that of the founder.I was also someone who had skills (software engineer) that the founder didn't had (Finance Manager) and I think these are the things one should look in a partner and co-founder. Together we partnered with another person who was my friend but we didn't make him our partner because he was a friend instead he had skills that I and our founder lacked. He architected our whole infrastructure on AWS and designed it so that it was scalable from day 1 (though as I have already said above it was unnecessary). 

Other things to take into consideration for building a team is trust, honesty, integrity and likeability because when money starts coming in, these attributes can save you a lot of stress. Chef Galaxy never reached the scale where money could create issues.



## Ready for failure

When the product was completed and launched, I moved to another city and got a fulltime job there as I felt I can do the rest of the work for ChefGalxy quite easily in my part time unless of course it becomes viral in which case I could always have resigned from my fulltime job. Now I feel like moving to another city and taking a fulltime job long before I shutdown the server for Chef Galaxy was really a good decision. I think if I was still in the same place working on Chef Galaxy it would have been really hard for me to let it go and it would definitely have taken an emotional and financial toll on me.



In the end I would say despite getting failed, Chef Galaxy has given me so much. Even today in my fulltime job I sometimes apply the technical lessons I learned from Chef Galaxy. Something even more important from the technical stuff is the friendship I made with our founder, it exists to this day. During the course of our journey, we used to have long calls and in those calls it was never always work. Our founder was in UK and I was in Pakistan so we had a lot of topics to disucss from cars, homes, weddings to current affairs like things happening in Iraq, Afghanistan and even Donald Trump. We also used to discuss our family issues and how to handle them. I would never trade those memories for anything.



