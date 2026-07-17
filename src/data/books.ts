export interface Book {
  title: string;
  author: string;
  image_url: string;
  amazon_url: string;
  /** Short personal take. Leave off for most books. */
  note?: string;
}

export const booksTechnical: Book[] = [
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    image_url: 'designing-data-intensive-applications.jpg',
    amazon_url:
      'https://www.amazon.com/Designing-Data-Intensive-Applications-Reliable-Maintainable/dp/1449373321',
    note: 'The book I point people to when they ask how databases, queues, and logs actually fit together.',
  },
  {
    title: 'Head First Design Patterns',
    author: 'Eric Freeman, Elisabeth Robson',
    image_url: 'head-first-design-patterns.jpg',
    amazon_url: 'https://www.amazon.com/Head-First-Design-Patterns-Brain-Friendly/dp/0596007124',
    note: 'The only patterns book that did not put me to sleep. The drawings help more than they should.',
  },
  {
    title: 'Code Complete',
    author: 'Steve McConnell',
    image_url: 'code-complete.jpeg',
    amazon_url: 'https://www.amazon.com/Code-Complete-Practical-Handbook-Construction/dp/0735619670',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    image_url: 'clean-code.jpeg',
    amazon_url: 'https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882',
    note: 'I argue with parts of it, but it still shows up in how I read other people\'s pull requests.',
  },
  {
    title: 'The Clean Coder',
    author: 'Robert C. Martin',
    image_url: 'the-clean-coder.jpeg',
    amazon_url: 'https://www.amazon.com/Clean-Coder-Conduct-Professional-Programmers/dp/0137081073',
  },
  {
    title: 'Dive into Python',
    author: 'Mark Pilgrim',
    image_url: 'dive-into-python.png',
    amazon_url: 'https://www.amazon.com/Dive-Into-Python-Mark-Pilgrim/dp/1590593561',
    note: 'How I properly learned Python after years of just getting by.',
  },
  {
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    image_url: 'javascript-the-good-parts.png',
    amazon_url: 'https://www.amazon.com/JavaScript-Good-Parts-ebook/dp/B0026OR2ZY',
  },
  {
    title: 'HTML & CSS',
    author: 'Jon Duckett',
    image_url: 'html-and-css.png',
    amazon_url: 'https://www.amazon.com/HTML-CSS-Design-Build-Websites/dp/1118008189',
  },
];

export const booksNonfiction: Book[] = [
  {
    title: 'Rework',
    author: 'Jason Fried, David Heinemeier Hansson',
    image_url: 'rework.jpeg',
    amazon_url: 'https://www.amazon.com/Rework-Jason-Fried/dp/0307463745',
    note: 'Short enough to reread. I kept it nearby while building Chef Galaxy.',
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    image_url: 'deep-work.png',
    amazon_url: 'https://www.amazon.com/Deep-Work-Focused-Success-Distracted/dp/1455586692',
    note: 'Easier to agree with than to practice. I still try.',
  },
  {
    title: "Don't Make Me Think",
    author: 'Steve Krug',
    image_url: 'dont-make-me-think.jpeg',
    amazon_url: 'https://www.amazon.com/Dont-Make-Think-Revisited-Usability/dp/0321965515',
  },
  {
    title: 'The Power of Habit',
    author: 'Charles Duhigg',
    image_url: 'the-power-of-habit.jpeg',
    amazon_url: 'https://www.amazon.com/Power-Habit-What-Life-Business/dp/081298160X',
  },
  {
    title: 'I Will Teach You to Be Rich',
    author: 'Ramit Sethi',
    image_url: 'i-will-teach-you-to-be-rich.jpeg',
    amazon_url: 'https://www.amazon.com/Will-Teach-You-Rich-Second-ebook/dp/B07GNXPP4P',
    note: 'Practical money advice without the lecture.',
  },
  {
    title: 'Talking to Strangers',
    author: 'Malcolm Gladwell',
    image_url: 'talking-to-strangers.jpeg',
    amazon_url: 'https://www.amazon.com/Talking-Strangers-Should-about-People/dp/0316478520',
  },
  {
    title: 'The Subtle Art of Not Giving a F*ck',
    author: 'Mark Manson',
    image_url: 'the-subtle-art-of-not-giving-a-fuck.png',
    amazon_url: 'https://www.amazon.com/Subtle-Art-Not-Giving-Counterintuitive/dp/0062457713',
  },
];

export const booksNovels: Book[] = [
  {
    title: 'A Case of Exploding Mangoes',
    author: 'Mohammed Hanif',
    image_url: 'a-case-of-exploding-mangoes.jpeg',
    amazon_url: 'https://www.amazon.com/Case-Exploding-Mangoes-Mohammed-Hanif/dp/0307388182',
    note: 'Funny and dark. Felt close to home in a way few novels do.',
  },
  {
    title: 'The Reluctant Fundamentalist',
    author: 'Mohsin Hamid',
    image_url: 'the-reluctant-fundamentalist.jpeg',
    amazon_url: 'https://www.amazon.com/Reluctant-Fundamentalist-Mohsin-Hamid/dp/0156034026',
  },
];
