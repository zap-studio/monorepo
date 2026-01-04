# Database

Local.ts uses [SQLite](https://sqlite.org/index.html) for persistent data storage with [Diesel ORM](https://diesel.rs/) for type-safe queries. All database operations run in Rust and are exposed to your React app via Tauri commands.

## How It Works

The database system has three parts:

1. **SQLite** — A lightweight, file-based database stored locally
2. **Diesel ORM** — Type-safe database operations in Rust with compile-time query verification
3. **Tauri Commands** — Bridge between your React frontend and Rust backend

When your app starts:
1. The database file is created in the app's data directory if it doesn't exist
2. Pending migrations are run automatically
3. A connection pool is initialized for efficient database access

::: info
A **connection pool** is a set of reusable database connections that helps your app handle multiple queries efficiently.

Local.ts uses [r2d2](https://docs.rs/r2d2/latest/r2d2/) for pooling, which manages connections so you don't need to open and close them for every request.
:::

## Database Location

The SQLite database file is stored in the platform-specific app data directory:

| Platform | Location |
|----------|----------|
| macOS | `~/Library/Application Support/{bundleIdentifier}/local.db` |
| Windows | `C:\Users\{User}\AppData\Roaming\{bundleIdentifier}\local.db` |
| Linux | `~/.local/share/{bundleIdentifier}/local.db` |

## Creating a New Table

Let's walk through adding a `users` table to your app.

### 1. Generate a Migration

```bash
cd src-tauri
diesel migration generate create_users
```

This creates a timestamped directory:

```
migrations/
└── 2024-01-01-000000_create_users/
    ├── up.sql
    └── down.sql
```

### 2. Write the SQL

In `up.sql`:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

In `down.sql`:

```sql
DROP TABLE users;
```

### 3. Run the Migration

```bash
diesel migration run
```

This:
- Creates the `users` table in your database
- Auto-generates the schema in `src-tauri/src/database/schema.rs`

::: warning
Never edit `schema.rs` manually. It's regenerated automatically when you run migrations.
:::

### 4. Create the Rust Model

Create `src-tauri/src/database/models/user.rs`:

```rust
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use crate::database::schema::users;

#[derive(Debug, Clone, Queryable, Selectable, Serialize)]
#[diesel(table_name = users)]
pub struct User {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub created_at: i64,
}

#[derive(Debug, Clone, Insertable, Deserialize)]
#[diesel(table_name = users)]
pub struct NewUser {
    pub name: String,
    pub email: String,
}
```

### 5. Create Tauri Commands

Add commands to query and insert users in `src-tauri/src/commands/user.rs`:

```rust
use diesel::prelude::*;
use tauri::State;
use crate::database::{DbPool, DbError};
use crate::database::schema::users;
use super::{User, NewUser};

#[tauri::command]
pub fn list_users(pool: State<DbPool>) -> Result<Vec<User>, DbError> {
    let mut conn = pool.get()?;
    users::table
        .load::<User>(&mut conn)
        .map_err(Into::into)
}

#[tauri::command]
pub fn create_user(
    pool: State<DbPool>,
    user: NewUser
) -> Result<User, DbError> {
    let mut conn = pool.get()?;
    diesel::insert_into(users::table)
        .values(&user)
        .execute(&mut conn)?;

    users::table
        .order(users::id.desc())
        .first(&mut conn)
        .map_err(Into::into)
}

#[tauri::command]
pub fn get_user(
    pool: State<DbPool>,
    user_id: i32
) -> Result<Option<User>, DbError> {
    let mut conn = pool.get()?;
    users::table
        .find(user_id)
        .first(&mut conn)
        .optional()
        .map_err(Into::into)
}
```

### 6. Register the Commands

In `src-tauri/src/lib.rs`:

```rust
.invoke_handler(tauri::generate_handler![
    // ... existing commands
    database::models::user::list_users,
    database::models::user::create_user,
    database::models::user::get_user,
])
```

::: warning
If you don't register your commands with Tauri using `invoke_handler`, your frontend won't be able to call them. Always ensure new commands are added here.
:::

### 7. Call from React

```typescript
import { invoke } from "@tauri-apps/api/core";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: number;
}

// List all users
const users = await invoke<User[]>("list_users");

// Create a new user
const newUser = await invoke<User>("create_user", {
  user: { name: "Alice", email: "alice@example.com" }
});

// Get a specific user
const user = await invoke<User | null>("get_user", { userId: 1 });
```

## Common Queries

For more details and advanced query examples, check the [Diesel ORM documentation](https://diesel.rs/guides/).

## Modifying Existing Tables

To add a column to an existing table:

```bash
diesel migration generate add_avatar_to_users
```

In `up.sql`:

```sql
ALTER TABLE users ADD COLUMN avatar_url TEXT;
```

In `down.sql`:

```sql
ALTER TABLE users DROP COLUMN avatar_url;
```

Run the migration and update your Rust model to include the new field.

## Connection Pool

The connection pool is initialized at startup in `src-tauri/src/database/mod.rs`:

```rust
let pool = r2d2::Pool::builder()
    .max_size(10)
    .build(manager)?;
```

You can adjust `max_size` based on your app's concurrency needs. For most desktop apps, 10 connections is more than sufficient.
