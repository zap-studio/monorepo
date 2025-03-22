/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "your_site_url", // ZAP:TODO - change this URL to your site URL
  generateRobotsTxt: true,
};
