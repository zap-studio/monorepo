/*
 * NOTE: `any` is intentionally used to preserve flexibility for plugin authors. Restricting types here would
 * break the generic nature of the plugin system. Thus, Biome lint for explicit `any`
 * is ignored for this file.
 */

/* biome-ignore-all lint/suspicious/noExplicitAny: see above */

import type {
  AnyMiddleware as RpcMiddleware,
  AnyProcedure as RpcProcedure,
} from "@orpc/server";
import type {
  AnyPgSelect,
  AnyPgTable,
  PgSelectPrepare,
  TableConfig,
} from "drizzle-orm/pg-core";
import type { NextRequest, NextResponse } from "next/server";
import type { ComponentType } from "react";
import type z from "zod";

/* ------------------------------ Shared Aliases ----------------------------- */

export type IntegrationsMap = Record<string, unknown>;

export type AnyComponent = ComponentType<any>;
export type ComponentMap = Record<string, AnyComponent>;

export type AnyFn = (...args: any[]) => unknown;
export type FnMap = Record<string, AnyFn>;

export type MiddlewareFn = (req: NextRequest) => NextResponse<unknown> | null;
export type MiddlewareMap = Record<string, MiddlewareFn>;

export type HookFn = (...args: any[]) => unknown;
export type HookMap = Record<string, HookFn>;

export type TypesMap = Record<string, unknown>;

export type ZodSchema = z.ZodTypeAny;
export type ZodSchemaMap = Record<string, ZodSchema>;

export type DbQuery<T extends AnyPgSelect = AnyPgSelect> = PgSelectPrepare<T>;
// biome-ignore lint/complexity/noBannedTypes: `{}` is used intentionally as the default type parameter to provide a permissive, backward-compatible fallback when no Drizzle table config is supplied by plugin authors. Alternatives like `object`, `unknown`, or `Record<string, never>` change assignability/variance and break existing usages; safety is maintained by `T extends Partial<TableConfig>`.
export type DbSchema<T extends Partial<TableConfig> = {}> = AnyPgTable<T>;

export type RpcMiddlewareMap = Record<string, RpcMiddleware>;
export type RpcProcedureMap =
  | Record<string, RpcProcedure>
  | ((args: any) => Record<string, RpcProcedure>);

/* ---------------------------- Base Plugin Type ---------------------------- */

export type BaseZapPlugin<
  TId extends string = string,
  TConfig = Record<string, unknown>,
  TIntegrations = Record<string, unknown>,
  TProviders extends ComponentMap = ComponentMap,
  TSchemas extends ZodSchemaMap = ZodSchemaMap,
  TUtils extends FnMap = FnMap,
  TTypes extends TypesMap = TypesMap,
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

/* --------------------------- Server Plugin Type --------------------------- */

export interface ZapServerPlugin<
  TId extends string = string,
  TConfig = Record<string, unknown>,
  TIntegrations = Record<string, unknown>,
  TProviders extends ComponentMap = ComponentMap,
  TSchemas extends ZodSchemaMap = ZodSchemaMap,
  TUtils extends FnMap = FnMap,
  TTypes extends TypesMap = TypesMap,
  TData = Record<string, unknown>,
  TMiddleware extends MiddlewareMap = MiddlewareMap,
  TComponents extends ComponentMap = ComponentMap,
  TDbQueries extends Record<string, DbQuery> = Record<string, DbQuery>,
  TDbSchemas extends Record<string, DbSchema> = Record<string, DbSchema>,
  TRpcProcedures extends RpcProcedureMap = RpcProcedureMap,
  TRpcMiddlewares extends RpcMiddlewareMap = RpcMiddlewareMap,
  TServices extends FnMap = FnMap,
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

/* --------------------------- Client Plugin Type --------------------------- */

export interface ZapClientPlugin<
  TId extends string = string,
  TConfig = Record<string, unknown>,
  TIntegrations = Record<string, unknown>,
  TProviders extends ComponentMap = ComponentMap,
  TSchemas extends ZodSchemaMap = ZodSchemaMap,
  TUtils extends FnMap = FnMap,
  TTypes extends TypesMap = TypesMap,
  TData = Record<string, unknown>,
  THooks extends HookMap = HookMap,
  TComponents extends ComponentMap = ComponentMap,
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

/* ------------------------- Plugin Collections ---------------------------- */

export type ZapServerPlugins = Record<string, ZapServerPlugin>;
export type ZapClientPlugins = Record<string, ZapClientPlugin>;
