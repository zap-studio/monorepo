import { defineConfig } from "tsdown";

export function createConfig(overrides = {}) {
	return defineConfig({
		entry: "src/**/*.ts",
		format: ["cjs", "esm"],
		exports: true,
		dts: true,
		...overrides,
	});
}
