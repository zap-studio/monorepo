import type { ComponentType } from "react";

export type BaseZapPlugin<TConfig = Record<string, unknown>> = {
  id: string;
  config?: TConfig;
};

export interface ZapServerPlugin<
  TConfig = Record<string, unknown>,
  TMiddleware extends Array<(...args: unknown[]) => unknown> = Array<
    (...args: unknown[]) => unknown
  >,
  TComponents = Record<string, ComponentType<unknown>>,
> extends BaseZapPlugin<TConfig> {
  middleware?: TMiddleware;
  components?: TComponents;
}

export interface ZapClientPlugin<
  TConfig = Record<string, unknown>,
  THooks = Record<string, (...args: unknown[]) => unknown>,
  TComponents = Record<string, ComponentType<unknown>>,
> extends BaseZapPlugin<TConfig> {
  hooks?: THooks;
  components?: TComponents;
}

export type ZapServerPlugins = Record<string, ZapServerPlugin>;
export type ZapClientPlugins = Record<string, ZapClientPlugin>;
