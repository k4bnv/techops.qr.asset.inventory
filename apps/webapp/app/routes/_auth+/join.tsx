import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  MetaFunction,
} from "react-router";
import { redirect, data, useActionData, useNavigation } from "react-router";

import { useZorm } from "react-zorm";
import { z } from "zod";
import { Form } from "~/components/custom-form";

import Input from "~/components/forms/input";
import PasswordInput from "~/components/forms/password-input";
import { Button } from "~/components/shared/button";
import { config } from "~/config/shelf.config";
import { useSearchParams } from "~/hooks/search-params";
import { ContinueWithEmailForm } from "~/modules/auth/components/continue-with-email-form";
import { signUpWithEmailPass } from "~/modules/auth/service.server";
import { findUserByEmail } from "~/modules/user/service.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import {
  ShelfError,
  isZodValidationError,
  makeShelfError,
  notAllowedMethod,
} from "~/utils/error";
import { isFormProcessing } from "~/utils/form";
import {
  payload,
  error,
  getActionMethod,
  parseData,
} from "~/utils/http.server";
import { validEmail } from "~/utils/misc";
import { validateNonSSOSignup } from "~/utils/sso.server";

export function loader({ context }: LoaderFunctionArgs) {
  const title = "Account aanmaken";
  const subHeading = "Begin uw reis met TechOps";
  const { disableSignup } = config;

  try {
    if (disableSignup) {
      throw new ShelfError({
        cause: null,
        title: "Aanmelden is uitgeschakeld",
        message:
          "Neem contact op met uw werkruimtebeheerder voor meer informatie.",
        label: "User onboarding",
        status: 403,
        shouldBeCaptured: false,
      });
    }
    if (context.isAuthenticated) {
      return redirect("/assets");
    }

    return data(payload({ title, subHeading }));
  } catch (cause) {
    const reason = makeShelfError(cause);
    throw data(error(reason), { status: reason.status });
  }
}

const JoinFormSchema = z
  .object({
    email: z
      .string()
      .transform((email) => email.toLowerCase())
      .refine(validEmail, () => ({
        message: "Vul een geldig e-mailadres in",
      })),
    password: z
      .string()
      .min(8, "Uw wachtwoord is te kort. Minimaal 8 tekens vereist."),
    confirmPassword: z
      .string()
      .min(8, "Uw wachtwoord is te kort. Minimaal 8 tekens vereist."),
    redirectTo: z.string().optional(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Wachtwoord en bevestig wachtwoord moeten overeenkomen",
        path: ["confirmPassword"],
      });
    }
  });

export async function action({ request }: ActionFunctionArgs) {
  try {
    const method = getActionMethod(request);

    switch (getActionMethod(request)) {
      case "POST": {
        const { email, password } = parseData(
          await request.formData(),
          JoinFormSchema,
          { shouldBeCaptured: false }
        );
        // Block signup if domain uses SSO
        await validateNonSSOSignup(email);

        const existingUser = await findUserByEmail(email);

        if (existingUser) {
          throw new ShelfError({
            cause: null,
            message: "Gebruiker met dit e-mailadres bestaat al, log in plaats daarvan in",
            additionalData: {
              email,
            },
            label: "User onboarding",
            shouldBeCaptured: false,
            status: 409,
          });
        }

        // Sign up with the provided email and password
        await signUpWithEmailPass(email, password);

        return redirect(
          `/otp?email=${encodeURIComponent(email)}&mode=confirm_signup`
        );
      }
    }

    throw notAllowedMethod(method);
  } catch (cause) {
    const reason = makeShelfError(
      cause,
      undefined,
      isZodValidationError(cause)
    );
    return data(error(reason), { status: reason.status });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.title) : "" },
];

export default function Join() {
  const zo = useZorm("NewQuestionWizardScreen", JoinFormSchema);
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const navigation = useNavigation();
  const disabled = isFormProcessing(navigation.state);
  const data = useActionData<typeof action>();

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        <Form ref={zo.ref} method="post" className="space-y-6" replace>
          <div>
            <Input
              data-test-id="email"
              label="E-mailadres"
              placeholder="zaans@huisje.com"
              required
              autoFocus={true}
              name={zo.fields.email()}
              type="email"
              autoComplete="email"
              disabled={disabled}
              inputClassName="w-full"
              error={zo.errors.email()?.message || data?.error.message}
            />
          </div>

          <PasswordInput
            label="Wachtwoord"
            placeholder="**********"
            required
            data-test-id="password"
            name={zo.fields.password()}
            autoComplete="new-password"
            disabled={disabled}
            inputClassName="w-full"
            error={zo.errors.password()?.message}
          />
          <PasswordInput
            label="Bevestig wachtwoord"
            placeholder="**********"
            required
            data-test-id="confirmPassword"
            name={zo.fields.confirmPassword()}
            autoComplete="new-password"
            disabled={disabled}
            inputClassName="w-full"
            error={zo.errors.confirmPassword()?.message}
          />

          <input
            type="hidden"
            name={zo.fields.redirectTo()}
            value={redirectTo}
          />
          <Button
            className="text-center"
            type="submit"
            data-test-id="login"
            disabled={disabled}
            width="full"
          >
            Aan de slag
          </Button>
        </Form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                {"Of gebruik een eenmalig wachtwoord"}
              </span>
            </div>
          </div>
          <div className="mt-6">
            <ContinueWithEmailForm mode="signup" />
          </div>
        </div>
        <div className="flex items-center justify-center pt-5">
          <div className="text-center text-sm text-gray-500">
            {"Al een account? "}
            <Button
              variant="link"
              to={{
                pathname: "/",
                search: searchParams.toString(),
              }}
            >
              Inloggen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
