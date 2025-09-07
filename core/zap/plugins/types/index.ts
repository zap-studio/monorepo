/*
 * NOTE: We intentionally use `any` for the generic `ComponentType<any>` in plugin type definitions.
 * This is necessary to support arbitrary React component props, as plugin providers/components
 * may accept any shape of props depending on user/plugin implementation. Restricting the type here
 * would break compatibility and flexibility for plugin authors.
 *
 * The use of `any` is justified in this context to enable a generic plugin system that can handle
 * diverse component signatures, which is a core requirement for extensibility.
 *
 * Biome lint errors for explicit `any` are ignored for this file.
 */

/* biome-ignore-all lint/suspicious/noExplicitAny: see comment above */

import type { ComponentType } from "react";

export type BaseZapPlugin<
  TConfig = Record<string, unknown>,
  TIntegrations = Record<string, unknown>,
  TProviders extends Record<string, ComponentType<any>> = Record<
    string,
    ComponentType<any>
  >,
> = {
  id: string;
  config?: Partial<TConfig>;
  integrations?: TIntegrations;
  providers?: TProviders;
};

export interface ZapServerPlugin<
  TConfig = Record<string, unknown>,
  TIntegrations = Record<string, unknown>,
  TProviders extends Record<string, ComponentType<any>> = Record<
    string,
    ComponentType<any>
  >,
  TMiddleware extends Array<(...args: unknown[]) => unknown> = Array<
    (...args: unknown[]) => unknown
  >,
  TComponents = Record<string, ComponentType<any>>,
> extends BaseZapPlugin<TConfig, TIntegrations, TProviders> {
  middleware?: TMiddleware;
  components?: TComponents;
}

export interface ZapClientPlugin<
  TConfig = Record<string, unknown>,
  TIntegrations = Record<string, unknown>,
  TProviders extends Record<string, ComponentType<any>> = Record<
    string,
    ComponentType<any>
  >,
  THooks = Record<string, (...args: unknown[]) => unknown>,
  TComponents = Record<string, ComponentType<any>>,
> extends BaseZapPlugin<TConfig, TIntegrations, TProviders> {
  hooks?: THooks;
  components?: TComponents;
}

export type ZapServerPlugins = Record<string, ZapServerPlugin>;
export type ZapClientPlugins = Record<string, ZapClientPlugin>;
