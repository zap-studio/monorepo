/**
 * Public entrypoint for the store package.
 *
 * @module @zap-studio/store
 */

export { createStore } from "./store.ts";
export { derive } from "./derive.ts";
export type {
  ActionsFactory,
  GetState,
  PersistOptions,
  Readable,
  SetState,
  StorageLike,
  Store,
  StoreOptions,
} from "./types.ts";
