import { SERVER_ENV } from "../server";

export const RUNTIME = SERVER_ENV.NEXT_RUNTIME;
export const NODEJS = RUNTIME === "nodejs";
export const EDGE = RUNTIME === "edge";
