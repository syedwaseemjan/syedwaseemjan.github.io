---
title:  "Cutting $20k a year from our AWS bill at Tasq"
date: 2024-02-24T09:21:00
categories:
  - backend
---

At Tasq the AWS bill kept climbing as we grew. Nothing dramatic day to day, just a steady rise that got hard to ignore. Most of it sat in network traffic, storage, and monitoring. I dug into the invoices and the setup behind them, and three things kept showing up. Private VPC Lambdas were reaching DynamoDB and S3 through the NAT Gateway. S3 had versioning and storage classes that no longer matched how we used the data. CloudWatch logs had no real retention story, so they just kept growing.

I was asked to bring the cost down without making the system slower or less secure. What follows is what I actually changed.


#### **Where the money was going**

The NAT Gateway was the loudest line item. Lambdas in the private VPC talked to DynamoDB and S3 the long way, out through the gateway and back in. That path works, but you pay for every byte that takes it. On S3, a lot of buckets still had versioning on and no lifecycle rules, so old object versions and cold data sat in the expensive class. CloudWatch was similar. We logged a lot, kept it forever, and paid for both the storage and the transfer.

None of this looked wrong when we first set it up. It just stopped being the right setup once traffic and data volume grew.


#### **Routing DynamoDB and S3 over the private network**

I added Gateway VPC Endpoints for DynamoDB and S3 so the Lambdas could reach those services on the AWS private network instead of through the NAT Gateway. Gateway endpoints for those two services have no hourly or per-GB charge of their own, which is why this change paid off so cleanly.

The endpoints were the usual ones for the region, `com.amazonaws.<region>.dynamodb` and `com.amazonaws.<region>.s3`.

Traffic through the NAT Gateway dropped a lot after that. We still needed the gateway for some other outbound internet traffic, so it stayed, but it stopped being the path for our heaviest DynamoDB and S3 calls. That DynamoDB and S3 traffic alone had been costing us over **$15,000 a year** in NAT data processing. After the gateway endpoints, that line went to essentially **nothing**. Keeping the traffic on the private network also shaved some latency off those calls.


#### **Cleaning up S3**

S3 was next. After looking at what we actually accessed, I turned on lifecycle policies so older, rarely touched data moved to S3 Infrequent Access or Glacier. I also cleared unused object versions that we had no reason to keep.

S3 had been around **$10,000 a year**. After the cleanup it settled near **$7,000**, about a **30%** drop, or roughly **$3,000** saved.


#### **Putting limits on CloudWatch logs**

Logs were the quiet cost. We had too much of them and no cleanup. With the team, I set retention so older logs were deleted after 30 days, removed log streams that were no longer useful, and turned on compression where it helped.

CloudWatch logs had been around **$3,500 a year**. After retention and cleanup that landed near **$1,500**, so about **$2,000** saved. Nothing fancy, just stop keeping what nobody reads.


#### **What it added up to**

Across the three changes, we cut about **$20,000 a year** from the AWS bill. Most of that came from getting DynamoDB and S3 off the NAT Gateway. Performance and security were better for it too, mainly because that traffic no longer left the private network.

I still check the bill when something grows. Costs drift if you set things once and walk away. The useful part of this work for me was learning to read the invoice against the architecture, then fix the mismatch instead of accepting it as the price of scaling.

If your AWS spend is climbing for the same reasons, start with NAT traffic to managed services, S3 lifecycle and versioning, and log retention. Those three were enough for us.
