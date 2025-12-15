---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Zap Studio ⚡️"
  tagline: "Building open-source projects to help developers ship faster with confidence."
  # image:
    # light: /code-light.png
    # dark: /code-dark.png
    # alt: Zap Studio Code Snippet
  actions:
    - theme: brand
      text: Introduction
      link: /introduction
    - theme: alt
      text: About
      link: /about

features:
  - title: Zap.ts
    icon: "⚡️"
    details: A production-grade monorepo starter kit to ship quickly and securely.
    link: ./zap-ts

  - title: "@zap-studio/fetch"
    icon: "📡"
    details: A lightweight, type-safe fetch wrapper with built-in validation and error handling.
    link: ./packages/fetch

  - title: "@zap-studio/permit"
    icon: "🔐"
    details: A type-safe, declarative authorization library with Standard Schema support.
    link: ./packages/permit

  - title: "@zap-studio/waitlist"
    icon: "⏳"
    details: A simple waitlist management solution for your applications.
    link: ./packages/waitlist

  - title: "@zap-studio/webhooks"
    icon: "🪝"
    details: A robust webhook handling library with signature verification.
    link: ./packages/webhooks

---
