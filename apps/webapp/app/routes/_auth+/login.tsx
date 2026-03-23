import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import {
  data,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";

import { useZorm } from "react-zorm";
import { z } from "zod";
import { Form } from "~/components/custom-form";

import Input from "~/components/forms/input";
import PasswordInput from "~/components/forms/password-input";
import { Button } from "~/components/shared/button";
import { config } from "~/config/shelf.config";
import { useSearchParams } from "~/hooks/search-params";
import { ContinueWithEmailForm } from "~/modules/auth/components/continue-with-email-form";
import { authenticator } from "~/modules/auth/auth.server";
import { signInWithEmail } from "~/modules/auth/service.server";

import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import {
  isLikeShelfError,
  isZodValidationError,
  makeShelfError,
  notAllowedMethod,
} from "~/utils/error";
import { isFormProcessing } from "~/utils/form";
import {
  payload,
  error,
  getActionMethod,
  safeRedirect,
} from "~/utils/http.server";
import { validEmail } from "~/utils/misc";

export async function loader({ request }: LoaderFunctionArgs) {
  const title = "Inloggen";
  const subHeading = "Welkom terug! Vul uw gegevens hieronder in om in te loggen.";
  const { disableSignup, disableSSO } = config;

  const { sessionStorage } = await import("~/../server/session");
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  if (session.has("user")) {
    throw redirect("/assets");
  }

  return data(payload({ title, subHeading, disableSignup, disableSSO }));
}

const LoginFormSchema = z.object({
  email: z
    .string()
    .transform((email) => email.toLowerCase())
    .refine(validEmail, () => ({
      message: "Vul alstublieft een geldig e-mailadres in",
    })),
  password: z.string().min(8, "Wachtwoord is te kort. Minimaal 8 tekens."),
  redirectTo: z.string().optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  try {
    const method = getActionMethod(request);

    if (method !== "POST") {
      throw notAllowedMethod(method);
    }

    // Get the form data to extract redirectTo, email and password
    const clonedRequest = request.clone();
    const formData = await clonedRequest.formData();
    const redirectTo = (formData.get("redirectTo") as string) || "/assets";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const authSession = await signInWithEmail(email, password);

    if (!authSession) {
      throw new Error("Invalid email or password");
    }

    const { sessionStorage } = await import("~/../server/session");
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    session.set("user", authSession);

    return data(null, {
      status: 303,
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
        Location: safeRedirect(redirectTo),
      },
    });
  } catch (cause) {
    const reason = makeShelfError(
      cause,
      undefined,
      isLikeShelfError(cause)
        ? cause.shouldBeCaptured
        : !isZodValidationError(cause)
    );
    return data(error(reason), { status: reason.status });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.title) : "" },
];

export default function IndexLoginForm() {
  const { disableSignup, disableSSO } = useLoaderData<typeof loader>();
  const zo = useZorm("NewQuestionWizardScreen", LoginFormSchema);
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const acceptedInvite = searchParams.get("acceptedInvite");
  const passwordReset = searchParams.get("password_reset");
  const actionData = useActionData<typeof action>();

  const navigation = useNavigation();
  const disabled = isFormProcessing(navigation.state);

  return (
    <div className="w-full max-w-md">
      {acceptedInvite ? (
        <div className="mb-8 text-center text-success-600">
          Succesvol geaccepteerde werkruimte-uitnodiging. Log in om uw nieuwe werkruimte te zien.
        </div>
      ) : null}

      {passwordReset ? (
        <div className="mb-8 text-center text-success-600">
          U heeft succesvol uw wachtwoord hersteld. U kunt nu inloggen met uw nieuwe wachtwoord.
        </div>
      ) : null}
      <Form ref={zo.ref} method="post" replace className="flex flex-col gap-5">
        <div>
          <Input
            data-test-id="email"
            label="E-mailadres"
            placeholder="zaans@huisje.com"
            required
            autoFocus={true}
            name={zo.fields.email()}
            type="email"
            autoComplete="username"
            disabled={disabled}
            inputClassName="w-full"
            error={zo.errors.email()?.message || actionData?.error?.message}
          />
        </div>
        <PasswordInput
          label="Wachtwoord"
          placeholder="**********"
          data-test-id="password"
          name={zo.fields.password()}
          autoComplete="current-password"
          disabled={disabled}
          inputClassName="w-full"
          error={zo.errors.password()?.message || actionData?.error?.message}
        />
        <input type="hidden" name={zo.fields.redirectTo()} value={redirectTo} />
        <Button
          className="text-center"
          type="submit"
          data-test-id="login"
          disabled={disabled}
        >
          Inloggen
        </Button>
        <div className="flex flex-col items-center justify-center">
          <div className="text-center text-sm text-gray-500">
            Wachtwoord vergeten?{" "}
            <Button
              variant="link"
              to={{
                pathname: "/forgot-password",
                search: searchParams.toString(),
              }}
            >
              Wachtwoord herstellen
            </Button>
          </div>
        </div>
      </Form>
      {!disableSSO && (
        <div className="mt-6 text-center">
          <Button variant="link" to="/sso-login">
            Inloggen met SSO
          </Button>
        </div>
      )}

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">
              Of gebruik een{" "}
              <strong title="Eenmalig wachtwoord (OTP) is de meest veilige manier om in te loggen. We sturen u een code naar uw e-mailadres.">
                Eenmalig Wachtwoord
              </strong>
            </span>
          </div>
        </div>
        <div className="mt-6">
          <ContinueWithEmailForm mode="login" />
        </div>
        {/* Registration is disabled per user request */}
      </div>
    </div>
  );
}
