import {
  betterFetch,
  createFetch as createBetterFetch,
} from "@better-fetch/fetch";
import axios from "axios";
import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import ky from "ky";
import { ofetch } from "ofetch";

import {
  $fetch as zapFetch,
  api as zapApi,
  createFetch,
} from "../../src/index.js";
import { BASE_URL, USERS_URL, USER_URL } from "./constants.js";
import { responseSchema } from "./data.js";
import { installMockFetch } from "./mock-fetch.js";
import type { ClientSet } from "./types.js";

export function createClientSet(payload: unknown): ClientSet {
  const mockFetch = installMockFetch(payload);
  const betterFetchDefaulted = createBetterFetch({
    baseURL: BASE_URL,
    customFetchImpl: mockFetch,
    headers: { Authorization: "Bearer token" },
  });

  const ofetchBase = ofetch.create({
    baseURL: BASE_URL,
  });

  const ofetchDefaulted = ofetch.create({
    baseURL: BASE_URL,
    headers: { Authorization: "Bearer token" },
    query: { locale: "en" },
  });

  const kyBase = ky.create({
    baseUrl: BASE_URL,
    fetch: mockFetch,
  });

  const kyDefaulted = ky.create({
    baseUrl: BASE_URL,
    fetch: mockFetch,
    headers: { Authorization: "Bearer token" },
    searchParams: { locale: "en" },
  });

  const axiosAdapter: AxiosAdapter = async (
    config: InternalAxiosRequestConfig
  ): Promise<AxiosResponse> => {
    const response = await mockFetch(config.url ?? USER_URL, {
      body:
        typeof config.data === "string"
          ? config.data
          : JSON.stringify(config.data),
      headers: config.headers,
      method: config.method?.toUpperCase() ?? "GET",
    });

    return {
      config,
      data: await response.json(),
      headers: {},
      request: {},
      status: 200,
      statusText: "OK",
    };
  };

  const axiosBase = axios.create({
    adapter: axiosAdapter,
  });

  const axiosDefaulted = axios.create({
    adapter: axiosAdapter,
    baseURL: BASE_URL,
    headers: { Authorization: "Bearer token" },
    params: { locale: "en" },
  });

  const zapDefaulted = createFetch({
    baseURL: BASE_URL,
    headers: { Authorization: "Bearer token" },
    searchParams: { locale: "en" },
  });

  return {
    axios: {
      getJson: async () => (await axiosBase.get(USER_URL)).data,
      postJson: async (body) => (await axiosBase.post(USERS_URL, body)).data,
      postRawBody: async (body) =>
        (
          await axiosBase.post(USERS_URL, body, {
            headers: { "Content-Type": "text/plain" },
          })
        ).data,
      withDefaultsGetJson: async () =>
        (await axiosDefaulted.get("/users/1")).data,
    },
    betterFetch: {
      getJson: async () =>
        await betterFetch(USER_URL, {
          customFetchImpl: mockFetch,
          throw: true,
        }),
      postBodyObject: async (body) =>
        await betterFetch(USERS_URL, {
          customFetchImpl: mockFetch,
          method: "POST",
          body,
          throw: true,
        }),
      postRawBody: async (body) =>
        await betterFetch(USERS_URL, {
          customFetchImpl: mockFetch,
          method: "POST",
          body,
          throw: true,
        }),
      withDefaultsGetJson: async () =>
        await betterFetchDefaulted("/users/1", { throw: true }),
    },
    ky: {
      getJson: async () => await kyBase("users/1").json(),
      postJson: async (body) =>
        await kyBase.post("users", { json: body }).json(),
      postRawBody: async (body) =>
        await kyBase
          .post("users", { body, headers: { "Content-Type": "text/plain" } })
          .json(),
      withDefaultsGetJson: async () => await kyDefaulted("users/1").json(),
    },
    native: {
      getJson: async () => await (await fetch(USER_URL)).json(),
      postJsonRaw: async (body) =>
        await (
          await fetch(USERS_URL, {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
          })
        ).json(),
      postRawBody: async (body) =>
        await (await fetch(USERS_URL, { method: "POST", body })).json(),
    },
    ofetch: {
      getJson: async () => await ofetchBase("/users/1"),
      postJson: async (body) =>
        await ofetchBase("/users", {
          method: "POST",
          body: body as Record<string, unknown>,
        }),
      postRawBody: async (body) =>
        await ofetchBase("/users", {
          method: "POST",
          body,
          headers: { "Content-Type": "text/plain" },
        }),
      withDefaultsGetJson: async () => await ofetchDefaulted("/users/1"),
    },
    zap: {
      apiGetValidated: async () => await zapApi.get(USER_URL, responseSchema),
      apiPostJsonValidated: async (body) =>
        await zapApi.post(USERS_URL, responseSchema, {
          json: body,
        }),
      createFetchApiGetValidated: async () =>
        await zapDefaulted.api.get("/users/1", responseSchema),
      createFetchPrimitiveGetJson: async () =>
        await (await zapDefaulted.$fetch("/users/1")).json(),
      primitiveGetJson: async () => await (await zapFetch(USER_URL)).json(),
      primitivePostJson: async (body) =>
        await (
          await zapFetch(USERS_URL, {
            method: "POST",
            json: body,
          })
        ).json(),
      primitivePostRawBody: async (body) =>
        await (await zapFetch(USERS_URL, { method: "POST", body })).json(),
      schemaOnlyValidate: async () =>
        await responseSchema.parseAsync(await (await fetch(USER_URL)).json()),
    },
  };
}
