# Custom Rules

[**Rules**](https://docs.cursor.com/context/rules) are instructions that guide how the AI operates within your project.

- How the project is structured and how files relate to each other
- Naming strategies
- Preferred libraries, conventions, and architecture

## The Core Rule

In **Zap.ts**, we use one _central_ **Always Rule** that _synthesizes the full architecture and best practices_ defined in the docs—so **Cursor** always understands:

- How to write type-safe APIs
- The naming conventions to follow
- Where to find shared utilities or schemas
- And more...

This rule is meant to _scale with you_; if your architecture evolves, update this rule according to your needs.