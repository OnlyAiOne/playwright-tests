// Safety net shared by the UltimateQA specs that touch forms.
//
// The practice pages are a live public site. Their contact and login forms send POST
// requests, so every POST to ultimateqa.com is aborted: no message, enquiry or sign-in
// ever reaches the site. Plain page loads (GET) are not affected. Do not remove this.
// Other requests fall back to any earlier route handler, or to the network if none.

async function blockFormPosts(page) {
  await page.route(/ultimateqa\.com/, (route) =>
    route.request().method() === 'POST' ? route.abort() : route.fallback()
  );
}

module.exports = { blockFormPosts };
