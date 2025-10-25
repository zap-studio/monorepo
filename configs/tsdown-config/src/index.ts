import { defineConfig } from "tsdown";

export function createConfig(overrides = {}) {
	return defineConfig({
		entry: "src/**/*.ts",
		exports: true,
		dts: true,
		...overrides,
	});
}
