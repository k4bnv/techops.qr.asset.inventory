import { useFetcher } from "react-router";
import { useZorm } from "react-zorm";
import { z } from "zod";
import Input from "~/components/forms/input";
import { Button } from "~/components/shared/button";

import type { action } from "~/routes/_auth+/send-otp";
import { validEmail } from "~/utils/misc";
import { tw } from "~/utils/tw";
export const SendOtpSchema = z.object({
  /**
   * .email() has an issue with validating email
   * addresses where the there is a subdomain and a dash included:
   * https://github.com/colinhacks/zod/pull/2157
   * So we use the custom validation
   *  */
  email: z
    .string()
    .transform((email) => email.toLowerCase())
    .refine(validEmail, () => ({
      message: "Vul alstublieft een geldig e-mailadres in",
    })),
  mode: z.enum(["login", "signup", "confirm_signup"]).optional(),
});

export function ContinueWithEmailForm({ mode }: { mode: "login" | "signup" }) {
  const sendOTP = useFetcher<typeof action>();
  const { data, state } = sendOTP;
  const zo = useZorm("NewQuestionWizardScreen", SendOtpSchema);

  const isLoading = state === "submitting" || state === "loading";
  const buttontext =
    mode === "login" ? "Doorgaan met OTP" : "Aanmelden met OTP";
  const buttonLabel = isLoading
    ? "We sturen u een eenmalig wachtwoord..."
    : buttontext;

  return (
    <sendOTP.Form method="post" action="/send-otp" ref={zo.ref}>
      <input type="hidden" name="mode" value={mode} />
      <Input
        label="E-mailadres"
        hideLabel={true}
        type="email"
        name="email"
        id="email"
        inputClassName="w-full"
        placeholder="zaans@huisje.com"
        disabled={isLoading}
        error={zo.errors.email()?.message || ""}
      />
      {data?.error.message ? (
        <div className={tw(` text-red-600`)}>{data.error.message}</div>
      ) : null}
      <Button
        type="submit"
        disabled={isLoading}
        width="full"
        variant="secondary"
        className="mt-3"
        data-test-id="continueWithOtpButton"
        title="Een Eenmalig Wachtwoord (OTP) is de meest veilige manier om in te loggen. We sturen u een code naar uw e-mailadres."
      >
        {buttonLabel}
      </Button>
    </sendOTP.Form>
  );
}
