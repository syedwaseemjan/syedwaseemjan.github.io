---
title:  "How I host Chef Galaxy on AWS"
date: 2016-05-13T12:43:00
categories:
  - aws
  - chefgalaxy
---

I co-founded Chef Galaxy. It connects customers with chefs for events like birthdays and weddings. Think of it as an Upwork for hiring a chef. We also have a social feed around food and a Q&A section where people ask food questions and chefs answer. That is a lot of surface area for a young product, and all of it has to live somewhere.

A few pieces of the product drive most of the backend work.

1. An event cost calculator based on the dishes selected (ingredients, main course, organic, and so on) and the chef hired (experience, education, rank, location).
2. A chef rank calculator based on education, experience, language skills, feedback score, activity score, and reliability score.
3. Automated dispute resolution between chefs and customers.

The web app is **Python Flask**. **Celery** handles scheduled work like orders, payments, and dispute flows. The frontend is **Jinja** templates with **jQuery**, **Bootstrap**, and plain **JavaScript**. Data lives in **Postgres**. **Redis** handles notifications and acts as the Celery broker. **Elasticsearch** covers search across dishes, chefs, and the knowledge section. Errors go to Sentry. The whole thing runs on **AWS**.

#### What the AWS layout looks like

<img src="/assets/img/posts/chefgalaxy-aws-architecture/img-1.png" alt="Detailed AWS Deployment design" />

We deploy it as a **three-tier architecture** on AWS. The presentation layer is public. The business layer and the data layer are private. Users never talk to those private layers directly. When we need to reach them ourselves, we come in through an **OpenVPN** instance in the public layer.

For availability we run across two Availability Zones, `us-east-1a` and `us-east-1b`. If one zone fails, traffic can keep going through the other.

Each zone has three subnets, one per layer. The public subnets are attached to an Internet Gateway through their route tables. The business-layer subnets stay private but reach the internet through a **NAT Gateway**, enough for package updates and calls to services like S3, without taking unsolicited inbound traffic from the internet. The data-layer subnets have no internet path. Managed services there do not need one.

#### Presentation layer

This layer holds the **Elastic Load Balancer**. It exposes a public endpoint, terminates HTTPS, and spreads requests across the app instances in both zones. Default health checks keep unhealthy instances out of rotation. The same public subnet in `us-east-1a` also holds the OpenVPN instance we use to reach app servers, the database, and Redis.

#### Business layer

Two **Auto Scaling Groups** span both zones, one for the Flask app and one for Elasticsearch. The app group keeps at least two EC2 instances, ideally one in each zone. If a zone goes down, ASG can place both in the remaining zone. A target tracking policy adds instances when CPU climbs. Launch configurations and user data install what the Flask app needs on boot.

**Celery** workers run on the same EC2 instances as Flask. That is enough for our size.

The Elasticsearch group keeps at least one instance. We reach it through a Route 53 private hosted zone. We run our own cluster instead of AWS Elasticsearch Service because our queries use Groovy scripts for location and distance work, and dynamic scripting is not supported on the managed service yet.

Security groups on the app instances allow SSH from inside the VPC on port 22 so we can reach them through OpenVPN.

#### Data layer

This layer holds **RDS Postgres** and **ElastiCache Redis**. RDS has a standby in `us-east-1b`. ElastiCache has a replica in `us-east-1b` as well. Neither needs internet access. AWS handles patching for those services. We can still reach them from our side through the OpenVPN instance when we have to.

#### What I would change

There is plenty of room to improve.

1. Store the DB password in **Secrets Manager** instead of an environment variable.
2. For scheduling future events, look at CloudWatch Events or DynamoDB TTL instead of leaning so hard on Celery.
3. Move the app off bare EC2 toward ECS or Lambda.
4. Switch to the managed Elasticsearch service once it supports the dynamic scripting we need.

I built this setup myself. Some of it is bigger than we need today. Still, putting a real multi-AZ, auto-scaled VPC together end to end teaches you more than any diagram ever will.
