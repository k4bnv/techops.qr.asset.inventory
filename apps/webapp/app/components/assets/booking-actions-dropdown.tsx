import { useLoaderData } from "react-router";
import { useCurrentOrganization } from "~/hooks/use-current-organization";
import type { loader } from "~/routes/_layout+/assets.$assetId";
import { isPersonalOrg } from "~/utils/organization";
import { Button } from "../shared/button";
import type { BookLink } from "../shared/generic-add-to-bookings-actions-dropdown";
import { GenericBookActionsDropdown } from "../shared/generic-add-to-bookings-actions-dropdown";

export default function BookingActionsDropdown() {
  const { asset } = useLoaderData<typeof loader>();
  const organization = useCurrentOrganization();
  const { availableToBook } = asset;

  if (isPersonalOrg(organization)) return null;

  const disabled = asset.kit
    ? {
        reason: (
          <>
            Dit asset kan niet direct worden geboekt omdat het deel uitmaakt
            van een kit. Boek in plaats daarvan de{" "}
            <Button to={`/kits/${asset.kit.id}`} target="_blank" variant="link">
              kit
            </Button>.
          </>
        ),
      }
    : false;

  const disabledTrigger = availableToBook
    ? false
    : {
        reason: "Dit asset is gemarkeerd als onbeschikbaar voor boekingen.",
      };

  const links = [
    {
      indexType: "asset",
      id: asset.id,
      disabled,
      label: "Nieuwe boeking maken",
      icon: "bookings",
      to: "overview/create-new-booking",
    },
    {
      indexType: "asset",
      id: asset.id,
      label: "Toevoegen aan bestaande boeking",
      icon: "booking-exist",
      disabled,
      to: `overview/add-to-existing-booking`,
    },
  ] as BookLink[];

  return (
    <div className="actions-dropdown flex">
      <GenericBookActionsDropdown
        links={links}
        key={"asset"}
        label={"Boeken"}
        disabledTrigger={disabledTrigger}
      />
    </div>
  );
}
