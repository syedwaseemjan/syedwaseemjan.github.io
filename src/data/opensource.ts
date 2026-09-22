export interface OpenSourceProject {
  id: string;
  title: string;
  link: string;
  details: string;
}

export const openSource: OpenSourceProject[] = [
  {
    id: 'deferjob',
    title: 'deferjob',
    link: 'https://github.com/syedwaseemjan/deferjob',
    details:
      'Durable delayed jobs in Postgres. Schedule work months ahead as a row you can query, cancel, and move, and a worker claims it with SKIP LOCKED. The longer version is <a href="/blog/scheduling-months-ahead-without-celery">Scheduling work months ahead</a>.',
  },
  {
    id: 'natpath',
    title: 'natpath',
    link: 'https://github.com/syedwaseemjan/natpath',
    details:
      'A read-only command that shows which private subnets still send S3 and DynamoDB through a NAT gateway, because the free gateway endpoints are missing. That path was most of the bill in <a href="/blog/saving-aws-costs-at-tasq">Cutting $20k a year from our AWS bill at Tasq</a>.',
  },
  {
    id: 'filtered-fanout',
    title: 'filtered-fanout',
    link: 'https://github.com/syedwaseemjan/filtered-fanout',
    details:
      'A Python CDK construct. One SNS topic, several SQS queues, each with a filter and its own dead-letter queue, so one slow worker does not stall the others.',
  },
  {
    id: 'pixindex',
    title: 'pixindex',
    link: 'https://github.com/syedwaseemjan/pixindex',
    details:
      'Indexes pictures in a folder or an S3 bucket. Search by camera, date, and GPS, or by what the picture shows. Find copies of the same shot. The pictures stay where they are.',
  },
  {
    id: 'cookiecutter-flask-layout',
    title: 'cookiecutter-flask-layout',
    link: 'https://github.com/syedwaseemjan/cookiecutter-flask-layout',
    details:
      'A cookiecutter for a Flask app split into API routes, pages, models, and services. Views call services. Services and models do not import Flask. Production will not boot without a secret and a Postgres URL.',
  },
];
