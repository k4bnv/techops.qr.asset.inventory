import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage, type AuthSession } from "~/../server/session";
import { signInWithEmail } from "./service.server";

/**
 * Configure the Authenticator with the session storage
 */
export const authenticator = new Authenticator<AuthSession>(sessionStorage);

/**
 * Register the FormStrategy for email/password login
 */
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const authSession = await signInWithEmail(email, password);

    if (!authSession) {
      throw new Error("Invalid email or password");
    }

    return authSession;
  }),
  "user-pass"
);
