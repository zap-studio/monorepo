import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WaitlistStoreState {
  hasJoined: boolean;
}

interface WaitlistStoreActions {
  setHasJoined: (hasJoined: boolean) => void;
}

export const useWaitlistStore = create<
  WaitlistStoreState & WaitlistStoreActions
>()(
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
