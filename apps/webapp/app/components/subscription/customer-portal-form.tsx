import type { ComponentProps } from "react";
import { useFetcher } from "react-router";
import { isFormProcessing } from "~/utils/form";
import { Button } from "../shared/button";

export const CustomerPortalForm = ({
  buttonText = "Ga naar het klantenportaal",
  buttonProps,
  className,
}: {
  buttonText?: string;
  buttonProps?: ComponentProps<typeof Button>;
  className?: string;
}) => {
  const customerPortalFetcher = useFetcher();
  const isProcessing = isFormProcessing(customerPortalFetcher.state);
  return (
    <customerPortalFetcher.Form
      method="post"
      action="/account-details/subscription/customer-portal"
      className={className}
    >
      <Button type="submit" disabled={isProcessing} {...buttonProps}>
        {isProcessing ? "Doorsturen naar het klantenportaal..." : buttonText}
      </Button>
    </customerPortalFetcher.Form>
  );
};
