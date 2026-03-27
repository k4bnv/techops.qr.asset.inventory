import type { Prisma, Repair, Organization, Asset, User } from "@prisma/client";
import type { RepairStatus } from "@prisma/client";
import { db } from "~/database/db.server";
import { ShelfError } from "~/utils/error";
import type { ErrorLabel } from "~/utils/error";

const label: ErrorLabel = "Repair";

export async function getRepairs({
  organizationId,
  assetId,
  status,
}: {
  organizationId: Organization["id"];
  assetId?: Asset["id"];
  status?: RepairStatus;
}) {
  try {
    return await db.repair.findMany({
      where: {
        organizationId,
        ...(assetId && { assetId }),
        ...(status && { status }),
      },
      include: {
        asset: {
          select: {
            title: true,
            sequentialId: true,
          },
        },
        performedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (cause) {
    throw new ShelfError({
      cause,
      message: "Something went wrong while fetching repairs",
      label,
    });
  }
}

export async function getRepairById(id: Repair["id"]) {
  try {
    return await db.repair.findUniqueOrThrow({
      where: { id },
      include: {
        asset: true,
        performedBy: true,
      },
    });
  } catch (cause) {
    throw new ShelfError({
      cause,
      message: "Repair not found",
      additionalData: { id },
      label,
    });
  }
}

export async function createRepair(
  data: Pick<
    Repair,
    | "title"
    | "description"
    | "assetId"
    | "organizationId"
    | "performedById"
    | "status"
    | "cost"
    | "timeSpentHours"
    | "partsUsed"
    | "startedAt"
    | "completedAt"
  >
) {
  try {
    return await db.repair.create({
      data,
    });
  } catch (cause) {
    throw new ShelfError({
      cause,
      message: "Something went wrong while creating repair",
      label,
    });
  }
}

export async function updateRepair({
  id,
  ...data
}: Partial<Repair> & { id: Repair["id"] }) {
  try {
    return await db.repair.update({
      where: { id },
      data,
    });
  } catch (cause) {
    throw new ShelfError({
      cause,
      message: "Something went wrong while updating repair",
      additionalData: { id },
      label,
    });
  }
}

export async function deleteRepair(id: Repair["id"]) {
  try {
    return await db.repair.delete({
      where: { id },
    });
  } catch (cause) {
    throw new ShelfError({
      cause,
      message: "Something went wrong while deleting repair",
      additionalData: { id },
      label,
    });
  }
}
