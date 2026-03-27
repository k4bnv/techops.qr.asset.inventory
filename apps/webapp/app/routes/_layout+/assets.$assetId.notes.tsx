import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { data } from "react-router";
import { z } from "zod";
import { Notes } from "~/components/assets/notes";
import type { HeaderData } from "~/components/layout/header/types";
import { getAsset } from "~/modules/asset/service.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
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

  const { assetId: id } = getParams(params, z.object({ assetId: z.string() }), {
    additionalData: { userId },
  });

  try {
    const { organizationId, userOrganizations } = await requirePermission({
      userId,
      request,
      entity: PermissionEntity.asset,
      action: PermissionAction.read,
    });

    const asset = await getAsset({
      id,
      organizationId,
      userOrganizations,
      request,
      include: {
        notes: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const header: HeaderData = {
      title: `${asset.title} - Notities`,
    };

    return payload({ asset, header });
  } catch (cause) {
    const reason = makeShelfError(cause);
    throw data(error(reason), { status: reason.status });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.header.title) : "" },
];

export const handle = {
  breadcrumb: () => "Notities",
};

export default function AssetNotes() {
  return (
    <div className="w-full">
      <Notes />
    </div>
  );
}
