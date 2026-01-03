# Sidebar Navigation

Local.ts includes a pre-made sidebar component that's entirely customizable. It exists to help you start building faster, but you can modify or replace it completely to match your app's needs.

## Customizing Sidebar Links

The sidebar navigation is configured in `src/constants/sidebar.ts`. This file exports two arrays that define the items shown at the top and bottom of the sidebar.

### Basic Structure

```typescript
import { Home, Settings } from "lucide-react";
import type { SidebarItem } from "@/components/ui/sidebar/sidebar-nav-item";

export const SIDEBAR_TOP_ITEMS: SidebarItem[] = [
  { icon: Home, label: "Home", href: "/" },
];

export const SIDEBAR_BOTTOM_ITEMS: SidebarItem[] = [
  { icon: Settings, label: "Settings", href: "/settings" },
];
```

Each `SidebarItem` has three properties:

| Property | Type | Description |
|----------|------|-------------|
| `icon` | `LucideIcon` | A Lucide React icon component |
| `label` | `string` | Display name shown in the sidebar |
| `href` | `string` | Route path (must match a route in `src/routes/`) |

## Adding New Links

To add a new sidebar item:

### 1. Import the Icon

Choose an icon from [Lucide Icons](https://lucide.dev/icons/) and import it:

```typescript
import { Home, Settings, Users, Activity } from "lucide-react";
```

### 2. Add the Item

Add the new item to either `SIDEBAR_TOP_ITEMS` or `SIDEBAR_BOTTOM_ITEMS`:

```typescript
export const SIDEBAR_TOP_ITEMS: SidebarItem[] = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Activity, label: "Dashboard", href: "/dashboard" },
];
```

### 3. Create the Corresponding Route

Make sure the route exists in your `src/routes/` directory. For example, for `/dashboard`, create:

```
src/routes/dashboard.tsx
```

::: tip
The sidebar automatically highlights the active route based on the current URL.
:::

## Ordering Items

Items appear in the order they're defined in the array:

- **Top items** — Primary navigation links (top of sidebar)
- **Bottom items** — Secondary actions like Settings (bottom of sidebar)

## Using Different Icons

Local.ts uses [Lucide React](https://lucide.dev/) for icons. You can:

1. **Browse available icons** at [lucide.dev/icons](https://lucide.dev/icons/)
2. **Import any icon** using the PascalCase name:
   ```typescript
   import { FileText, Calendar, Mail, Bell } from "lucide-react";
   ```

## Customizing the Sidebar Component

The sidebar component itself is located at `src/components/sidebar.tsx`. You can modify:

- **Styling** — Adjust colors, spacing, and animations
- **Layout** — Change the sidebar width or positioning
- **Behavior** — Add tooltips, badges, or collapse functionality
- **Structure** — Reorganize or add new sections

::: info
The sidebar is just a React component. You're free to completely rewrite it or use a different navigation pattern if needed.
:::

## Removing Items

Simply delete items you don't need:

```diff
export const SIDEBAR_TOP_ITEMS: SidebarItem[] = [
  { icon: Home, label: "Home", href: "/" },
- { icon: Users, label: "Team", href: "/team" },
];
```

## TypeScript Support

The `SidebarItem` type provides full TypeScript support. If you need to add custom properties, extend the type in `src/components/ui/sidebar/sidebar-nav-item.tsx`:

```typescript
export interface SidebarItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: number; // Optional badge count
  disabled?: boolean; // Optional disabled state
}
```
