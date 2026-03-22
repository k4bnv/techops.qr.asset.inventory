import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, redirect, useActionData } from "react-router";
import { useZorm } from "react-zorm";
import { z } from "zod";
import { Form } from "~/components/custom-form";
import Input from "~/components/forms/input";
import { ShelfOTP } from "~/components/forms/otp-input";
import PasswordInput from "~/components/forms/password-input";
import { Button } from "~/components/shared/button";
import { db } from "~/database/db.server";
import { useSearchParams } from "~/hooks/search-params";
import { useDisabled } from "~/hooks/use-disabled";
import { getSupabaseAdmin } from "~/integrations/supabase/client";

import {
  sendResetPasswordLink,
  updateAccountPassword,
} from "~/modules/auth/service.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { makeShelfError, ShelfError } from "~/utils/error";
import {
  payload,
  error,
  getCurrentSearchParams,
  parseData,
} from "~/utils/http.server";
import { validEmail } from "~/utils/misc";

const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .transform((email) => email.toLowerCase())
    .refine(validEmail, () => ({
      message: "Vul alstublieft een geldig e-mailadres in",
    })),
});

const OtpSchema = z
  .object({
    otp: z.string().min(6, "OTP is vereist."),
    email: z.string().transform((email) => email.toLowerCase()),
    password: z.string().min(8, "Wachtwoord is te kort. Minimaal 8 tekens."),
    confirmPassword: z
      .string()
      .min(8, "Wachtwoord is te kort. Minimaal 8 tekens."),
  })
  .superRefine(({ password, confirmPassword, otp, email }, ctx) => {
    if (password !== confirmPassword) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Wachtwoord en bevestig wachtwoord moeten overeenkomen",
        path: ["confirmPassword"],
      });
    }

    return { password, confirmPassword, otp, email };
  });

export function loader({ context, request }: LoaderFunctionArgs) {
  const searchParams = getCurrentSearchParams(request);

  const title = "Wachtwoord vergeten?";
  const subHeading =
    searchParams.has("email") && searchParams.get("email") !== ""
      ? "Stap 2 van 2: Voer OTP en uw nieuwe wachtwoord in"
      : "Stap 1 van 2: Voer uw e-mailadres in";

  if (context.isAuthenticated) {
    return redirect("/assets");
  }

  return data(payload({ title, subHeading }));
}

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const { intent } = parseData(
      await request.clone().formData(),
      z.object({ intent: z.enum(["request-otp", "confirm-otp"]) }),
      {
        message:
          "Ongeldige aanvraag. Probeer het opnieuw. Neem contact op met ondersteuning als het probleem aanhoudt.",
        shouldBeCaptured: false,
      }
    );

    switch (intent) {
      case "request-otp": {
        const { email } = parseData(
          await request.formData(),
          ForgotPasswordSchema,
          { shouldBeCaptured: false }
        );

        /** We are going to get the user to make sure it exists and is confirmed
         * this will not allow the user to use the forgot password before they have confirmed their email
         */
        const user = await db.user.findFirst({
          where: { email },
          select: {
            id: true,
            sso: true,
          },
        });

        if (!user) {
          throw new ShelfError({
            cause: null,
            message:
              "De gebruiker met dit e-mailadres is nog niet bevestigd, dus u kunt het wachtwoord niet herstellen. Bevestig uw gebruiker voordat u doorgaat",
            additionalData: { email },
            shouldBeCaptured: false,
            label: "Auth",
          });
        }

        if (user.sso) {
          throw new ShelfError({
            cause: null,
            message:
              "Deze gebruiker is een SSO-gebruiker en kan zijn wachtwoord niet via e-mail herstellen.",
            additionalData: { email },
            shouldBeCaptured: false,
            label: "Auth",
          });
        }

        await sendResetPasswordLink(email);

        return redirect("/forgot-password?email=" + email);
      }
      case "confirm-otp": {
        const { email, otp, password } = parseData(
          await request.clone().formData(),
          OtpSchema,
          { shouldBeCaptured: false }
        );

        // Attempt to verify the OTP
        const { data: otpData, error: verifyError } =
          await getSupabaseAdmin().auth.verifyOtp({
            email,
            token: otp,
            type: "recovery",
          });

        if (verifyError || !otpData.user || !otpData.session) {
          throw new ShelfError({
            cause: verifyError,
            message: "Ongeldige of verlopen verificatiecode",
            additionalData: { email, otp },
            label: "Auth",
            shouldBeCaptured: false,
          });
        }

        await updateAccountPassword(
          otpData.user.id,
          password,
          otpData.session.access_token
        );

        context.destroySession();
        return redirect("/login?password_reset=true");
      }
    }
  } catch (cause) {
    const reason = makeShelfError(cause);
    return data(error(reason), { status: reason.status });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.title) : "" },
];

export default function ForgotPassword() {
  const zo = useZorm("ForgotPasswordForm", ForgotPasswordSchema);
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const emailError =
    zo.errors.email()?.message || actionData?.error?.message || "";
  const disabled = useDisabled();

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full">
        {actionData?.error || !email || email === "" ? (
          <div>
            <p className="mb-4 text-center">
              Voer uw e-mailadres in en we sturen u een eenmalige code om uw wachtwoord te herstellen.
            </p>
            <Form ref={zo.ref} method="post" className="space-y-2" replace>
              <input type="hidden" name="intent" value="request-otp" />
              <div>
                <Input
                  label="E-mailadres"
                  data-test-id="email"
                  name={zo.fields.email()}
                  type="email"
                  autoComplete="email"
                  inputClassName="w-full"
                  placeholder="zaans@huisje.com"
                  disabled={disabled}
                  error={emailError}
                />
              </div>

              <Button
                data-test-id="send-password-reset-link"
                width="full"
                type="submit"
                disabled={disabled}
              >
                {!disabled ? "Wachtwoord herstellen" : "Code verzenden..."}
              </Button>
            </Form>
            <p className="mt-2 text-center text-gray-500">
              Tip: Controleer uw spambox als u de e-mail niet binnen een paar minuten ziet.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-2">
              We hebben een 6-cijferige code gestuurd naar{" "}
              <span className="font-semibold">{email}</span>.
            </p>
            <ol className="mb-4 list-inside list-decimal">
              <li>Voer de code uit uw e-mail in</li>
              <li>Voer uw nieuwe wachtwoord in</li>
              <li>Bevestig uw nieuwe wachtwoord</li>
            </ol>
            <PasswordResetForm email={email} />
          </>
        )}
        <div className="pt-4 text-center">
          {email ? (
            <Button variant="link" to={"/forgot-password"}>
              Nieuwe code aanvragen
            </Button>
          ) : (
            <Button variant="link" to={"/login"}>
              Terug naar inloggen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordResetForm({ email }: { email: string }) {
  const zoReset = useZorm("ResetPasswordForm", OtpSchema);
  const disabled = useDisabled();
  const actionData = useActionData<typeof action>();
  return !email || email === "" || actionData?.error ? (
    <div>Er is iets misgegaan. Vernieuw de pagina en probeer het opnieuw.</div>
  ) : (
    <Form method="post" ref={zoReset.ref} className="space-y-2">
      <ShelfOTP error={zoReset.errors.otp()?.message} />

      <PasswordInput
        label="Nieuw wachtwoord"
        data-test-id="password"
        name={zoReset.fields.password()}
        type="password"
        autoComplete="new-password"
        disabled={disabled}
        error={zoReset.errors.password()?.message}
        placeholder="********"
        required
      />
      <PasswordInput
        label="Bevestig nieuw wachtwoord"
        data-test-id="confirmPassword"
        name={zoReset.fields.confirmPassword()}
        type="password"
        autoComplete="new-password"
        disabled={disabled}
        error={zoReset.errors.confirmPassword()?.message}
        placeholder="********"
        required
      />

      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="intent" value="confirm-otp" />

      <Button
        data-test-id="create-account"
        type="submit"
        className="w-full "
        disabled={disabled}
      >
        Wachtwoordherstel bevestigen
      </Button>
    </Form>
  );
}
