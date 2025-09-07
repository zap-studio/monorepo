import type { ComponentType } from "react";

export type BaseZapPlugin<TConfig = Record<string, unknown>> = {
  id: string;
  config?: TConfig;
};

export interface ZapServerPlugin<
  TComponents = Record<string, ComponentType<unknown>>,
  TMiddleware extends Array<(...args: unknown[]) => unknown> = Array<
    (...args: unknown[]) => unknown
  >,
  THandlers = Record<string, (...args: unknown[]) => unknown>,
  TConfig = Record<string, unknown>,
> extends BaseZapPlugin<TConfig> {
  components?: TComponents;
  middleware?: TMiddleware;
  handlers?: THandlers;
}

export interface ZapClientPlugin<
  TComponents = Record<string, ComponentType<unknown>>,
  THooks = Record<string, (...args: unknown[]) => unknown>,
  TConfig = Record<string, unknown>,
> extends BaseZapPlugin<TConfig> {
  components?: TComponents;
  hooks?: THooks;
}

export type ZapServerPlugins = Record<string, ZapServerPlugin>;
export type ZapClientPlugins = Record<string, ZapClientPlugin>;
