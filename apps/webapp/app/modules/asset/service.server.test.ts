import { describe, expect, it, vitest, beforeEach } from "vitest";
import { db } from "~/database/db.server";
import { getQr } from "~/modules/qr/service.server";
import { ShelfError } from "~/utils/error";
import {
  refreshExpiredAssetImages,
  relinkAssetQrCode,
  uploadDuplicateAssetMainImage,
} from "./service.server";

// why: isolating asset service logic from actual database operations
vitest.mock("~/database/db.server", () => ({
  db: {
    asset: {
      findFirst: vitest.fn().mockResolvedValue(null),
      update: vitest.fn().mockResolvedValue({}),
    },
    qr: {
      update: vitest.fn().mockResolvedValue({}),
    },
    image: {
      findUnique: vitest.fn(),
      create: vitest.fn(),
    },
  },
}));

// why: avoid real QR lookup during relink tests
vitest.mock("~/modules/qr/service.server", () => ({
  getQr: vitest.fn(),
}));

// why: avoid user lookup side effects during relink tests
vitest.mock("~/modules/user/service.server", () => ({
  getUserByID: vitest.fn().mockResolvedValue({
    id: "user-1",
    firstName: "John",
    lastName: "Doe",
  }),
}));

// why: avoid creating actual notes during relink tests
vitest.mock("~/modules/note/service.server", () => ({
  createNote: vitest.fn().mockResolvedValue({}),
}));

describe("relinkAssetQrCode (asset)", () => {
  beforeEach(() => {
    vitest.clearAllMocks();
  });

  it("throws when QR is already linked to a kit", async () => {
    //@ts-expect-error mock setup
    getQr.mockResolvedValue({
      id: "qr-1",
      organizationId: "org-1",
      assetId: null,
      kitId: "kit-1",
    });
    //@ts-expect-error mock setup
    db.asset.findFirst.mockResolvedValue({ qrCodes: [] });

    await expect(
      relinkAssetQrCode({
        qrId: "qr-1",
        assetId: "asset-1",
        organizationId: "org-1",
        userId: "user-1",
      })
    ).rejects.toBeInstanceOf(ShelfError);
  });

  it("relinks when QR is available", async () => {
    //@ts-expect-error mock setup
    getQr.mockResolvedValue({
      id: "qr-1",
      organizationId: "org-1",
      assetId: null,
      kitId: null,
    });
    //@ts-expect-error mock setup
    db.asset.findFirst.mockResolvedValue({ qrCodes: [{ id: "old-qr" }] });

    await relinkAssetQrCode({
      qrId: "qr-1",
      assetId: "asset-1",
      organizationId: "org-1",
      userId: "user-1",
    });

    expect(db.qr.update).toHaveBeenCalledWith({
      where: { id: "qr-1" },
      data: { organizationId: "org-1", userId: "user-1" },
    });
    expect(db.asset.update).toHaveBeenCalledWith({
      where: { id: "asset-1", organizationId: "org-1" },
      data: {
        qrCodes: {
          set: [],
          connect: { id: "qr-1" },
        },
      },
    });
  });
});

describe("uploadDuplicateAssetMainImage", () => {
  beforeEach(() => {
    vitest.clearAllMocks();
  });

  it("duplicates local image record and returns a proxy URL", async () => {
    const originalImage = {
      id: "img-123",
      contentType: "image/png",
      blob: Buffer.from("fake-image-data"),
      userId: "user-old",
      ownerOrgId: "org-old",
    };

    const newImage = {
      ...originalImage,
      id: "img-456",
      userId: "user-1",
      ownerOrgId: "org-1",
    };

    //@ts-expect-error mock setup
    db.image.findUnique.mockResolvedValue(originalImage);
    //@ts-expect-error mock setup
    db.image.create.mockResolvedValue(newImage);

    const result = await uploadDuplicateAssetMainImage(
      "/api/image/img-123",
      "asset-1",
      "user-1",
      "org-1"
    );

    expect(result).toBe("/api/image/img-456");
    expect(db.image.findUnique).toHaveBeenCalledWith({
      where: { id: "img-123" },
    });
    expect(db.image.create).toHaveBeenCalledWith({
      data: {
        contentType: "image/png",
        blob: originalImage.blob,
        userId: "user-1",
        ownerOrgId: "org-1",
      },
    });
  });

  it("throws when the original image id cannot be extracted", async () => {
    await expect(
      uploadDuplicateAssetMainImage(
        "https://external.com/oops.jpg",
        "asset-1",
        "user-1",
        "org-1"
      )
    ).rejects.toBeInstanceOf(ShelfError);
  });

  it("throws when the original image is not found in DB", async () => {
    //@ts-expect-error mock setup
    db.image.findUnique.mockResolvedValue(null);

    await expect(
      uploadDuplicateAssetMainImage(
        "/api/image/img-missing",
        "asset-1",
        "user-1",
        "org-1"
      )
    ).rejects.toBeInstanceOf(ShelfError);
  });
});

describe("refreshExpiredAssetImages", () => {
  const mockUpdate = db.asset.update as ReturnType<typeof vitest.fn>;

  beforeEach(() => {
    vitest.clearAllMocks();
    mockUpdate.mockResolvedValue({});
  });

  const makeAsset = (
    overrides: Partial<{
      id: string;
      organizationId: string;
      mainImage: string | null;
      mainImageExpiration: Date | null;
      thumbnailImage: string | null;
    }> = {}
  ) => ({
    id: "asset-1",
    organizationId: "org-1",
    mainImage: "https://old-signed-url.com",
    mainImageExpiration: new Date(Date.now() - 60_000), // expired
    thumbnailImage: null as string | null,
    ...overrides,
  });

  it("returns assets unchanged when none are expired", async () => {
    const assets = [
      makeAsset({
        mainImageExpiration: new Date(Date.now() + 60_000), // future
      }),
    ];

    const result = await refreshExpiredAssetImages(assets);

    expect(result).toEqual(assets);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("skips standalone images even if expiration date is in the past", async () => {
    const assets = [
      makeAsset({
        mainImage: "/api/image/img-123",
        mainImageExpiration: new Date(Date.now() - 60_000), // expired but standalone
      }),
    ];

    const result = await refreshExpiredAssetImages(assets);

    expect(result).toEqual(assets);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
