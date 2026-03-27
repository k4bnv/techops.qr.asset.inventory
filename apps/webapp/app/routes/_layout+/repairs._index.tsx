import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import Header from "~/components/layout/header";
import { RepairsList } from "~/components/repairs/repairs-list";
import { Button } from "~/components/shared/button";
import When from "~/components/when/when";
import { useUserRoleHelper } from "~/hooks/user-user-role-helper";
import { getRepairs } from "~/modules/repair/service.server";
import { ShelfError, makeShelfError } from "~/utils/error";
import { payload, error } from "~/utils/http.server";
import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { userHasPermission } from "~/utils/permissions/permission.validator.client";
import { requirePermission } from "~/utils/roles.server";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;
  try {
    const { organizationId, canUseRepairs } = await requirePermission({
      userId,
      request,
      entity: PermissionEntity.repair,
      action: PermissionAction.read,
    });

    if (!canUseRepairs) {
      throw new ShelfError({
        cause: null,
        title: "Niet ingeschakeld",
        message: "Reparaties zijn niet ingeschakeld voor deze werkruimte.",
        label: "Assets",
        status: 404,
      });
    }

    const repairs = await getRepairs({ organizationId });

    return payload({
      items: repairs,
      totalItems: repairs.length,
      totalPages: 1,
      page: 1,
      perPage: 100,
      search: "",
      modelName: { singular: "reparatie", plural: "reparaties" },
      header: { title: "Reparaties" },
    });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

export default function RepairsIndexPage() {
  const { roles } = useUserRoleHelper();

  return (
    <div className="relative">
      <Header title="Reparaties">
        <When
          truthy={userHasPermission({
            roles,
            entity: PermissionEntity.repair,
            action: PermissionAction.create,
          })}
        >
          <Button to="new">Nieuwe reparatie</Button>
        </When>
      </Header>
      <RepairsList />
    </div>
  );
}
