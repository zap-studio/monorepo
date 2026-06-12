const baseValidInput = {
  active: true,
  age: 37,
  email: "ada@example.com",
  name: "Ada",
};

const baseInvalidInput = {
  active: "yes",
  age: -1,
  email: "not-an-email",
  name: "",
};

export const inputTiers = [
  {
    invalid: baseInvalidInput,
    name: "small",
    valid: baseValidInput,
  },
  {
    invalid: {
      ...baseInvalidInput,
      metadata: {
        createdAt: "not-a-date",
        tags: [1, 2, 3],
      },
      profile: {
        bio: "",
        city: 42,
      },
    },
    name: "medium",
    valid: {
      ...baseValidInput,
      metadata: {
        createdAt: "2026-04-24T00:00:00.000Z",
        tags: ["a", "b", "c", "d", "e"],
      },
      profile: {
        bio: "Example profile bio",
        city: "Montreal",
      },
    },
  },
  {
    invalid: {
      ...baseInvalidInput,
      history: Array.from({ length: 50 }, (_, index) => ({
        index: `bad-${index}`,
        ok: "maybe",
        value: index,
      })),
      metadata: {
        createdAt: "invalid",
        notes: 42,
        tags: Array.from({ length: 25 }, () => 999),
      },
    },
    name: "large",
    valid: {
      ...baseValidInput,
      history: Array.from({ length: 50 }, (_, index) => ({
        index,
        ok: index % 2 === 0,
        value: `item-${index}`,
      })),
      metadata: {
        createdAt: "2026-04-24T00:00:00.000Z",
        notes: "A longer metadata object for benchmark payload size.",
        tags: Array.from({ length: 25 }, (_, index) => `tag-${index}`),
      },
    },
  },
] as const;
