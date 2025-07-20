import "server-only";

import { Resend } from "resend";

import { SERVER_ENV } from "@/lib/env.server";

export const resend = new Resend(SERVER_ENV.RESEND_API_KEY);
