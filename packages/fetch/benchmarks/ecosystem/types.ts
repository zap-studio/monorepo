export type BenchmarkFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

type BenchmarkTask = () => Promise<unknown>;
type BenchmarkTaskWithBody = (body: unknown) => Promise<unknown>;
type BenchmarkTaskWithRawBody = (body: string) => Promise<unknown>;

export interface ClientSet {
  native: {
    getJson: BenchmarkTask;
    postJsonRaw: BenchmarkTaskWithBody;
    postRawBody: BenchmarkTaskWithRawBody;
  };
  ofetch: {
    getJson: BenchmarkTask;
    postJson: BenchmarkTaskWithBody;
    postRawBody: BenchmarkTaskWithRawBody;
    withDefaultsGetJson: BenchmarkTask;
  };
  ky: {
    getJson: BenchmarkTask;
    postJson: BenchmarkTaskWithBody;
    postRawBody: BenchmarkTaskWithRawBody;
    withDefaultsGetJson: BenchmarkTask;
  };
  axios: {
    getJson: BenchmarkTask;
    postJson: BenchmarkTaskWithBody;
    postRawBody: BenchmarkTaskWithRawBody;
    withDefaultsGetJson: BenchmarkTask;
  };
  betterFetch: {
    getJson: BenchmarkTask;
    postBodyObject: (body: Record<string, unknown>) => Promise<unknown>;
    postRawBody: BenchmarkTaskWithRawBody;
    withDefaultsGetJson: BenchmarkTask;
  };
  zap: {
    primitiveGetJson: BenchmarkTask;
    primitivePostJson: BenchmarkTaskWithBody;
    primitivePostRawBody: BenchmarkTaskWithRawBody;
    apiGetValidated: BenchmarkTask;
    apiPostJsonValidated: BenchmarkTaskWithBody;
    createFetchApiGetValidated: BenchmarkTask;
    createFetchPrimitiveGetJson: BenchmarkTask;
    schemaOnlyValidate: BenchmarkTask;
  };
}
