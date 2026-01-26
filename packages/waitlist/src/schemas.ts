import z from "zod";

const EmailSchema: z.ZodEmail = z.email();

export const EmailEntrySchema: z.ZodObject<{
  email: z.ZodEmail;
  createdAt: z.ZodCoercedDate;
  referralCode: z.ZodOptional<z.ZodString>;
  referredBy: z.ZodOptional<z.ZodString>;
  meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}> = z.object({
  email: EmailSchema,
  createdAt: z.coerce.date(),
  referralCode: z.string().optional(),
  referredBy: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const ReferralLinkSchema: z.ZodObject<{
  referrer: z.ZodEmail;
  referee: z.ZodEmail;
  createdAt: z.ZodCoercedDate;
}> = z.object({
  referrer: EmailSchema,
  referee: EmailSchema,
  createdAt: z.coerce.date(),
});

export const JoinSuccessSchema: z.ZodObject<{
  ok: z.ZodLiteral<true>;
  entry: typeof EmailEntrySchema;
  referralLink: z.ZodOptional<typeof ReferralLinkSchema>;
}> = z.object({
  ok: z.literal(true),
  entry: EmailEntrySchema,
  referralLink: ReferralLinkSchema.optional(),
});

export const JoinErrorSchema: z.ZodObject<{
  ok: z.ZodLiteral<false>;
  reason: z.ZodUnion<
    [z.ZodLiteral<"invalid-email">, z.ZodLiteral<"already-registered">]
  >;
  message: z.ZodOptional<z.ZodString>;
}> = z.object({
  ok: z.literal(false),
  reason: z.union([
    z.literal("invalid-email"),
    z.literal("already-registered"),
  ]),
  message: z.string().optional(),
});

export const JoinResultSchema: z.ZodUnion<
  [typeof JoinSuccessSchema, typeof JoinErrorSchema]
> = z.union([JoinSuccessSchema, JoinErrorSchema]);

export const LeaderboardEntrySchema: z.ZodObject<{
  email: z.ZodEmail;
  score: z.ZodNumber;
}> = z.object({
  email: EmailSchema,
  score: z.number(),
});

export const LeaderboardResponseSchema: z.ZodArray<
  typeof LeaderboardEntrySchema
> = z.array(LeaderboardEntrySchema);

export const EmailEntryListResponseSchema: z.ZodArray<typeof EmailEntrySchema> =
  z.array(EmailEntrySchema);

export const EmailListResponseSchema: z.ZodArray<typeof EmailSchema> =
  z.array(EmailSchema);

export const ReferralLinkListResponseSchema: z.ZodArray<
  typeof ReferralLinkSchema
> = z.array(ReferralLinkSchema);

export const EmailEntryResponseSchema: z.ZodNullable<typeof EmailEntrySchema> =
  EmailEntrySchema.nullable();

export const CountResponseSchema: z.ZodNumber = z.number();

export const PositionResponseSchema: z.ZodNullable<z.ZodNumber> = z
  .number()
  .nullable();

export const EmptyResponseSchema: z.ZodUnknown = z.unknown();
