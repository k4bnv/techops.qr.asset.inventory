import type { Repair, Asset, User } from "@prisma/client";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { useLoaderData } from "react-router";
import { List, type IndexResponse } from "~/components/list";
import { ListContentWrapper } from "~/components/list/content-wrapper";
import { Badge } from "~/components/shared/badge";
import { Td, Th } from "~/components/table";
import { BADGE_COLORS } from "~/utils/badge-colors";
import { Button } from "../shared/button";

type RepairWithRelations = Repair & {
  asset: Asset;
  assignedTo: User | null;
  createdBy: User;
};

export const RepairsList = () => {
  const { items } = useLoaderData<IndexResponse>();
  const headerChildren = (
    <>
      <Th>Asset</Th>
      <Th>Omschrijving</Th>
      <Th>Status</Th>
      <Th>Toegewezen aan</Th>
      <Th>Datum</Th>
    </>
  );

  return (
    <ListContentWrapper>
      <List
        title="Reparaties"
        ItemComponent={RepairRow}
        headerChildren={headerChildren}
      />
    </ListContentWrapper>
  );
};

const RepairRow = ({ item: rawItem }: { item: any }) => {
  const item = rawItem as RepairWithRelations;
  const statusMap = {
    PENDING: { label: "In afwachting", color: BADGE_COLORS.amber },
    IN_PROGRESS: { label: "In behandeling", color: BADGE_COLORS.blue },
    COMPLETED: { label: "Voltooid", color: BADGE_COLORS.green },
    CANCELLED: { label: "Geannuleerd", color: BADGE_COLORS.red },
  };

  const statusInfo = statusMap[item.status as keyof typeof statusMap] || {
    label: item.status,
    color: BADGE_COLORS.gray,
  };

  return (
    <>
      <Td>
        <Button
          to={`/assets/${item.assetId}`}
          variant="link"
          className="p-0 font-medium text-gray-900 hover:text-gray-700"
        >
          {item.asset.title}
        </Button>
      </Td>
      <Td>
        <div className="max-w-xs truncate text-gray-500">{item.description}</div>
      </Td>
      <Td>
        <Badge color={statusInfo.color.bg} textColor={statusInfo.color.text}>
          {statusInfo.label}
        </Badge>
      </Td>
      <Td>
        <div className="text-gray-500">
          {item.assignedTo
            ? `${item.assignedTo.firstName} ${item.assignedTo.lastName}`
            : "-"}
        </div>
      </Td>
      <Td>
        <div className="text-gray-500">
          {format(new Date(item.createdAt), "dd MMM yyyy", { locale: nl })}
        </div>
      </Td>
    </>
  );
};
