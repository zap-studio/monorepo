# create-zap-app

## 1.4.9

### Patch Changes

- 0d476a3: Rework README.md for a better description of `create-zap-app` package
- Updated dependencies [0d476a3]
  - @zap-ts/architecture@1.0.1

## 1.4.8

### Patch Changes

- 21eb9fb: remove prettier wording to make it agnostic since we use biome as the formatter now

## 1.4.7

### Patch Changes

- 9c2fe86: fix: review imports for generation of procedures file

## 1.4.6

### Patch Changes

- fab0557: fix: change command name for better DX

## 1.4.5

### Patch Changes

- 90d3467: Update hook generation to use useZapQuery instead of useSWR for better error handling

  Generated hooks now use the centralized `useZapQuery` hook which provides:

  - Automatic error handling with toast notifications
  - Consistent error reporting across all generated procedures
  - Better developer experience with centralized error management
  - Seamless integration with Zap.ts error handling architecture

## 1.4.4

### Patch Changes

- 5e0cce2: remove effect dependency and fix generate env spinner

## 1.4.3

### Patch Changes

- 8c5fcf1: add 'zap' alias to the CLI tool

## 1.4.2

### Patch Changes

- f1cf682: fix big issue with writing files

## 1.4.1

### Patch Changes

- aec411f: refactored the whole CLI app to leverage Effect error handling and more

## 1.4.0

### Minor Changes

- a2c155a: add .env generation command as a standalone command

## 1.3.1

### Patch Changes

- da7ec81: add DATABASE_URL_DEV to .env generation file

## 1.2.23

### Patch Changes

- ca3a873: update generate-secret utility to use crypto module for secure secret generation

## 1.2.21

### Patch Changes

- 95d5cb3: format github link to new line

## 1.2.20

### Patch Changes

- 1176bc8: refactor code and use process.stdout.write instead of console
- 1b9f34d: add default ZAP_MAIL env var

## 1.2.19

### Patch Changes

- 9f05e5e: Generate ENCRYPTION_KEY by default

## 1.2.17

### Patch Changes

- d2d61d3: Add bun options to package managers

## 1.2.16

### Patch Changes

- cf3ea0a: Add ZAP_MAIL env var when creating the .env file
