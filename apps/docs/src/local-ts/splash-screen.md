# Splash Screen

Local.ts includes a splash screen that displays while your app initializes. This creates a polished first impression and prevents users from seeing an empty window during startup.

## How It Works

The splash screen uses Tauri's multi-window feature:

1. **On launch** — The splash screen window shows immediately while the main window stays hidden
2. **During initialization** — Your app loads settings, connects to the database, and sets up stores
3. **When ready** — The splash closes and the main window appears

This ensures users see a branded loading experience instead of a blank window.

## Window Configuration

The windows are defined in `src-tauri/tauri.conf.json`:

```json
{
  "windows": [
    {
      "title": "Local.ts",
      "label": "main",
      "visible": false,
      "width": 1280,
      "height": 720,
      "center": true
    },
    {
      "title": "Loading...",
      "label": "splashscreen",
      "url": "splash.html",
      "width": 1280,
      "height": 720,
      "center": true,
      "decorations": false
    }
  ]
}
```

Note that `main` has `visible: false` so it stays hidden until initialization completes.

## Closing the Splash Screen

The `close_splashscreen` command in Rust closes the splash and shows the main window:

```rust
#[tauri::command]
pub fn close_splashscreen(window: tauri::Window) {
    if let Some(splash) = window.get_webview_window("splashscreen") {
        let _ = splash.close();
    }
    if let Some(main) = window.get_webview_window("main") {
        let _ = main.show();
        let _ = main.set_focus();
    }
}
```

This is called from the React `StoreInitializer` component after all initialization completes:

```typescript
useEffect(() => {
  const init = async () => {
    try {
      await initializeSettings();
      initializeTheme();
      setIsInitialized(true);

      // Close splash screen and show main window
      await invoke("close_splashscreen");
    } catch (err) {
      console.error("Failed to initialize:", err);
      setError(err);

      // Still close splash on error to show error UI
      await invoke("close_splashscreen").catch(console.error);
    }
  };

  init();
}, []);
```

## Customizing the Splash Screen

To customize the splash screen, modify `splash.html` located at your project root. Here is the default template:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="/src/styles/globals.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Loading...</title>
  </head>
  <body>
    <div class="container flex flex-col items-center justify-center h-screen">
      <h1 class="text-2xl font-bold text-foreground">Local.ts</h1>
      <p class="mt-2 text-muted-foreground">
        A starter kit for building local-first applications
      </p>
    </div>
  </body>
</html>
```

## Changing Splash Window Size

In `tauri.conf.json`:

```json
{
  "label": "splashscreen",
  "url": "splash.html",
  "width": 400,
  "height": 300,
  "center": true,
  "decorations": false
}
```

Setting `decorations: false` removes the window title bar for a cleaner look.

## Removing the Splash Screen

If you prefer to show the main window immediately:

1. **Update `tauri.conf.json`**:

   ```diff
     "windows": [
       {
         "title": "Local.ts",
         "label": "main",
   -     "visible": false,
   +     "visible": true,
         "width": 1280,
         "height": 720
       },
   -   {
   -     "title": "Loading...",
   -     "label": "splashscreen",
   -     "url": "splash.html",
   -     "width": 1280,
   -     "height": 720
   -   }
     ]
   ```

2. **Delete `splash.html`**

3. **Remove the window command** — Delete `src-tauri/src/commands/window.rs`

4. **Update commands module** — Remove the export from `src-tauri/src/commands/mod.rs`

5. **Unregister the command** from `src-tauri/src/lib.rs`:

   ```diff
   .invoke_handler(tauri::generate_handler![
       commands::settings::get_app_settings,
       commands::settings::update_app_settings,
       commands::settings::set_tray_visible,
   -   commands::window::close_splashscreen,
   ])
   ```

6. **Remove the invoke call** from `src/components/store-initializer.tsx`:

   ```diff
   - await invoke("close_splashscreen");
   ```

## Learn More

Learn more about [Tauri splash screens](https://v2.tauri.app/learn/splashscreen/) by checking the official documentation.
