"use client";

import { AnimatePresence, motion } from "motion/react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ZapButton } from "@/zap/components/core/button";

import { useWaitlist } from "../hooks";

export function WaitlistForm() {
  const { form, onSubmit, data, isMutating, hasJoined } = useWaitlist();

  return (
    <Form {...form}>
      <motion.form
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-4"
        initial={{ opacity: 0, scale: 0.95 }}
        onSubmit={form.handleSubmit(onSubmit)}
        transition={{ duration: 0.4 }}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ZapButton
          className="w-full"
          disabled={hasJoined}
          loading={isMutating}
          loadingText="Joining..."
          type="submit"
        >
          Join Waitlist
        </ZapButton>

        <AnimatePresence>
          {data && (
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "text-sm",
                data ? "text-green-600" : "text-destructive"
              )}
              exit={{ opacity: 0, y: -5 }}
              initial={{ opacity: 0, y: -5 }}
              key="form-message"
              transition={{ duration: 0.3 }}
            >
              {data.message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.form>
    </Form>
  );
}
