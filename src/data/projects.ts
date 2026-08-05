export interface WorkRole {
  kind?: 'role';
  /** Anchor target, so other pages can deep link to this entry */
  id: string;
  title: string;
  link: string | null;
  period: string;
  role: string;
  details: string;
  thumbnail: string;
  thumbnailalt: string;
  /** Real screenshot vs illustrative mark */
  visual: 'photo' | 'mark';
}

export interface WorkGap {
  kind: 'gap';
  /** Anchor target, so other pages can deep link to this entry */
  id: string;
  period: string;
  details: string;
}

export type Project = WorkRole | WorkGap;

export const projects: Project[] = [
  {
    id: 'xtel',
    title: 'XTEL',
    link: 'https://xtech.ai/',
    period: 'Aug 2025 - Present',
    role: 'Lead Software Engineer',
    details:
      "These days I work on a platform that helps consumer goods companies plan promotions and pricing. My corner of it sits between the models and the optimizer. I check that predictions are sane before they shape a plan, catch bad configuration early, and slowly replace older APIs without breaking the workflows people already rely on. A lot of the job is making a complicated pipeline fail clearly instead of mysteriously.",
    thumbnail: '/assets/img/projects/xtel-small.jpg',
    thumbnailalt: 'XTEL promo calendar and plan optimization',
    visual: 'photo',
  },
  {
    kind: 'gap',
    id: 'career-break',
    period: 'May 2024 - Aug 2025',
    details:
      'Took a break after almost a decade of remote work. Time to relax, and to sharpen skills by reading books and blogs and watching videos. Then came back at XTEL.',
  },
  {
    id: 'tasq',
    title: 'Tasq.io',
    link: 'https://www.tasq.io/',
    period: 'Nov 2022 - May 2024',
    role: 'Senior Full Stack Engineer',
    details:
      'Oil and gas operators used Tasq to watch equipment, spot odd behavior, and automate the follow-up. I led a small team of three and spent most of my time on the backend. That meant speeding up slow APIs, folding a pile of separate services into one repo we could actually reason about, and trimming about $20k a year off our AWS bill. I wrote about the <a href="/blog/migration-to-polylith">repo consolidation</a>, the <a href="/blog/bringing-structure-to-repos">PR guidelines</a>, and the <a href="/blog/saving-aws-costs-at-tasq">cost work</a> if you want the longer versions.',
    thumbnail: '/assets/img/projects/tasq-small.jpg',
    thumbnailalt: 'Tasq AI well monitoring dashboard',
    visual: 'photo',
  },
  {
    id: 'britecore',
    title: 'BriteCore',
    link: 'https://britecore.com/',
    period: 'May 2018 - June 2022',
    role: 'Senior Full Stack Engineer',
    details:
      'Four years on a cloud platform used by property and casualty insurers to configure policies and coverage, eventually more than a hundred companies. I hired and led the group that built BriteLines, a product definition service and rating engine. The win I still remember is a cache job for large risks that used to run for 23 minutes and time out. We got it down to about 12 seconds on Lambda. I wrote about the <a href="/blog/britelines-cache-generation">cache speedup</a> and the <a href="/blog/too-many-lambdas-one-database">Lambda stampede on MySQL</a>.',
    thumbnail: '/assets/img/projects/britelines-small.jpg',
    thumbnailalt: 'BriteLines policy types configuration',
    visual: 'photo',
  },
  {
    id: 'artstor',
    title: 'Active Capital / Artstor',
    link: 'https://www.artstor.org/',
    period: 'Jan 2017 - Dec 2017',
    role: 'Senior Software Engineer',
    details:
      'A digital asset platform used by universities, museums, and libraries to manage and share large image collections. I spent most of the year on DevOps and mentoring two developers. Moving deployments onto Docker cut downtime from roughly eight hours to one, and a lot of the rest was Nginx, monit, cron, and small scripts that kept the machines honest. Longer version of the <a href="/blog/docker-cut-deploy-downtime">Docker deploy work</a> is on the blog.',
    thumbnail: '/assets/img/projects/artstor-small.png',
    thumbnailalt: 'Artstor Vocabulary Warehouse',
    visual: 'photo',
  },
  {
    id: 'chef-galaxy',
    title: 'Chef Galaxy',
    link: null,
    period: 'Jan 2015 - Dec 2016',
    role: 'Co-founder & sole engineer',
    details:
      'A marketplace where people could find and hire chefs for dinners, catering, and events. I built the whole thing, from the Flask backend and frontend to the database and the AWS setup underneath. It never really took off, but failing at my own product taught me more than a lot of jobs that went fine. I wrote about that in <a href="/blog/what-i-learned-from-my-failed-startup">Four years on Chef Galaxy</a>, and about the <a href="/blog/chefgalaxy-aws-architecture">AWS setup</a>.',
    thumbnail: '/assets/img/projects/chef-galaxy-small.png',
    thumbnailalt: 'Chef Galaxy',
    visual: 'photo',
  },
  {
    id: 'crossover',
    title: 'Crossover',
    link: null,
    period: 'Jun 2012 - May 2015',
    role: 'Software Engineer',
    details:
      'My first full-time role was a dashboard that showed automated test results, code quality, and coverage across a couple hundred products. Mostly ExtJS, custom themes, infinite-scroll grids, heat maps, and yes, Internet Explorer support, which was still a real requirement then.',
    thumbnail: '/assets/img/projects/crossover.svg',
    thumbnailalt: 'Illustration for test-results dashboard work at Crossover',
    visual: 'mark',
  },
];
