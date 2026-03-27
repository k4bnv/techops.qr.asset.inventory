import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import { z } from "zod";
import { RepairsList } from "~/components/repairs/repairs-list";
import { getRepairs } from "~/modules/repair/service.server";
import { makeShelfError } from "~/utils/error";
import { payload, error, getParams } from "~/utils/http.server";
import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { requirePermission } from "~/utils/roles.server";

export async function loader({ context, request, params }: LoaderFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;
  const { assetId } = getParams(params, z.object({ assetId: z.string() }));

  try {
    const { organizationId } = await requirePermission({
      userId,
      request,
      entity: PermissionEntity.repair,
      action: PermissionAction.read,
    });

    const repairs = await getRepairs({ organizationId, assetId });

    return payload({
      items: repairs,
      totalItems: repairs.length,
      totalPages: 1,
      page: 1,
      perPage: 100,
      search: "",
      modelName: { singular: "reparatie", plural: "reparaties" },
    });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

export default function AssetRepairsPage() {
  return <RepairsList />;
}
