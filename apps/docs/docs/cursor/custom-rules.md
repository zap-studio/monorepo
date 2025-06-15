# Custom Rules

[**Rules**](https://docs.cursor.com/context/rules) are instructions that guide how the AI operates within your project.

- Preferred libraries, conventions, and architecture
- Naming strategies
- How the project is structured and how files relate to each other

## The Core Rule

In **Zap.ts**, we use one _central_ **Always Rule** that _synthesizes the full architecture and best practices_ defined in the docs—so **Cursor** always understands:

- Where to find shared utilities or schemas
- How to write type-safe APIs
- The naming conventions to follow
- And more...

This rule is meant to _scale with you_; if your architecture evolves, update this rule according to your needs.