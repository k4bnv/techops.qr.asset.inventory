import type { ReactNode } from "react";
import type { Booking } from "@prisma/client";
import { BookingStatus, KitStatus } from "@prisma/client";
import { Link, useLoaderData } from "react-router";
import { hasAssetBookingConflicts } from "~/modules/booking/helpers";
import type { AssetWithBooking } from "~/routes/_layout+/bookings.$bookingId.overview.manage-assets";
import type { KitForBooking } from "~/routes/_layout+/bookings.$bookingId.overview.manage-kits";
import { SERVER_URL } from "~/utils/env";
import { tw } from "~/utils/tw";
import { Button } from "../shared/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../shared/tooltip";

/**
 * There are 4 reasons an asset can be unavailable:
 * 1. Its marked as not allowed for booking
 * 2. It is already in custody
 * 3. It is already booked for that period (within another booking)
 * 4. It is part of a kit and user is trying to add it individually
 * Each reason has its own tooltip and label
 */
export function AvailabilityLabel({
  asset,
  isCheckedOut,
  showKitStatus,
  isAddedThroughKit,
  isAlreadyAdded,
}: {
  asset: AssetWithBooking;
  isCheckedOut: boolean;
  showKitStatus?: boolean;
  isAddedThroughKit?: boolean;
  isAlreadyAdded?: boolean;
}) {
  const { booking } = useLoaderData<{ booking: Booking }>();
  const isPartOfKit = !!asset.kitId;

  /** User scanned the asset and it is already in booking */
  if (isAlreadyAdded) {
    return (
      <AvailabilityBadge
        badgeText="Al toegevoegd aan deze boeking"
        tooltipTitle="Asset is onderdeel van boeking"
        tooltipContent="Dit asset is al toegevoegd aan de huidige boeking."
      />
    );
  }

  /**
   * Marked as not allowed for booking
   */

  if (!asset.availableToBook) {
    return (
      <AvailabilityBadge
        badgeText={"Onbeschikbaar"}
        tooltipTitle={"Asset is onbeschikbaar voor boekingen"}
        tooltipContent={
          "Dit asset is door een beheerder gemarkeerd als onbeschikbaar voor boekingen."
        }
      />
    );
  }

  /**
   * Asset is part of a kit
   */
  if (isPartOfKit && showKitStatus) {
    return (
      <AvailabilityBadge
        badgeText="Onderdeel van kit"
        tooltipTitle="Asset is onderdeel van een kit"
        tooltipContent="Verwijder het asset uit de kit om het individueel toe te voegen."
      />
    );
  }

  /**
   * Has custody
   */
  if (asset.custody) {
    return (
      <AvailabilityBadge
        badgeText={"In beheer"}
        tooltipTitle={"Asset is in beheer"}
        tooltipContent={
          "Dit asset is in beheer bij een teamlid, waardoor het momenteel onbeschikbaar is voor boekingen."
        }
      />
    );
  }

  /**
   * Is booked for period - using client-side helper function
   */
  if (
    hasAssetBookingConflicts(asset, booking.id) &&
    !["ONGOING", "OVERDUE"].includes(booking.status)
  ) {
    const conflictingBooking = asset?.bookings
      ?.filter(
        (b) =>
          b.id !== booking.id &&
          (b.status === BookingStatus.ONGOING ||
            b.status === BookingStatus.OVERDUE ||
            b.status === BookingStatus.RESERVED)
      )
      .sort((a, b) => {
        // Sort by 'from' date descending to get the newest booking first
        const aDate = a.from ? new Date(a.from).getTime() : 0;
        const bDate = b.from ? new Date(b.from).getTime() : 0;
        return bDate - aDate;
      })[0];
    return (
      <AvailabilityBadge
        badgeText={"Al geboekt"}
        tooltipTitle={"Asset is al onderdeel van een boeking"}
        tooltipContent={
          conflictingBooking ? (
            <span>
              Dit asset is toegevoegd aan een boeking (
              <Button
                to={`/bookings/${conflictingBooking.id}`}
                target="_blank"
                variant={"inherit"}
                className={"!underline"}
              >
                {conflictingBooking?.name}
              </Button>
              ) die de geselecteerde tijdsperiode overlapt.
            </span>
          ) : (
            "Dit asset is toegevoegd aan een boeking die de geselecteerde tijdsperiode overlapt."
          )
        }
      />
    );
  }

  /**
   * Is currently checked out
   */

  if (isCheckedOut) {
    /** We get the current active booking that the asset is checked out to so we can use its name in the tooltip contnet
     * NOTE: This will currently not work as we are returning only overlapping bookings with the query. I leave to code and we can solve it by modifying the DB queries: https://github.com/TechOps-nu/shelf.nu/pull/555#issuecomment-1877050925
     */
    const conflictingBooking = asset?.bookings
      ?.filter(
        (b) =>
          b.id !== booking.id &&
          (b.status === BookingStatus.ONGOING ||
            b.status === BookingStatus.OVERDUE)
      )
      .sort((a, b) => {
        // Sort by 'from' date descending to get the newest booking first
        const aDate = a.from ? new Date(a.from).getTime() : 0;
        const bDate = b.from ? new Date(b.from).getTime() : 0;
        return bDate - aDate;
      })[0];

    return (
      <AvailabilityBadge
        badgeText={"Uitgeleend"}
        tooltipTitle={"Asset is momenteel uitgeleend"}
        tooltipContent={
          conflictingBooking ? (
            <span>
              Dit asset is momenteel uitgeleend als onderdeel van een andere boeking (
              <Link
                to={`${SERVER_URL}/bookings/
                ${conflictingBooking.id}`}
                target="_blank"
              >
                {conflictingBooking?.name}
              </Link>
              ) en zou beschikbaar moeten zijn voor uw geselecteerde datumperiode
            </span>
          ) : (
            "Dit asset is momenteel uitgeleend als onderdeel van een andere boeking en zou beschikbaar moeten zijn voor uw geselecteerde datumperiode"
          )
        }
      />
    );
  }

  /**
   * User is viewing all assets and the assets is added in a booking through kit
   */
  if (isAddedThroughKit) {
    return (
      <AvailabilityBadge
        badgeText="Toegevoegd via kit"
        tooltipTitle="Asset is toegevoegd via een kit"
        tooltipContent="Verwijder het asset uit de kit om het individueel toe te voegen."
      />
    );
  }

  return null;
}

export function AvailabilityBadge({
  badgeText,
  tooltipTitle,
  tooltipContent,
  className,
}: {
  badgeText: string;
  tooltipTitle: string;
  tooltipContent: string | ReactNode;
  className?: string;
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={tw(
              "inline-block  bg-warning-50 px-[6px] py-[2px]",
              "rounded-md border border-warning-200",
              "text-xs text-warning-700",
              "availability-badge",
              className
            )}
          >
            {badgeText}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          <div className="max-w-[260px] text-left sm:max-w-[320px]">
            <h6 className="mb-1 text-xs font-semibold text-gray-700">
              {tooltipTitle}
            </h6>
            <div className="whitespace-normal text-xs font-medium text-gray-500">
              {tooltipContent}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * A kit is not available for the following reasons
 * 1. Kit has unavailable status
 * 2. Kit or some asset is in custody
 * 3. Some of the assets are in custody
 * 4. Some of the assets are already booked for that period (for that booking)
 * 5. If kit has no assets
 */
export function getKitAvailabilityStatus(
  kit: KitForBooking,
  currentBookingId: string
) {
  const bookings = kit.assets
    .map((asset) => {
      if (asset?.bookings.length) {
        return asset.bookings;
      }
      return null;
    })
    .filter(Boolean)
    .flat();

  /** Checks whether this is checked out in another not overlapping booking */
  const isCheckedOutInANonConflictingBooking =
    kit.status === KitStatus.CHECKED_OUT && bookings.length === 0;
  const isCheckedOut = kit.status === KitStatus.CHECKED_OUT;
  const isInCustody =
    kit.status === "IN_CUSTODY" || kit.assets.some((a) => Boolean(a.custody));

  const isKitWithoutAssets = kit.assets.length === 0;

  const someAssetMarkedUnavailable = kit.assets.some((a) => !a.availableToBook);

  // Apply same booking conflict logic as isCheckedOut
  const someAssetHasUnavailableBooking = kit.assets.some((asset) =>
    hasAssetBookingConflicts(asset, currentBookingId)
  );

  return {
    isCheckedOut,
    isCheckedOutInANonConflictingBooking,
    isInCustody,
    isKitWithoutAssets,
    someAssetMarkedUnavailable,
    someAssetHasUnavailableBooking,
    isKitUnavailable: [isInCustody, isKitWithoutAssets].some(Boolean),
  };
}

export function KitAvailabilityLabel({ kit }: { kit: KitForBooking }) {
  const { booking } = useLoaderData<{ booking: Booking }>();

  const {
    isCheckedOut,
    isCheckedOutInANonConflictingBooking,
    someAssetMarkedUnavailable,
    isInCustody,
    isKitWithoutAssets,
    someAssetHasUnavailableBooking,
  } = getKitAvailabilityStatus(kit, booking.id);

  // Check if kit is checked out in current booking - don't show availability label
  const isCheckedOutInCurrentBooking =
    isCheckedOut &&
    kit.assets.some((asset) =>
      asset.bookings.some(
        (b) => b.id === booking.id && ["ONGOING", "OVERDUE"].includes(b.status)
      )
    );

  // Case 1: Kit is checked out in current booking - don't show availability label
  // The KitStatusBadge with CHECKED_OUT should be shown instead in the Row component
  if (isCheckedOutInCurrentBooking) {
    return null;
  }

  if (isInCustody) {
    return (
      <AvailabilityBadge
        badgeText="In beheer"
        tooltipTitle="Kit is in beheer"
        tooltipContent="Deze kit is in beheer of bevat assets die in beheer zijn."
      />
    );
  }

  if (isCheckedOut) {
    return (
      <AvailabilityBadge
        badgeText="Uitgeleend"
        tooltipTitle="Kit is uitgeleend"
        tooltipContent={
          isCheckedOutInANonConflictingBooking
            ? "Deze kit is momenteel uitgeleend als onderdeel van een andere boeking en zou beschikbaar moeten zijn voor uw geselecteerde datumperiode"
            : "Deze kit is momenteel uitgeleend en is niet beschikbaar voor uw geselecteerde datumperiode"
        }
      />
    );
  }

  if (isKitWithoutAssets) {
    return (
      <AvailabilityBadge
        badgeText="Geen assets"
        tooltipTitle="Geen assets in kit"
        tooltipContent="Er zijn nog geen assets aan deze kit toegevoegd."
      />
    );
  }

  if (someAssetMarkedUnavailable) {
    return (
      <AvailabilityBadge
        badgeText="Bevat niet-boekbare assets"
        tooltipTitle="Kit is onbeschikbaar voor uitlenen"
        tooltipContent="Sommige assets in deze kit zijn gemarkeerd als niet-boekbaar. U kunt de kit nog steeds aan uw boeking toevoegen, maar u moet de niet-boekbare assets verwijderen om door te gaan met uitlenen."
      />
    );
  }

  if (someAssetHasUnavailableBooking) {
    return (
      <AvailabilityBadge
        badgeText="Al geboekt"
        tooltipTitle="Kit is al onderdeel van een boeking"
        tooltipContent="Deze kit is al toegevoegd aan een andere boeking."
      />
    );
  }

  return null;
}
