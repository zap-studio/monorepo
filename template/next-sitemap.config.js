/** @type {import('next-sitemap').IConfig} */
const { SITE_URL } = process.env;

module.exports = {
  siteUrl: SITE_URL || "http://localhost:3000",
  changefreq: "daily",
  priority: 0.7,
  generateRobotsTxt: true,
  exclude: ["/server-sitemap-index.xml", "/404", "/admin/**", "/api/**"],
  alternateRefs: [
    {
      href: SITE_URL || "http://localhost:3000",
      hreflang: "en",
    },
    {
      href: `${SITE_URL || "http://localhost:3000"}/fr`,
      hreflang: "fr",
    },
    {
      href: `${SITE_URL || "http://localhost:3000"}/pt`,
      hreflang: "pt",
    },
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    additionalSitemaps: [`${SITE_URL}/server-sitemap-index.xml`],
  },
};
