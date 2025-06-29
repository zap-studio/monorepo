import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type ButtonProps = React.ComponentProps<typeof Button>;

interface ZapButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function ZapButton({ children, ...props }: ZapButtonProps) {
  if (props.loading) {
    return (
      <Button {...props} disabled>
        <Loader2 className="animate-spin" size={16} />
        {props.loadingText || children}
      </Button>
    );
  }

  return <Button {...props}>{children}</Button>;
}
