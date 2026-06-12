import { z } from "zod";

export const responseSchema = z.object({
  active: z.boolean(),
  email: z.email(),
  id: z.number(),
  metadata: z.object({
    locale: z.string(),
    score: z.number(),
  }),
  name: z.string(),
  tags: z.array(z.string()),
});

export const payloadTiers = [
  {
    body: { hello: "world" },
    name: "small",
    response: {
      active: true,
      email: "ada@example.com",
      id: 1,
      metadata: { locale: "en", score: 1 },
      name: "Ada",
      tags: ["core"],
    },
  },
  {
    body: {
      flags: { beta: true, staff: false },
      hello: "world",
      profile: { city: "Montreal", country: "CA", postalCode: "H2X" },
    },
    name: "medium",
    response: {
      active: true,
      email: "grace@example.com",
      id: 2,
      metadata: { locale: "en-CA", score: 42 },
      name: "Grace",
      tags: ["core", "team", "paid"],
    },
  },
  {
    body: {
      hello: "world",
      history: Array.from({ length: 30 }, (_, index) => ({
        key: `k-${index}`,
        value: `v-${index}`,
      })),
      profile: {
        city: "Montreal",
        country: "CA",
        nested: {
          level1: {
            level2: {
              level3: {
                value: "deep",
              },
            },
          },
        },
      },
    },
    name: "large",
    response: {
      active: true,
      email: "linus@example.com",
      id: 3,
      metadata: { locale: "en-US", score: 999 },
      name: "Linus",
      tags: Array.from({ length: 10 }, (_, index) => `tag-${index}`),
    },
  },
] as const;
