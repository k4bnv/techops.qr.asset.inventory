import { Roles, AssetIndexMode, OrganizationRoles } from "@prisma/client";

import { matchRequestUrl, rest } from "msw";
import { server } from "@mocks";
import {
  SUPABASE_URL,
  SUPABASE_AUTH_TOKEN_API,
  SUPABASE_AUTH_ADMIN_USER_API,
  authSession,
  authAccount,
} from "@mocks/handlers";
import {
  ORGANIZATION_ID,
  USER_EMAIL,
  USER_ID,
  USER_PASSWORD,
} from "@mocks/user";
import { db } from "~/database/db.server";
import { hashPassword } from "~/utils/password.server";

import { USER_WITH_SSO_DETAILS_SELECT } from "./fields";
import {
  createUserAccountForTesting,
  createUserOrAttachOrg,
  defaultUserCategories,
} from "./service.server";
import { defaultFields } from "../asset-index-settings/helpers";

// @vitest-environment node
// 👋 see https://vitest.dev/guide/environment.html#environments-for-specific-files

// why: testing user account creation logic without executing actual database operations
vitest.mock("~/database/db.server", () => ({
  db: {
    $transaction: vitest.fn().mockImplementation((callback) => callback(db)),
    $queryRaw: vitest.fn().mockResolvedValue([]),
    user: {
      create: vitest.fn().mockResolvedValue({}),
      findFirst: vitest.fn().mockResolvedValue(null),
      findUnique: vitest.fn().mockResolvedValue(null),
      update: vitest.fn().mockResolvedValue({}),
      delete: vitest.fn().mockResolvedValue({}),
      deleteMany: vitest.fn().mockResolvedValue({ count: 0 }),
    },
    organization: {
      findFirst: vitest.fn().mockResolvedValue({
        id: ORGANIZATION_ID,
      }),
    },
    userOrganization: {
      upsert: vitest.fn().mockResolvedValue({}),
    },
  },
}));

vitest.mock("~/utils/password.server", () => ({
  hashPassword: vitest.fn().mockResolvedValue("hashed-password"),
  verifyPassword: vitest.fn().mockResolvedValue(true),
}));

// why: ensureAssetIndexModeForRole has its own db dependencies unrelated to user creation
vitest.mock("~/modules/asset-index-settings/service.server", () => ({
  ensureAssetIndexModeForRole: vitest.fn().mockResolvedValue(undefined),
}));

const username = `test-user-${USER_ID}`;

describe(createUserAccountForTesting.name, () => {
  beforeEach(() => {
    vitest.clearAllMocks();
  });

  it("should return null if no auth account created", async () => {
    //@ts-expect-error missing vitest type
    db.user.create.mockRejectedValueOnce(new Error("create-account-error"));

    const result = await createUserAccountForTesting(
      USER_EMAIL,
      USER_PASSWORD,
      username
    );
    expect(result).toBeNull();
    expect(db.user.create).toHaveBeenCalledWith({
      data: {
        email: USER_EMAIL,
        passwordHash: "hashed-password",
      },
    });
  });
  it("should return null and delete auth account if unable to sign in", async () => {
    const mockUser = { id: USER_ID, email: USER_EMAIL, passwordHash: "hashed-password" };
    //@ts-expect-error missing vitest type
    db.user.create.mockResolvedValueOnce(mockUser);
    //@ts-expect-error missing vitest type
    db.user.findUnique.mockResolvedValueOnce(null); // Fail sign in

    const result = await createUserAccountForTesting(
      USER_EMAIL,
      USER_PASSWORD,
      username
    );
    expect(result).toBeNull();
    expect(db.user.delete).toHaveBeenCalledWith({
      where: { id: USER_ID },
    });
  });
  it("should return null and delete auth account if unable to create user in database", async () => {
    const mockUser = { id: USER_ID, email: USER_EMAIL, passwordHash: "hashed-password" };
    //@ts-expect-error missing vitest type
    db.user.create.mockResolvedValueOnce(mockUser); // Auth account creation
    //@ts-expect-error missing vitest type
    db.user.findUnique.mockResolvedValueOnce(mockUser); // Sign in
    //@ts-expect-error missing vitest type
    db.user.create.mockResolvedValueOnce(null); // createUser fails

    const result = await createUserAccountForTesting(
      USER_EMAIL,
      USER_PASSWORD,
      username
    );
    expect(result).toBeNull();
    expect(db.user.delete).toHaveBeenCalledWith({
      where: { id: USER_ID },
    });
  });
  it("should create an account", async () => {
    const mockUser = {
      id: USER_ID,
      email: USER_EMAIL,
      passwordHash: "hashed-password",
      username: username,
      organizations: [
        {
          id: "org-id",
        },
      ],
    };
    
    //@ts-expect-error missing vitest type
    db.user.create.mockResolvedValueOnce(mockUser); // createEmailAuthAccount
    //@ts-expect-error missing vitest type
    db.user.findUnique.mockResolvedValueOnce(mockUser); // signInWithEmail
    //@ts-expect-error missing vitest type
    db.user.create.mockResolvedValueOnce(mockUser); // createUser

    const result = await createUserAccountForTesting(
      USER_EMAIL,
      USER_PASSWORD,
      username
    );

    expect(result).not.toBeNull();
    expect(result?.userId).toBe(USER_ID);
    expect(db.user.create).toHaveBeenCalledTimes(2);
  });
});

const newUserMock = {
  id: USER_ID,
  email: USER_EMAIL,
  organizations: [{ id: ORGANIZATION_ID }],
};

/**
 * Tests for the invite acceptance flow in `createUserOrAttachOrg`.
 *
 * Covers the fallback logic that handles the "limbo" state: a user who signed
 * up but never confirmed their email has a Supabase auth account but no Prisma
 * User record. When they later accept a team invite, `createEmailAuthAccount`
 * fails (email exists), so we fall back to `confirmExistingAuthAccount` to
 * confirm the existing auth account and create the Prisma User.
 */
describe(createUserOrAttachOrg.name, () => {
  beforeEach(() => {
    vitest.clearAllMocks();
    // Default: no existing Prisma user, no existing auth user
    // @ts-expect-error missing vitest type
    db.user.findFirst.mockResolvedValue(null);
    // @ts-expect-error missing vitest type
    db.$queryRaw.mockResolvedValue([]);
    // @ts-expect-error missing vitest type
    db.user.create.mockResolvedValue(newUserMock);
    // @ts-expect-error missing vitest type
    db.$transaction.mockImplementation((callback: any) => callback(db));
  });

  afterEach(() => {
    server.events.removeAllListeners();
  });

  /** Happy path: brand-new user with no prior Supabase account */
  it("creates a new user when no Prisma user and no Supabase account exists", async () => {
    const result = await createUserOrAttachOrg({
      email: USER_EMAIL,
      organizationId: ORGANIZATION_ID,
      roles: [OrganizationRoles.BASE],
      password: USER_PASSWORD,
      firstName: "Test",
      createdWithInvite: true,
    });

    expect(result.id).toBe(USER_ID);
    expect(db.user.create).toHaveBeenCalled();
  });

  /** The "limbo" bug: unconfirmed Supabase account exists, no Prisma User */
  it("falls back to confirming existing auth account when createEmailAuthAccount fails", async () => {
    // Override: createEmailAuthAccount fails (email already in DB but maybe no passwordHash or something)
    //@ts-expect-error missing vitest type
    db.user.create.mockRejectedValueOnce(new Error("User already exists"));
    
    // confirmExistingAuthAccount queries for existing user
    //@ts-expect-error missing vitest type
    db.user.update.mockResolvedValueOnce(newUserMock);

    const result = await createUserOrAttachOrg({
      email: USER_EMAIL,
      organizationId: ORGANIZATION_ID,
      roles: [OrganizationRoles.BASE],
      password: USER_PASSWORD,
      firstName: "Test",
      createdWithInvite: true,
    });

    expect(result.id).toBe(USER_ID);
    expect(db.user.update).toHaveBeenCalled();
    expect(db.user.create).toHaveBeenCalled();
  });

  /** No auth account can be created or found — user gets a clear error */
  it("throws when both createEmailAuthAccount and confirmExistingAuthAccount fail", async () => {
    // createEmailAuthAccount fails
    //@ts-expect-error missing vitest type
    db.user.create.mockRejectedValueOnce(new Error("User already exists"));

    // confirmExistingAuthAccount fails (e.g. user not found)
    //@ts-expect-error missing vitest type
    db.user.update.mockRejectedValueOnce(new Error("User not found"));

    await expect(
      createUserOrAttachOrg({
        email: USER_EMAIL,
        organizationId: ORGANIZATION_ID,
        roles: [OrganizationRoles.BASE],
        password: USER_PASSWORD,
        firstName: "Test",
        createdWithInvite: true,
      })
    ).rejects.toThrow("We are facing some issue with your account");
  });

  /** Existing user accepting invite for a new org — no auth changes needed */
  it("attaches org to existing Prisma user without creating a new auth account", async () => {
    const existingUser = {
      id: USER_ID,
      email: USER_EMAIL,
      firstName: "Existing",
      lastName: "User",
      sso: false,
      userOrganizations: [],
    };

    // @ts-expect-error missing vitest type
    db.user.findFirst.mockResolvedValueOnce(existingUser);

    const result = await createUserOrAttachOrg({
      email: USER_EMAIL,
      organizationId: ORGANIZATION_ID,
      roles: [OrganizationRoles.BASE],
      password: USER_PASSWORD,
      firstName: "Existing",
      createdWithInvite: true,
    });

    expect(result.id).toBe(USER_ID);
    expect(db.userOrganization.upsert).toHaveBeenCalled();
    expect(db.user.create).not.toHaveBeenCalled();
  });
});
