# API Methods

The `api` object provides convenient methods for common HTTP verbs. All methods require a schema for validation and return fully typed, validated data.

## Overview

The `api` object includes methods for the five most common HTTP verbs:

| Method | Use Case |
| ------ | -------- |
| `api.get()` | Retrieve data (users, products, etc.) |
| `api.post()` | Create new resources |
| `api.put()` | Replace entire resources |
| `api.patch()` | Partially update resources |
| `api.delete()` | Remove resources |

All methods automatically:
- Set `Content-Type: application/json` for request bodies
- JSON-stringify objects passed as `body`
- Validate responses against your schema
- Provide full TypeScript type inference

## api.get()

Retrieves data from the server. Use for fetching resources.

```typescript
api.get(url, schema, options?)
```

### Example: Fetching a User Profile

```typescript
import { z } from "zod";
import { api } from "@zap-studio/fetch";

const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url().nullable(),
  bio: z.string().optional(),
  joinedAt: z.string(),
});

async function getUserProfile(userId: string) {
  const profile = await api.get(
    `https://api.example.com/users/${userId}`,
    UserProfileSchema
  );

  return profile;
  // Type: { id: string; name: string; email: string; avatar: string | null; bio?: string; joinedAt: string }
}
```

### Example: Fetching with Query Parameters

```typescript
const ProductListSchema = z.object({
  products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
    })
  ),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
});

async function searchProducts(query: string, page = 1) {
  const url = new URL("https://api.example.com/products");
  url.searchParams.set("q", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", "20");

  return api.get(url.toString(), ProductListSchema);
}

// Usage
const results = await searchProducts("laptop", 2);
console.log(`Found ${results.total} products`);
```

## api.post()

Creates new resources on the server. The request body is automatically JSON-stringified.

```typescript
api.post(url, schema, options?)
```

### Example: Creating a New User

```typescript
const CreateUserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string(),
});

async function createUser(name: string, email: string, password: string) {
  const user = await api.post(
    "https://api.example.com/users",
    CreateUserResponseSchema,
    {
      body: {
        name,
        email,
        password,
      },
    }
  );

  console.log(`User ${user.id} created at ${user.createdAt}`);
  return user;
}
```

### Example: Submitting a Form

```typescript
const SubmissionSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  submittedAt: z.string(),
});

async function submitContactForm(data: {
  name: string;
  email: string;
  message: string;
}) {
  return api.post("https://api.example.com/contact", SubmissionSchema, {
    body: data,
  });
}

// Usage
const submission = await submitContactForm({
  name: "Jane Doe",
  email: "jane@example.com",
  message: "Hello! I have a question about your product.",
});

if (submission.status === "pending") {
  console.log("Your message has been received!");
}
```

## api.put()

Replaces an entire resource. Use when you want to update all fields.

```typescript
api.put(url, schema, options?)
```

### Example: Updating User Settings

```typescript
const UserSettingsSchema = z.object({
  userId: z.string(),
  theme: z.enum(["light", "dark", "system"]),
  language: z.string(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }),
  updatedAt: z.string(),
});

type UserSettings = z.infer<typeof UserSettingsSchema>;

async function updateSettings(userId: string, settings: Omit<UserSettings, "userId" | "updatedAt">) {
  return api.put(
    `https://api.example.com/users/${userId}/settings`,
    UserSettingsSchema,
    {
      body: settings,
    }
  );
}

// Usage: replaces ALL settings
const updated = await updateSettings("user-123", {
  theme: "dark",
  language: "en-US",
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
});
```

## api.patch()

Partially updates a resource. Use when you only want to change specific fields.

```typescript
api.patch(url, schema, options?)
```

### Example: Updating Profile Fields

```typescript
const ProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  bio: z.string().nullable(),
  website: z.string().url().nullable(),
  updatedAt: z.string(),
});

async function updateProfile(
  userId: string,
  updates: Partial<{ name: string; bio: string; website: string }>
) {
  return api.patch(
    `https://api.example.com/users/${userId}/profile`,
    ProfileSchema,
    {
      body: updates,
    }
  );
}

// Usage: only updates the bio field
const profile = await updateProfile("user-123", {
  bio: "Software engineer passionate about TypeScript",
});
```

### Example: Toggling a Feature

```typescript
const FeatureToggleSchema = z.object({
  feature: z.string(),
  enabled: z.boolean(),
  updatedAt: z.string(),
});

async function toggleFeature(userId: string, feature: string, enabled: boolean) {
  return api.patch(
    `https://api.example.com/users/${userId}/features/${feature}`,
    FeatureToggleSchema,
    {
      body: { enabled },
    }
  );
}
```

## api.delete()

Removes a resource from the server.

```typescript
api.delete(url, schema, options?)
```

### Example: Deleting a Post

```typescript
const DeleteResponseSchema = z.object({
  success: z.boolean(),
  deletedAt: z.string(),
});

async function deletePost(postId: string) {
  const result = await api.delete(
    `https://api.example.com/posts/${postId}`,
    DeleteResponseSchema
  );

  if (result.success) {
    console.log(`Post deleted at ${result.deletedAt}`);
  }

  return result;
}
```

### Example: Removing from Cart

```typescript
const CartSchema = z.object({
  id: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number(),
    })
  ),
  total: z.number(),
});

async function removeFromCart(cartId: string, productId: string) {
  // Returns the updated cart
  return api.delete(
    `https://api.example.com/carts/${cartId}/items/${productId}`,
    CartSchema
  );
}
```

## Request Options

All methods accept an optional `options` parameter:

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `body` | `object \| BodyInit` | - | Request body (auto-stringified for objects) |
| `headers` | `HeadersInit` | - | Additional request headers |
| `searchParams` | `URLSearchParams \| Record<string, string>` | - | Query parameters |
| `throwOnFetchError` | `boolean` | `true` | Throw `FetchError` on non-2xx responses |
| `throwOnValidationError` | `boolean` | `true` | Throw `ValidationError` on schema failures |

Plus all standard [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit) options.

## Real-World Example: Blog API Client

```typescript
import { z } from "zod";
import { createFetch } from "@zap-studio/fetch";

// Schemas
const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
  published: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const PostListSchema = z.object({
  posts: z.array(PostSchema),
  total: z.number(),
  hasMore: z.boolean(),
});

const CommentSchema = z.object({
  id: z.string(),
  postId: z.string(),
  authorId: z.string(),
  content: z.string(),
  createdAt: z.string(),
});

// Create API client
const { api } = createFetch({
  baseURL: "https://api.myblog.com/v1",
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

// Blog API functions
export const blogApi = {
  // Get all posts
  async getPosts(page = 1, limit = 10) {
    return api.get("/posts", PostListSchema, {
      searchParams: { page: String(page), limit: String(limit) },
    });
  },

  // Get single post
  async getPost(id: string) {
    return api.get(`/posts/${id}`, PostSchema);
  },

  // Create post
  async createPost(data: { title: string; content: string }) {
    return api.post("/posts", PostSchema, { body: data });
  },

  // Update post
  async updatePost(id: string, data: Partial<{ title: string; content: string; published: boolean }>) {
    return api.patch(`/posts/${id}`, PostSchema, { body: data });
  },

  // Delete post
  async deletePost(id: string) {
    return api.delete(`/posts/${id}`, z.object({ success: z.boolean() }));
  },

  // Add comment
  async addComment(postId: string, content: string) {
    return api.post(`/posts/${postId}/comments`, CommentSchema, {
      body: { content },
    });
  },
};

// Usage
const { posts, hasMore } = await blogApi.getPosts();
const newPost = await blogApi.createPost({
  title: "My First Post",
  content: "Hello, world!",
});
await blogApi.updatePost(newPost.id, { published: true });
```

## Note on Raw Responses

The `api.*` methods always require a schema for validation. If you need raw responses without validation, use [`$fetch`](/packages/fetch/fetch-function) directly.
