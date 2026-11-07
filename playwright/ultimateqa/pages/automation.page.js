// Locators for the automation practice hub: https://ultimateqa.com/automation

const path = 'automation';

// Practice links on the hub, with the address each one opens
const practiceLinks = [
  { name: 'Big page with many elements', url: /\/complicated-page/ },
  { name: 'Fake Landing Page', url: /\/fake-landing-page/ },
  { name: 'Fake Pricing Page', url: /\/fake-pricing-page/ },
  { name: 'Fill out forms', url: /\/filling-out-forms/ },
  { name: 'Learn how to automate an application that evolves over time', url: /\/sample-application-lifecycle-sprint-1/ },
  { name: 'Login automation', url: /courses\.ultimateqa\.com\/users\/sign_in/ },
  { name: 'Interactions with simple elements', url: /\/simple-html-elements-for-automation/ },
];

module.exports = (page) => {
  const content = page.locator('article');

  return {
    heading: page.getByRole('heading', { name: 'Automation Practice' }),
    practiceLink: (name) => content.getByRole('link', { name, exact: true }),
  };
};

module.exports.path = path;
module.exports.practiceLinks = practiceLinks;
