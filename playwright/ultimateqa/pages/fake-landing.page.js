// Locators for the fake landing page: https://ultimateqa.com/fake-landing-page

const path = 'fake-landing-page';

const courseCategories = [
  'Web Development',
  'Python',
  'UX Design',
  'Database Design',
  'Javascript',
  'HTML & CSS',
  'Intro to Coding',
  'Apps & Games',
];

const benefits = ['Become an expert', 'Learn by Doing', 'Build your portfolio', 'Achieve your goals'];

const callToActions = ['View Courses', 'View All Courses', 'Contact Us', 'Create Account'];

module.exports = (page) => {
  const content = page.locator('article');

  return {
    heroHeading: content.getByRole('heading', { name: 'Learn to Code Websites, Apps & Games' }),
    heading: (name) => content.getByRole('heading', { name, exact: true }).first(),
    button: (name) => content.locator('a.et_pb_button').filter({ hasText: new RegExp(`^\\s*${name}\\s*$`) }).first(),
  };
};

module.exports.path = path;
module.exports.courseCategories = courseCategories;
module.exports.benefits = benefits;
module.exports.callToActions = callToActions;
