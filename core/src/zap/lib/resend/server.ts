import "server-only";

import { Resend } from "resend";

import { ENV } from "@/lib/env.server";

export const resend = new Resend(ENV.RESEND_API_KEY);
