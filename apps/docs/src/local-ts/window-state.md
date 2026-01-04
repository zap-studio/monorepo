# Window State


Local.ts uses the [Tauri window state plugin](https://v2.tauri.app/plugin/window-state/) to automatically remember your window size, position, and state across app restarts.

This creates a polished desktop experience where users don't have to resize their window every time they open the app.

## What Gets Saved

The window state plugin tracks:

| Property | Description |
|----------|-------------|
| Size | Window width and height |
| Position | Window X and Y coordinates |
| Maximized | Whether the window is maximized |
| Fullscreen | Whether the window is in fullscreen |
| Decorations | Whether window decorations are visible |

## How It Works

Window state is saved automatically when the window closes:

```rust
.on_window_event(|window, event| {
    #[cfg(desktop)]
    if let tauri::WindowEvent::CloseRequested { .. } = event {
        let _ = window.app_handle().save_window_state(StateFlags::all());
    }
})
```

On the next launch, the plugin automatically restores the saved state before the window becomes visible.

## Customizing What's Saved

You can choose which properties to persist using `StateFlags`:

```rust
use tauri_plugin_window_state::StateFlags;

.on_window_event(|window, event| {
    if let tauri::WindowEvent::CloseRequested { .. } = event {
        // Only save size and position
        let flags = StateFlags::SIZE | StateFlags::POSITION;
        let _ = window.app_handle().save_window_state(flags);
    }
})
```

Available flags:

| Flag | What It Saves |
|------|---------------|
| `StateFlags::SIZE` | Window dimensions |
| `StateFlags::POSITION` | Window location |
| `StateFlags::MAXIMIZED` | Maximized state |
| `StateFlags::VISIBLE` | Visibility state |
| `StateFlags::DECORATIONS` | Window decorations |
| `StateFlags::FULLSCREEN` | Fullscreen state |
| `StateFlags::all()` | All of the above |

## Excluding Windows from State Tracking

Skip state restoration for specific windows (like the splash screen):

```rust
app.handle().plugin(
    tauri_plugin_window_state::Builder::default()
        .skip(vec!["splashscreen"])
        .build()
)?;
```

## Default Window Size

Set default dimensions in `src-tauri/tauri.conf.json` for first launch before any state is saved:

```json
{
  "windows": [{
    "title": "Local.ts",
    "label": "main",
    "visible": false,
    "width": 1280,
    "height": 720
  }]
}
```

These defaults are used only on first launch.

## Saving State Periodically

Instead of (or in addition to) saving on close, you can save state periodically:

```rust
use std::time::Duration;
use tauri_plugin_window_state::{AppHandleExt, StateFlags};

.setup(|app| {
    let app_handle = app.handle().clone();
    std::thread::spawn(move || {
        loop {
            std::thread::sleep(Duration::from_secs(300)); // 5 minutes
            let _ = app_handle.save_window_state(StateFlags::all());
        }
    });
    Ok(())
})
```

This protects against state loss if the app crashes.

## Removing Window State

If you don't need window state persistence:

1. **Remove the import and plugin** from `src-tauri/src/lib.rs`:

   ```diff
   - use tauri_plugin_window_state::{AppHandleExt, StateFlags};
   ```

   ```diff
   - app.handle()
   -     .plugin(tauri_plugin_window_state::Builder::default().build())?;
   ```

   ```diff
   - .on_window_event(|window, event| {
   -     if let tauri::WindowEvent::CloseRequested { .. } = event {
   -         let _ = window.app_handle().save_window_state(StateFlags::all());
   -     }
   - })
   ```

2. **Remove the dependency** from `src-tauri/Cargo.toml`:

   ```diff
   - tauri-plugin-window-state = "2"
   ```

3. **Remove permissions** from `src-tauri/capabilities/default.json`:

   ```diff
   - "window-state:default"
   ```
