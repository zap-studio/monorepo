export const maxAttempts = 3;

export type BenchmarkTask = () => "ok" | Promise<"ok">;

export const createSuccessFirstTask = (): BenchmarkTask => () => "ok";

export const createSuccessAfterTwoRetriesTask = (): BenchmarkTask => {
  let failures = 0;

  return () => {
    if (failures < 2) {
      failures += 1;
      throw new Error("benchmark-failure");
    }

    return "ok";
  };
};

export const createAlwaysFailTask = (): BenchmarkTask => () => {
  throw new Error("benchmark-failure");
};
