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

## Setting up rules

You can add rules and customize them how you like.

Here is where to find each of them.

### Cursor

The `.cursor/rules` folder contains each rule as a `.mdc` file.

### VS Code with GitHub Copilot

You can find it in the `.github/copilot-instructions.md` file.

### Windsurf

There is a `.windsurf/rules` folder in your project root that contains rules as `.md` files.

:::tip
The core rule content remains the same across all editors—only the file location and naming convention differs.
:::