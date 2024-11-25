---
layout: post
title:  "How We Saved $20,000 Annually in AWS Infrastructure Costs at Tasq.io"
date:   2024-02-24 09:21:00
categories: backend
---

As we scaled at Tasq.io, we started noticing a troubling trend: our AWS costs were climbing, particularly in areas like network traffic, storage, and monitoring. After diving deeper into our infrastructure setup, it became clear that several inefficiencies were driving up costs. The biggest culprits were the NAT Gateway, inefficient S3 storage management, and poorly configured CloudWatch logs. This post explores how I identified these pain points and optimized our infrastructure to reduce costs by $20,000 annually without sacrificing performance or security.

### The Challenge

Managing cloud infrastructure at scale comes with the challenge of optimizing costs without sacrificing performance, availability, or security. At Tasq.io, we faced increasing AWS costs primarily due to:

1. **NAT Gateway Usage**: Our private VPC Lambdas were accessing DynamoDB and S3 through the NAT Gateway, which led to significant data transfer charges.
2. **S3 Storage Mismanagement**: We had redundant data and inefficient storage classes in our S3 buckets, which contributed to higher storage costs.
3. **Excessive CloudWatch Logs**: Our CloudWatch logs were growing uncontrollably, resulting in higher storage and data transfer costs due to inefficient log management.

My task was clear: find areas to optimize without compromising the cloud environment’s performance or security. Here's how I tackled it:

### Action Steps

#### 1. **VPC Endpoint Optimization**

The NAT Gateway was routing traffic from our private VPC Lambdas to DynamoDB and S3 over the public internet, which incurred unnecessary data transfer costs. To fix this, I implemented **Interface VPC Endpoints** for both DynamoDB and S3, which allowed us to route traffic directly over the AWS private network.

- **DynamoDB Endpoint**: com.amazonaws.<region>.dynamodb
- **S3 Endpoint**: com.amazonaws.<region>.s3

This change significantly reduced the amount of traffic going through the NAT Gateway, resulting in savings on data transfer costs. However, the NAT Gateway was still required for some other internet-bound traffic, so it wasn’t eliminated entirely, but its usage was minimized.

#### 2. **S3 Storage Optimization**

S3 costs were another significant pain point. After analyzing our S3 usage, I found that we had unnecessary versioning enabled on many buckets, and there were no lifecycle policies in place to transition older data to lower-cost storage classes.

To optimize:

- I added **lifecycle policies** to move older, infrequently accessed data to **S3 Glacier** or **S3 Infrequent Access**.
- I also cleaned up **unused versions** of objects to reduce unnecessary storage consumption.

These changes led to a **30% reduction in our monthly S3 bills**, as we were now storing data more efficiently and only keeping what we actually needed.

#### 3. **CloudWatch Logs Management**

Our CloudWatch logs were becoming a problem due to excessive logging and a lack of retention policies. This resulted in rapidly growing log data, which increased both storage costs and data transfer fees due to inefficient log management.

To tackle this, I worked with the team to:

- Added **log retention policies** that automatically deleted older logs after **30 days**.
- **Cleaned up unnecessary log streams** that were no longer providing value.
- Enabled **log compression** to reduce the data stored and transferred.

This streamlined log management, reduced storage costs, and cut data transfer expenses.

### The Results

By implementing these optimizations, we achieved substantial cost savings:

- **VPC Interface Endpoints**: By minimizing traffic through the NAT Gateway for DynamoDB and S3, we saved over **$15,000 annually** on data transfer charges.
- **S3 Storage Optimization**: The new lifecycle policies and version cleanup reduced storage costs by over **30%**, saving an additional **$5,000** annually.
- **CloudWatch Logs Management**: The log retention policies, cleanup, and compression led to further savings in both storage and data transfer costs.

In total, these optimizations resulted in a **$20,000 reduction in annual AWS costs**. Not only did we save money, but we also improved the security and performance of our cloud environment. With traffic now routed over the AWS private network, we saw reduced latency and faster data transfer times, ultimately enhancing the overall user experience.


Cloud cost optimization is a continuous process, and it’s essential to regularly evaluate your infrastructure for inefficiencies. By focusing on key areas like VPC endpoints, S3 storage management, and log optimization, we were able to significantly reduce our AWS costs while maintaining a high level of performance and security. This experience reinforced the importance of being proactive about cloud cost management and continuously looking for opportunities to optimize infrastructure as a company scales.

If you're experiencing similar challenges with AWS costs, I hope this post gives you some actionable insights into areas you can optimize. The savings can add up quickly and, more importantly, help ensure that your cloud infrastructure remains scalable and cost-effective.
