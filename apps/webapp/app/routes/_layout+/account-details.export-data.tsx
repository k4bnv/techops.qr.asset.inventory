import type { LoaderFunctionArgs } from "react-router";
import { db } from "~/database/db.server";
import { makeShelfError } from "~/utils/error";
import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { requirePermission } from "~/utils/roles.server";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;

  try {
    await requirePermission({
      userId,
      request,
      entity: PermissionEntity.userData,
      action: PermissionAction.read,
    });

    const [user, assets, bookings, repairs] = await Promise.all([
      db.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          contact: {
            select: {
              phone: true,
              street: true,
              city: true,
              stateProvince: true,
              zipPostalCode: true,
              countryRegion: true,
            },
          },
        },
      }),
      db.asset.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { name: true } },
          location: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.booking.findMany({
        where: { custodianUserId: userId },
        select: {
          id: true,
          name: true,
          status: true,
          from: true,
          to: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      db.repair.findMany({
        where: { performedById: userId },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportVersion: "1.0",
      profile: user,
      assets,
      bookings,
      repairs,
    };

    const filename = `techops-gegevens-${new Date().toISOString().split("T")[0]}.json`;

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw new Response(JSON.stringify({ error: reason.message }), {
      status: reason.status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
