import { Resend } from "resend";

import { warnOptionalEnv } from "@/lib/env";

const RESEND_API_KEY = warnOptionalEnv("RESEND_API_KEY");
export const resend = new Resend(RESEND_API_KEY);
