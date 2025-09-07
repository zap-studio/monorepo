import type { ComponentType } from "react";

export type BaseZapPlugin = {
  id: string;
  config?: Record<string, unknown>;
};

export interface ZapServerPlugin extends BaseZapPlugin {
  components?: Record<string, ComponentType<unknown>>;
  middleware?: Array<(...args: unknown[]) => unknown>;
  handlers?: Record<string, (...args: unknown[]) => unknown>;
}

export interface ZapClientPlugin extends BaseZapPlugin {
  components?: Record<string, ComponentType<unknown>>;
  hooks?: Record<string, (...args: unknown[]) => unknown>;
}

export type ZapServerPlugins = Record<string, ZapServerPlugin>;
export type ZapClientPlugins = Record<string, ZapClientPlugin>;
