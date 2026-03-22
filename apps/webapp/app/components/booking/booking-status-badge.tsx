import type { ReactNode } from "react";
import { BookingStatus } from "@prisma/client";
import { useUserData } from "~/hooks/use-user-data";
import { useUserRoleHelper } from "~/hooks/user-user-role-helper";
import { bookingStatusColorMap } from "~/utils/bookings";
import { bookingStatusDutchMap } from "~/utils/status-labels";
import { Badge } from "../shared/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../shared/tooltip";

export function BookingStatusBadge({
  status,
  custodianUserId,
}: {
  status: BookingStatus;
  /** Id of the custodian if it's a user */
  custodianUserId: string | undefined;
}) {
  const { isBase } = useUserRoleHelper();
  const user = useUserData();

  /**
   * This is used to show the extra info tooltip when the booking is
   * reserved and the user is the custodian of the booking.
   * This is only shown for base users.
   */
  const shouldShowExtraInfo =
    isBase &&
    status === BookingStatus.RESERVED &&
    custodianUserId &&
    custodianUserId === user?.id;

  const colors = bookingStatusColorMap[status];
  return (
    <Badge color={colors.bg} textColor={colors.text} withDot={false}>
      {shouldShowExtraInfo ? (
        <ExtraInfoTooltip>
          <span className="block whitespace-nowrap lowercase first-letter:uppercase">
            {bookingStatusDutchMap[status]} - onder voorbehoud
          </span>
        </ExtraInfoTooltip>
      ) : (
        <span className="block whitespace-nowrap lowercase first-letter:uppercase">
          {bookingStatusDutchMap[status]}
        </span>
      )}
    </Badge>
  );
}

function ExtraInfoTooltip({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-72">
          <p>
            Uw boeking is momenteel gereserveerd, maar de beheerder kan deze te
            allen tijde afwijzen of sluiten als er conflicten zijn met andere boekingen.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
