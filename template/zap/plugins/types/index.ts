/*
 * NOTE: `any` is intentionally used in `ComponentType<any>` and other places
 * to preserve flexibility for plugin authors. Restricting types here would
 * break the generic nature of the plugin system. Biome lint for explicit `any`
 * is ignored for this file.
 */

/* biome-ignore-all lint/suspicious/noExplicitAny: see above */

import type {
  AnyMiddleware as AnyRpcMiddleware,
  AnyProcedure as AnyRpcProcedure,
} from "@orpc/server";
import type {
  AnyPgSelect,
  PgSelectPrepare,
  PgTableWithColumns,
  TableConfig,
} from "drizzle-orm/pg-core";
import type { NextRequest, NextResponse } from "next/server";
import type { ComponentType } from "react";
import type z from "zod";

// Shared aliases
export type IntegrationsMap = Record<string, unknown>;

export type AnyComponent = ComponentType<any>;
export type AnyComponentMap = Record<string, AnyComponent>;

export type AnyFn = (...args: any[]) => unknown;
export type AnyFnMap = Record<string, AnyFn>;

export type MiddlewareFn = (
  request: NextRequest
) => NextResponse<unknown> | null;
export type MiddlewareMap = Record<string, MiddlewareFn>;

export type HookFn = (...args: any[]) => unknown;
export type HookMap = Record<string, HookFn>;

export type TypesMap = Record<string, unknown>;

export type AnyZodSchema = z.ZodTypeAny;
export type AnyZodSchemaMap = Record<string, AnyZodSchema>;

export type AnyDbQuery<T = AnyPgSelect> = PgSelectPrepare<
  T extends AnyPgSelect ? T : any
>;
export type AnyDbSchema<T = any> = PgTableWithColumns<
  T extends TableConfig ? T : any
>;
export type AnyRpcMiddlewareMap = Record<string, AnyRpcMiddleware>;
export type AnyRpcProcedureMap = Record<string, AnyRpcProcedure>;

// Plugin interfaces
export type BaseZapPlugin<
  TId extends string = string,
  TConfig = Record<string, unknown>,
  TIntegrations = Record<string, unknown>,
  TProviders extends Record<string, AnyComponent> = Record<
    string,
    AnyComponent
  >,
  TSchemas = Record<string, AnyZodSchema>,
  TUtils = Record<string, AnyFn>,
  TTypes = Record<string, unknown>,
  TData = Record<string, unknown>,
> = {
  id: TId;
  config?: Partial<TConfig>;
  integrations?: TIntegrations;
  providers?: TProviders;
  schemas?: TSchemas;
  utils?: TUtils;
  types?: TTypes;
  data?: TData;
};

export interface ZapServerPlugin<
  TId extends string = string,
  TConfig = Record<string, unknown>,
  TIntegrations = Record<string, unknown>,
  TProviders extends Record<string, AnyComponent> = Record<
    string,
    AnyComponent
  >,
  TSchemas = Record<string, AnyZodSchema>,
  TUtils = Record<string, AnyFn>,
  TTypes = Record<string, unknown>,
  TData = Record<string, unknown>,
  TMiddleware extends MiddlewareMap = MiddlewareMap,
  TComponents = Record<string, AnyComponent>,
  TDbQueries = Record<string, AnyDbQuery>,
  TDbSchemas = Record<string, AnyDbSchema>,
  TRpcProcedures = Record<string, AnyRpcProcedure>,
  TRpcMiddlewares = Record<string, AnyRpcMiddleware>,
  TServices = Record<string, AnyFn>,
> extends BaseZapPlugin<
    TId,
    TConfig,
    TIntegrations,
    TProviders,
    TSchemas,
    TUtils,
    TTypes,
    TData
  > {
  middleware?: TMiddleware;
  components?: TComponents;
  db?: {
    providers?: {
      drizzle?: {
        queries?: TDbQueries;
        schemas?: TDbSchemas;
      };
    };
  };
  rpc?: {
    procedures?: TRpcProcedures;
    middlewares?: TRpcMiddlewares;
  };
  services?: TServices;
}

export interface ZapClientPlugin<
  TId extends string = string,
  TConfig = Record<string, unknown>,
  TIntegrations = Record<string, unknown>,
  TProviders extends Record<string, AnyComponent> = Record<
    string,
    AnyComponent
  >,
  TSchemas = Record<string, AnyZodSchema>,
  TUtils = Record<string, AnyFn>,
  TTypes = Record<string, unknown>,
  TData = Record<string, unknown>,
  THooks extends HookMap = HookMap,
  TComponents = Record<string, AnyComponent>,
> extends BaseZapPlugin<
    TId,
    TConfig,
    TIntegrations,
    TProviders,
    TSchemas,
    TUtils,
    TTypes,
    TData
  > {
  hooks?: THooks;
  components?: TComponents;
}

// Plugin collections
export type ZapServerPlugins = Record<string, ZapServerPlugin>;
export type ZapClientPlugins = Record<string, ZapClientPlugin>;
