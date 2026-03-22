import type { Prisma } from "@prisma/client";
import type {
  MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "react-router";
import { data, redirect, useLoaderData } from "react-router";
import { z } from "zod";
import ContextualModal from "~/components/layout/contextual-modal";

import type { HeaderData } from "~/components/layout/header/types";
import { List } from "~/components/list";
import { ListContentWrapper } from "~/components/list/content-wrapper";
import { Filters } from "~/components/list/filters";
import BulkActionsDropdown from "~/components/nrm/bulk-actions-dropdown";
import { ExportNrmButton } from "~/components/nrm/export-nrm-button";
import { Button } from "~/components/shared/button";
import { Td, Th } from "~/components/table";
import { ImportNrmButton } from "~/components/workspace/import-nrm-button";
import { TeamMembersActionsDropdown } from "~/components/workspace/nrm-actions-dropdown";
import { db } from "~/database/db.server";
import { useUserRoleHelper } from "~/hooks/user-user-role-helper";
import { getPaginatedAndFilterableSettingTeamMembers } from "~/modules/settings/service.server";
import { getOrganizationTierLimit } from "~/modules/tier/service.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { makeShelfError, ShelfError } from "~/utils/error";
import { error, parseData, payload } from "~/utils/http.server";
import { isPersonalOrg as checkIsPersonalOrg } from "~/utils/organization";
import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { requirePermission } from "~/utils/roles.server";
import { canImportNRM } from "~/utils/subscription.server";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;

  try {
    const { organizationId, organizations, currentOrganization } =
      await requirePermission({
        userId,
        request,
        entity: PermissionEntity.teamMember,
        action: PermissionAction.read,
      });

    const [
      tierLimit,
      { page, perPage, search, totalPages, teamMembers, totalTeamMembers },
    ] = await Promise.all([
      getOrganizationTierLimit({
        organizationId,
        organizations,
      }),
      getPaginatedAndFilterableSettingTeamMembers({
        organizationId,
        request,
      }),
    ]);

    const header: HeaderData = {
      title: `Instellingen - Teamleden beheren`,
    };

    const modelName = {
      singular: "niet-geregistreerd lid",
      plural: "niet-geregistreerde leden",
    };

    return payload({
      header,
      modelName,
      page,
      perPage,
      search,
      totalPages,
      items: teamMembers,
      totalItems: totalTeamMembers,
      canImportNRM: canImportNRM(tierLimit),
      isPersonalOrg: checkIsPersonalOrg(currentOrganization),
    });
  } catch (cause) {
    const reason = makeShelfError(cause);
    throw data(error(reason), { status: reason.status });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.header.title) : "" },
];

export async function action({ context, request }: ActionFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;

  try {
    const { organizationId } = await requirePermission({
      userId,
      request,
      entity: PermissionEntity.teamMember,
      action: PermissionAction.update,
    });

    const formData = await request.formData();

    const { intent } = parseData(
      formData,
      z.object({
        intent: z.enum(["delete"]),
      }),
      {
        additionalData: {
          organizationId,
        },
      }
    );

    switch (intent) {
      case "delete": {
        const { teamMemberId } = parseData(
          formData,
          z.object({
            teamMemberId: z.string(),
          }),
          {
            additionalData: {
              organizationId,
              intent,
            },
          }
        );

        await db.teamMember
          .update({
            where: {
              id: teamMemberId,
              organizationId,
            },
            data: {
              deletedAt: new Date(),
            },
          })
          .catch((cause) => {
            throw new ShelfError({
              cause,
              message: "Failed to delete team member",
              additionalData: { teamMemberId, userId, organizationId },
              label: "Team",
            });
          });

        return redirect(`/settings/team/nrm`);
      }
      default: {
        throw new ShelfError({
          cause: null,
          message: "Invalid action",
          additionalData: { intent },
          label: "Team",
        });
      }
    }
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    return data(error(reason), { status: reason.status });
  }
}

export default function NrmSettings() {
  const { canImportNRM } = useLoaderData<typeof loader>();
  const { isBaseOrSelfService } = useUserRoleHelper();

  return (
    <div>
      <p className="mb-6 text-xs text-gray-600">
        Niet-geregistreerde leden kunnen het beheer van een asset krijgen. Als u wilt
        dat ze herinneringen ontvangen, nodig ze dan uit via e-mail.
      </p>

      <ListContentWrapper>
        <Filters>
          <div className="flex items-center justify-end gap-2">
            <ExportNrmButton />
            <ImportNrmButton canImportNRM={canImportNRM} />

            <Button
              variant="primary"
              to="add-member"
              className="mt-2 w-full md:mt-0 md:w-max"
            >
              <span className=" whitespace-nowrap">Voeg NRM toe</span>
            </Button>
          </div>
        </Filters>

        <List
          bulkActions={
            isBaseOrSelfService ? undefined : <BulkActionsDropdown />
          }
          className="overflow-x-visible md:overflow-x-auto"
          ItemComponent={TeamMemberRow}
          customEmptyStateContent={{
            title: "Geen teamleden in de database",
            text: "Waar wacht u op? Voeg nu uw eerste teamlid toe!",
            newButtonRoute: "add-member",
            newButtonContent: "Voeg NRM toe",
          }}
          hideFirstHeaderColumn
          headerChildren={
            <>
              <Th>ID</Th>
              <Th>Naam</Th>
              <Th>Beheerd</Th>
              <Th>Acties</Th>
            </>
          }
        />
      </ListContentWrapper>

      <ContextualModal />
    </div>
  );
}

function TeamMemberRow({
  item,
}: {
  item: Prisma.TeamMemberGetPayload<{
    include: {
      _count: {
        select: {
          custodies: true;
        };
      };
    };
  }>;
}) {
  return (
    <>
      <Td>
        <div>
          <div className="pl-4 md:pl-6">{item.id}</div>
        </div>
      </Td>
      <Td className="w-full whitespace-normal">{item.name}</Td>
      <Td className="text-right">
        {item._count.custodies ? item._count.custodies : 0}
      </Td>
      <Td className="text-right">
        <TeamMembersActionsDropdown teamMember={item} />
      </Td>
    </>
  );
}
