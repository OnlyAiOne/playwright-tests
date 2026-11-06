// Locators for the Resources pages: Blog, HR Guides, HR Compliance Checklist and FAQ.

module.exports = (page) => ({
  heading: (name) => page.getByRole('heading', { name }),

  // Blog (blog.html): one article by its title
  blogArticle: (title) => page.getByRole('heading', { name: title }),

  // HR Compliance Checklist (hr-compliance.html): fades in when scrolled into view
  complianceContactButton: page.locator('a', { hasText: 'Get HR Compliance Consultation' }),

  // FAQ (faq.html): each question with its collapsible answer
  faqItems: page.locator('.accordion-item'),
  faqQuestion: (item) => item.locator('.accordion-button'),
  faqAnswer: (item) => item.locator('.accordion-collapse'),
});

module.exports.paths = {
  blog: 'blog.html',
  hrGuides: 'HR-guide.html',
  hrCompliance: 'hr-compliance.html',
  faq: 'faq.html',
};
