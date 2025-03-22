import { Project, SyntaxKind, VariableDeclarationKind } from "ts-morph";
import path from "path";

/**
 * Configures the `auth.ts` file with Drizzle and Polar plugin logic.
 *
 * This function modifies the `auth.ts` file in the specified output directory to include
 * Drizzle adapter and Polar plugin configurations based on enabled plugins. Import
 * statements are added at the top, followed by variables like `database` and `client`
 * between the imports and the `auth` configuration. The `database` property is placed
 * just below `appName` in the `auth` config using shorthand syntax, and `polar` is
 * added as the last plugin in the `plugins` array.
 *
 * @param outputDir - The directory containing the `src/lib/auth-server.ts` file.
 * @param enabledPlugins - An array of enabled plugin names (e.g., ["drizzle-orm", "polar"]).
 *
 * @throws {Error} If the `auth.ts` file or `betterAuth` export cannot be found.
 */
export async function modifyAuth(outputDir: string, enabledPlugins: string[]) {
  const project = new Project();
  const authPath = path.join(outputDir, "src/lib/auth-server.ts");
  const sourceFile = project.addSourceFileAtPath(authPath);

  // Check which plugins are enabled
  const isDrizzleEnabled = enabledPlugins.includes("drizzle-orm");
  const isPolarEnabled = enabledPlugins.includes("polar");

  // Add all import statements first (they'll be grouped at the top by ts-morph)
  if (isDrizzleEnabled) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: "better-auth/adapters/drizzle",
      namedImports: ["drizzleAdapter"],
    });
    sourceFile.addImportDeclaration({
      moduleSpecifier: "@/db",
      namedImports: ["db"],
    });
  }

  if (isPolarEnabled) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: "@polar-sh/better-auth",
      namedImports: ["polar"],
    });
    sourceFile.addImportDeclaration({
      moduleSpecifier: "@polar-sh/sdk",
      namedImports: ["Polar"],
    });
  }

  // Add Polar-related imports and variable
  if (isPolarEnabled) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: "@polar-sh/better-auth",
      namedImports: ["polar"],
    });
    sourceFile.addImportDeclaration({
      moduleSpecifier: "@polar-sh/sdk",
      namedImports: ["Polar"],
    });
  }

  // Find the position after the last import statement (after adding new imports)
  const lastImport = sourceFile.getLastChildByKind(
    SyntaxKind.ImportDeclaration
  );
  let insertPosition = lastImport ? lastImport.getChildIndex() + 1 : 0;

  // Add Polar variable after Drizzle (if present) or imports
  if (isPolarEnabled) {
    const adjustedInsertPosition = isDrizzleEnabled
      ? insertPosition + 1
      : insertPosition;
    sourceFile.insertVariableStatement(adjustedInsertPosition, {
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: "client",
          initializer: (writer) =>
            writer
              .write("new Polar({")
              .newLine()
              .write("  accessToken: process.env.POLAR_ACCESS_TOKEN!,")
              .newLine()
              .write('  server: "production",')
              .newLine()
              .write("})"),
        },
      ],
    });
    insertPosition++;
  }

  // Find the betterAuth export
  const authExport = sourceFile.getVariableDeclaration("auth");
  if (!authExport) {
    throw new Error("auth export not found in auth-server.ts");
  }

  // Add a blank line before the auth export if there are initializers (only client now)
  if (isPolarEnabled) {
    const authIndex = authExport.getChildIndex();
    if (insertPosition < authIndex) {
      sourceFile.insertText(insertPosition, "\n");
    }
  }

  // Update the betterAuth object literal to include database if Drizzle is enabled
  const authInitializer = authExport.getInitializerIfKind(
    SyntaxKind.CallExpression
  );
  if (authInitializer) {
    const objectLiteral = authInitializer
      .getArguments()[0]
      ?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (objectLiteral) {
      if (isDrizzleEnabled) {
        const appNameProperty = objectLiteral.getProperty("appName");
        if (appNameProperty) {
          // Find the appName property and insert database after it
          objectLiteral.insertPropertyAssignment(
            appNameProperty.getChildIndex() + 1,
            {
              name: "database",
              initializer: (writer) =>
                writer
                  .write("drizzleAdapter(db, {")
                  .newLine()
                  .write('  provider: "pg"')
                  .newLine()
                  .write("})"),
            }
          );
        } else {
          // If appName isn't found, add database at the start
          objectLiteral.insertPropertyAssignment(0, {
            name: "database",
            initializer: (writer) =>
              writer
                .write("drizzleAdapter(db, {")
                .newLine()
                .write('  provider: "pg"')
                .newLine()
                .write("})"),
          });
        }
      }
    }
  }

  // Find the plugins array and add polar() if Polar is enabled
  const pluginsProperty = authInitializer
    ?.getArguments()[0]
    ?.asKind(SyntaxKind.ObjectLiteralExpression)
    ?.getProperty("plugins")
    ?.asKind(SyntaxKind.PropertyAssignment)
    ?.getInitializer()
    ?.asKind(SyntaxKind.ArrayLiteralExpression);

  if (pluginsProperty && isPolarEnabled) {
    pluginsProperty.addElement((writer) =>
      writer
        .write("polar({")
        .newLine()
        .write("  client,")
        .newLine()
        .write("  createCustomerOnSignUp: true,")
        .newLine()
        .write("  enableCustomerPortal: true,")
        .newLine()
        .write("  checkout: {")
        .newLine()
        .write("    enabled: true,")
        .newLine()
        .write("    products: [],")
        .newLine()
        .write('    successUrl: "/success?checkout_id={CHECKOUT_ID}",')
        .newLine()
        .write("  },")
        .newLine()
        .write("  webhooks: {")
        .newLine()
        .write("    secret: process.env.POLAR_WEBHOOK_SECRET!,")
        .newLine()
        .write("  },")
        .newLine()
        .write("})")
    );

    // Ensure polar is the last element by reordering if necessary
    const elements = pluginsProperty.getElements();
    const polarElement = elements.find((e) =>
      e.getText().startsWith("polar({")
    );

    if (polarElement && elements.length > 1) {
      const polarIndex = polarElement.getChildIndex();

      if (polarIndex !== elements.length - 1) {
        pluginsProperty.removeElement(polarIndex);
        pluginsProperty.addElement(polarElement.getText());
      }
    }
  }

  // Save the modified file
  await sourceFile.save();
}
