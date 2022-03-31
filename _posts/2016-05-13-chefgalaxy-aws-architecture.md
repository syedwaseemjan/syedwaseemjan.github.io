---
layout: post
title:  "Chef Galaxy's AWS architecture explained"
date:   2016-05-13 12:43:00
categories: AWS chefgalaxy
---

Chef Galaxy(Co-founded by me) is a website that connects customers with chefs for their events like birthdays and weddings, in other words, it's an **Upwork** for foodies. It also provides a social network for foodies, in other words, it's a **Facebook** for foodies. Additionally, it has a knowledge engine where customers can ask questions related to food and professional chefs can provide answers, in other words, it's a **Quora** for foodies.

**Some of its core modules include:**
1. Event cost calculator based on the dishes selected (Based on its properties like ingredients, Main Course, Organic, etc) and chef hired (Based on properties like Experience, Education, Rank, Location, etc). 
2. Chef Rank calculator based on his/her education, experience, language skills, feedback score, activity score, reliability score.
3. Automated disputes resolution between chefs and customers.


**Tech stack:**
1. Our web application is built in **Python Flask**. 
2. **Celery** tasks are used for scheduling customer orders, payments, dispute resolutions, etc.
3. Frontend is simple **Jinja** templates using **Jquery**, **Bootstrap** and vanilla **Javascript**. 
4. Database is **Postgres** and **Redis** cache is used for notifications and as a Celery messaging queue.
5. **Elasticsearch** for advance searching for dishes, chefs, and also for searching some items in the knowledge section.
6. And of course, everything is deployed on **AWS**.
7. For logs, we are using Sentry.


#### Here is how our AWS architecture looks

<img src="/assets/img/posts/chefgalaxy-aws-architecture/img-1.png" alt="Detailed AWS Deployment design" />

In order to provide a reliable, secure, and highly available service to our customers we have deployed our product in AWS using a **3-tier architecture**. 

> A three-tier architecture is a software architecture pattern where the application is broken down into three logical tiers: the presentation layer, the business logic layer, and the data storage layer

**Presentation** layer is the public layer, any infrastructure hosted inside it is directly accessible to the public. Users can directly interact with it. Other layers i-e **Business logic** layer and the **Data storage** layer are private layers, they are not directly accessible to the users. Users can interact with them with the help of a proxy server (Bastion server) hosted inside the public layer.

Every layer is made of subnets and subnets are made public or private but before we go to the definition of the subnet, let's also discuss Availability Zones.

> Availability Zones are physical data centers in distinct locations within an AWS Region that are engineered to be isolated from failures in other Availability Zones.

In order to make our application highly available, we have hosted it in two Availability Zones. The two availability zones selected for Chef Galaxy are `us-east-1a` and `us-east-1b`. This makes our system highly available and redundant because if one of the availability zones goes down or fails, customers' requests will be redirected to the other one.

Each Availability Zone is divided into three layers with the help of three subnets.

> A subnet is a range of IP addresses. You can attach AWS resources, such as EC2 instances and RDS DB instances, to subnets. You can create subnets to group instances together according to your security and operational needs.

The two subnets in the first layer in each AZ are made public by attaching them to the Internet Gateway. It is attached to the Internet Gateway through a Route Table.
Subnets in the second and third layers are made private by just **NOT** attaching them to the Internet Gateway, though we have attached the subnets in the second layer to the Nat Gateway. Nat Gateway is used to give internet and other AWS services access to applications hosted in private subnets, for example, to update Linux libraries or access S3 on an EC2 instance, but still preventing unsolicited inbound connections from the Internet. Our third subnet has no inbound or outbound internet connectivity because it doesn't need one. We will explain it in a bit.

Let's go through each layer one by one.

### Our Presentation layer:

Our presentation layer consists of AWS elastic load balancer. It has a public endpoint that users can call directly. ELB is responsible for equally distributing the customer requests between our EC2 hosted applications in the second layer in two Availability Zones. ELB can automatically scale to handle the increased workload. We are also using default health checks so that ELB can send requests only to healthy EC2 instances. Additionally, it is also responsible for decrypting our HTTPS requests.

We also have an OpenVPN EC2 instance in our `us-east-1a` public subnet to give us access to our application servers, database, and Redis cache.


### Our Business layer:

Our business layer has two Auto Scaling Groups configured across both Availability Zones for our Flask app and Elasticsearch. App ASG is configured to maintain at the minimum two EC2 instances, one in each availability zone but if one of the AZ is out of service, it will create all instances in the same AZ. It has a target tracking policy to increase the number of EC2 instances based on the CPU usage of existing EC2 instances. Everything required to run the Python Flask based application on the EC2 instance is installed on the run through launch configuration and user data.

Elasticsearch ASG is configured to maintain at the minimum 1 EC2 instance. These instances are accessed through Route53's private hosted zone. The reason for hosting Elasticsearch ourselves instead of using AWS service for Elasticsearch is that we are using some groovy scripts in our queries for some advance searching which involves location and distance finding and dynamic scripts are not supported yet in AWS Elasticsearch service.

Our Celery workers also run along with our Flask application on the same EC2 instance.

The security group on the EC2 instance allows inbound traffic from within the VPC on Port 22 to allow us to SSH into them through our OpenVPN instance in a public subnet.


### Our Database layer:

In addition to the RDS Postgres instance, our database subnet also contains an Elasticache instance. **RDS** has a standby instance in `us-east-1b`, and **Elasticache** has a read replica in `us-east-1b`. Both of them cannot access the internet but it's not needed as AWS is responsible for all the security patches and updates. Though the infrastructure in this layer cannot access the internet but this infrastructure can be accessed from the outside world through the OpenVPN instance in our public subnet.

#### Can we make any improvements to this architecture?
O yes, of course. There is a lot of room for improvement.

1. Using Secret Manager to store DB password. Currently, we are using an environment variable. 
2. Instead of using celery for scheduling future events, either use Cloudwatch events or DynamoDB TTL.
3. Instead of using EC2 for application, try ECS (Elastic Container Service) or Lambda.
4. Use AWS Elasticsearch Domain when it supports dynamic scripting instead of our own cluster.

