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

import type { NextRequest, NextResponse } from "next/server";
import type { ComponentType } from "react";
import type z from "zod";

export type BaseZapPlugin<
  TId extends string = string,
  TConfig = Record<string, unknown>,
  TIntegrations = Record<string, unknown>,
  TProviders extends Record<string, ComponentType<any>> = Record<
    string,
    ComponentType<any>
  >,
  TSchemas = Record<string, z.ZodTypeAny>,
  TUtils = Record<string, (...args: any[]) => unknown>,
> = {
  id: TId;
  config?: Partial<TConfig>;
  integrations?: TIntegrations;
  providers?: TProviders;
  schemas?: TSchemas;
  utils?: TUtils;
};

export interface ZapServerPlugin<
  TId extends string = string,
  TConfig = Record<string, unknown>,
  TIntegrations = Record<string, unknown>,
  TProviders extends Record<string, ComponentType<any>> = Record<
    string,
    ComponentType<any>
  >,
  TSchemas = Record<string, z.ZodTypeAny>,
  TUtils = Record<string, (...args: any[]) => unknown>,
  TMiddleware extends Record<
    string,
    (request: NextRequest) => NextResponse<unknown> | null
  > = Record<string, (request: NextRequest) => NextResponse<unknown> | null>,
  TComponents = Record<string, ComponentType<any>>,
> extends BaseZapPlugin<
    TId,
    TConfig,
    TIntegrations,
    TProviders,
    TSchemas,
    TUtils
  > {
  middleware?: TMiddleware;
  components?: TComponents;
}

export interface ZapClientPlugin<
  TId extends string = string,
  TConfig = Record<string, unknown>,
  TIntegrations = Record<string, unknown>,
  TProviders extends Record<string, ComponentType<any>> = Record<
    string,
    ComponentType<any>
  >,
  TSchemas = Record<string, z.ZodTypeAny>,
  TUtils = Record<string, (...args: any[]) => unknown>,
  THooks = Record<string, (...args: unknown[]) => unknown>,
  TComponents = Record<string, ComponentType<any>>,
> extends BaseZapPlugin<
    TId,
    TConfig,
    TIntegrations,
    TProviders,
    TSchemas,
    TUtils
  > {
  hooks?: THooks;
  components?: TComponents;
}

export type ZapServerPlugins = Record<string, ZapServerPlugin>;
export type ZapClientPlugins = Record<string, ZapClientPlugin>;
