export interface Book {
  title: string;
  author: string;
  image_url: string;
  amazon_url: string;
}

export const booksNovels: Book[] = [
  {
    title: 'A Case of Exploding Mangoes',
    author: 'Mohammed Hanif',
    image_url: 'a-case-of-exploding-mangoes.jpeg',
    amazon_url: 'https://www.amazon.com/Case-Exploding-Mangoes-Mohammed-Hanif/dp/0307388182',
  },
  {
    title: 'The Reluctant Fundamentalist',
    author: 'Mohsin Hamid',
    image_url: 'the-reluctant-fundamentalist.jpeg',
    amazon_url: 'https://www.amazon.com/Reluctant-Fundamentalist-Mohsin-Hamid/dp/0156034026',
  },
];

export const booksSelfHelp: Book[] = [
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    image_url: 'deep-work.png',
    amazon_url: 'https://www.amazon.com/Deep-Work-Focused-Success-Distracted/dp/1455586692',
  },
  {
    title: 'Rework',
    author: 'Jason Fried, David Heinemeier Hansson',
    image_url: 'rework.jpeg',
    amazon_url: 'https://www.amazon.com/Rework-Jason-Fried/dp/0307463745',
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
    title: 'I Will Teach You to be Rich',
    author: 'Ramit Sethi',
    image_url: 'i-will-teach-you-to-be-rich.jpeg',
    amazon_url: 'https://www.amazon.com/Will-Teach-You-Rich-Second-ebook/dp/B07GNXPP4P',
  },
  {
    title: 'The Subtle Art of Not Giving a F*ck',
    author: 'Mark Manson',
    image_url: 'the-subtle-art-of-not-giving-a-fuck.png',
    amazon_url: 'https://www.amazon.com/Subtle-Art-Not-Giving-Counterintuitive/dp/0062457713',
  },
  {
    title: 'Talking to Strangers',
    author: 'Malcolm Gladwell',
    image_url: 'talking-to-strangers.jpeg',
    amazon_url: 'https://www.amazon.com/Talking-Strangers-Should-about-People/dp/0316478520',
  },
];

export const booksTechnical: Book[] = [
  {
    title: 'HTML & CSS',
    author: 'Jon Duckett',
    image_url: 'html-and-css.png',
    amazon_url: 'https://www.amazon.com/HTML-CSS-Design-Build-Websites/dp/1118008189',
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
  },
  {
    title: 'Dive into Python',
    author: 'Mark Pilgrim',
    image_url: 'dive-into-python.png',
    amazon_url: 'https://www.amazon.com/Dive-Into-Python-Mark-Pilgrim/dp/1590593561',
  },
  {
    title: 'Javascript: The Good Parts',
    author: 'Douglas Crockford',
    image_url: 'javascript-the-good-parts.png',
    amazon_url: 'https://www.amazon.com/JavaScript-Good-Parts-ebook/dp/B0026OR2ZY',
  },
  {
    title: 'The Clean Coder',
    author: 'Douglas Crockford',
    image_url: 'the-clean-coder.jpeg',
    amazon_url: 'https://www.amazon.com/Clean-Coder-Conduct-Professional-Programmers/dp/0137081073',
  },
];
