import { Authenticator } from "remix-auth";
import { sessionStorage, type AuthSession } from "~/../server/session";

/**
 * Configure the Authenticator
 */
export const authenticator = new Authenticator<AuthSession>();
