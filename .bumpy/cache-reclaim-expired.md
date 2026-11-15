---
"@zap-studio/cache": patch
---

Reclaim expired entries in `set()` before evicting, so the cache never holds more than `capacity` entries and `onEvict` fires for expired entries that were never read. Previously, unread expired entries were kept forever and could let `size` exceed `capacity` (#622).
