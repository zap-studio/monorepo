/*
 * NOTE: `any` is intentionally used in `ComponentType<any>` and other places
 * to preserve flexibility for plugin authors. Restricting types here would
 * break the generic nature of the plugin system. Biome lint for explicit `any`
 * is ignored for this file.
 */

/* biome-ignore-all lint/suspicious/noExplicitAny: see above */

import type { NextRequest, NextResponse } from "next/server";
import type { ComponentType } from "react";
import type z from "zod";

// Shared aliases
type AnyComponent = ComponentType<any>;
type AnyFn = (...args: any[]) => unknown;
type MiddlewareFn = (request: NextRequest) => NextResponse<unknown> | null;
type MiddlewareMap = Record<string, MiddlewareFn>;
type HookFn = (...args: unknown[]) => unknown;
type HookMap = Record<string, HookFn>;

// Plugin interfaces
export type BaseZapPlugin<
  TId extends string = string,
  TConfig = Record<string, unknown>,
  TIntegrations = Record<string, unknown>,
  TProviders extends Record<string, AnyComponent> = Record<
    string,
    AnyComponent
  >,
  TSchemas = Record<string, z.ZodTypeAny>,
  TUtils = Record<string, AnyFn>,
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
  TProviders extends Record<string, AnyComponent> = Record<
    string,
    AnyComponent
  >,
  TSchemas = Record<string, z.ZodTypeAny>,
  TUtils = Record<string, AnyFn>,
  TMiddleware extends MiddlewareMap = MiddlewareMap,
  TComponents = Record<string, AnyComponent>,
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
  TProviders extends Record<string, AnyComponent> = Record<
    string,
    AnyComponent
  >,
  TSchemas = Record<string, z.ZodTypeAny>,
  TUtils = Record<string, AnyFn>,
  THooks extends HookMap = HookMap,
  TComponents = Record<string, AnyComponent>,
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

// Plugin collections
export type ZapServerPlugins = Record<string, ZapServerPlugin>;
export type ZapClientPlugins = Record<string, ZapClientPlugin>;
