---
"create-zap-app": patch
---

Update hook generation to use useZapQuery instead of useSWR for better error handling

Generated hooks now use the centralized `useZapQuery` hook which provides:
- Automatic error handling with toast notifications
- Consistent error reporting across all generated procedures  
- Better developer experience with centralized error management
- Seamless integration with Zap.ts error handling architecture
