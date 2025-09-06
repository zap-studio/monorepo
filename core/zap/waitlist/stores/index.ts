import { create } from "zustand";
import { persist } from "zustand/middleware";

type WaitlistStoreState = {
  hasJoined: boolean;
};

type WaitlistStoreActions = {
  setHasJoined: (hasJoined: boolean) => void;
};

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
    }
  )
);
