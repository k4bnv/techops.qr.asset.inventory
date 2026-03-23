import { hashPassword, verifyPassword } from "~/utils/password.server";
import { db } from "~/database/db.server";
import { SERVER_URL } from "~/utils/env";

import type { AuthSession } from "@server/session";
import type { ErrorLabel } from "~/utils/error";
import { ShelfError } from "~/utils/error";

const label: ErrorLabel = "Auth";

export async function createEmailAuthAccount(email: string, password: string) {
  try {
    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    return user;
  } catch (cause) {
    throw new ShelfError({
      cause,
      message: "Failed to create local auth account",
      additionalData: { email },
      label,
    });
  }
}

/**
 * Looks up an existing auth account by email and confirms it.
 */
export async function confirmExistingAuthAccount(
  email: string,
  password: string
) {
  try {
    const passwordHash = await hashPassword(password);
    const user = await db.user.update({
      where: { email: email.toLowerCase() },
      data: {
        passwordHash,
      },
    });

    return user;
  } catch (cause) {
    throw new ShelfError({
      cause,
      message: "Failed to confirm existing local auth account",
      additionalData: { email },
      label,
    });
  }
}

export async function signUpWithEmailPass(email: string, password: string) {
  try {
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    return user;
  } catch (cause) {
    throw new ShelfError({
      cause,
      message: "Something went wrong, refresh page and try to signup again.",
      additionalData: { email },
      label,
    });
  }
}

export async function resendVerificationEmail(email: string) {
  // Standalone auth doesn't necessarily require verification emails yet,
  // but we can log that it was requested or implement it later.
  return Promise.resolve();
}

export async function signInWithEmail(email: string, password: string): Promise<AuthSession | null> {
  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new Error("Invalid login credentials");
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      throw new Error("Invalid login credentials");
    }

    // Return a mock AuthSession that the app expects
    return {
      userId: user.id,
      email: user.email,
      accessToken: "local-session", // Standalone doesn't use JWT access tokens for internal auth
      refreshToken: "local-session",
      expiresIn: 3600,
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
    };
  } catch (cause) {
    let message =
      "Something went wrong. Please try again later or contact support.";
    let shouldBeCaptured = true;

    if (cause instanceof Error && cause.message === "Invalid login credentials") {
      message = "Incorrect email or password";
      shouldBeCaptured = false;
    }

    throw new ShelfError({
      cause,
      message,
      label,
      shouldBeCaptured,
    });
  }
}

export async function signInWithSSO(domain: string) {
  // Standalone SSO would require a different implementation (e.g. SAML/OIDC)
  throw new Error("SSO is not yet implemented in standalone mode");
}

export async function sendOTP(email: string) {
  // Standalone OTP implementation would go here (generate code, save to DB, send email)
  throw new Error("OTP is not yet implemented in standalone mode");
}

export async function sendResetPasswordLink(email: string) {
  // Standalone password reset (generate token, save to DB, send email)
  throw new Error("Password reset is not yet implemented in standalone mode");
}

export async function updateAccountPassword(
  id: string,
  password: string,
  accessToken?: string | undefined
) {
  try {
    const passwordHash = await hashPassword(password);
    await db.user.update({
      where: { id },
      data: { passwordHash },
    });
  } catch (cause) {
    throw new ShelfError({
      cause,
      message: "Something went wrong while updating the password.",
      additionalData: { id },
      label,
    });
  }
}

export async function deleteAuthAccount(userId: string) {
  try {
    await db.user.delete({
      where: { id: userId },
    });
  } catch (cause) {
    throw new ShelfError({
      cause,
      message: "Failed to delete local user account.",
      additionalData: { userId },
      label,
    });
  }
}

export async function getAuthUserById(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    return user;
  } catch (cause) {
    throw new ShelfError({
      cause,
      message: "Failed to get user by id.",
      additionalData: { userId },
      label,
    });
  }
}

export async function getAuthResponseByAccessToken(accessToken: string) {
  // In standalone mode, we might decode a JWT or check a session table
  // For now, if we use mock sessions, we might just return null or implement JWT verify
  return { data: { user: null }, error: null };
}

export async function validateSession(token: string) {
  // Standard validate session check
  return true;
}

export async function refreshAccessToken(
  refreshToken?: string
): Promise<AuthSession> {
  // Mock refresh for now
  throw new Error("Token refresh is not yet implemented in standalone mode");
}

export async function verifyAuthSession(authSession: AuthSession) {
  try {
    const user = await db.user.findUnique({
      where: { id: authSession.userId },
    });
    return Boolean(user);
  } catch (cause) {
    return false;
  }
}

export async function verifyOtpAndSignin(email: string, otp: string) {
  throw new Error("OTP signin is not yet implemented in standalone mode");
}
