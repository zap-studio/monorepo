import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WaitlistStore {
  hasJoined: boolean;
  setHasJoined: (hasJoined: boolean) => void;
}

export const useWaitlistStore = create<WaitlistStore>()(
  persist(
    (set) => ({
      hasJoined: false,
      setHasJoined: (hasJoined) => set({ hasJoined }),
    }),
    {
      name: "waitlist-store",
    },
  ),
);
