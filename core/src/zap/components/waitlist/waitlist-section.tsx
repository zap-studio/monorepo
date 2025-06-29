"use client";

import { AnimatePresence, motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ZapButton } from "@/components/zap-ui/button";
import { cn } from "@/lib/utils";
import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { AnimatedNumber } from "@/zap/components/misc/animated-number";
import { useWaitlist } from "@/zap/hooks/waitlist/use-waitlist";

export function WaitlistSection() {
  const { form, onSubmit, result, loading, waitlistCount } = useWaitlist();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle variant="ghost" />
      </div>

      <div className="mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full"
        >
          {ZAP_DEFAULT_SETTINGS.WAITLIST.SHOW_COUNT && (
            <Badge variant={"secondary"} className="mb-4">
              <span className="font-semibold">
                <AnimatedNumber value={waitlistCount} />
              </span>{" "}
              people already joined the waitlist
            </Badge>
          )}

          <h1 className="text-2xl font-semibold">
            {ZAP_DEFAULT_SETTINGS.WAITLIST.TITLE}
          </h1>
          <p className="text-muted-foreground mb-6 text-base">
            {ZAP_DEFAULT_SETTINGS.WAITLIST.DESCRIPTION}
          </p>
        </motion.div>

        <Form {...form}>
          <motion.form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full max-w-md space-y-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
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
              loading={loading}
              loadingText="Joining..."
              type="submit"
              className="w-full"
            >
              Join Waitlist
            </ZapButton>

            <AnimatePresence>
              {result && (
                <motion.p
                  key="form-message"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "text-sm",
                    result.success ? "text-green-600" : "text-destructive",
                  )}
                >
                  {result.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.form>
        </Form>
      </div>
    </div>
  );
}
