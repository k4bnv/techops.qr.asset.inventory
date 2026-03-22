// White-label: Crisp chat/telemetry disabled for TechOps self-hosted instance
import type { HTMLButtonProps } from "../shared/button";
import { Button } from "../shared/button";

export function useCrisp() {
  // no-op: Crisp disabled
}

export const CrispButton = (props: Omit<HTMLButtonProps, "type">) => (
  <Button {...props} type="button">
    {props.children}
  </Button>
);
