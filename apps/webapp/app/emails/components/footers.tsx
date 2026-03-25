import { Text } from "@react-email/components";
import type { BookingForEmail } from "../types";

/** Footer used when sending normal user emails */
export const UserFooter = ({ booking }: { booking: BookingForEmail }) => (
  <>
    <Text style={{ fontSize: "14px", color: "#344054" }}>
      Deze e-mail is verzonden naar {booking.custodianUser!.email} omdat deze
      deel uitmaakt van de werkruimte{" "}
      <span style={{ color: "#101828", fontWeight: "600" }}>
        "{booking.organization.name}"
      </span>
      . <br /> Als u denkt dat u deze e-mail niet had mogen ontvangen, neem dan
      contact op met de eigenaar ({booking.organization.owner.email}) van de
      werkruimte.
    </Text>
    <Text style={{ marginBottom: "32px", fontSize: "14px", color: "#344054" }}>
      {" "}
      © {new Date().getFullYear()} TechOps Asset-inventaris
    </Text>
  </>
);

/** Footer used when sending admin user emails */
export const AdminFooter = ({ booking }: { booking: BookingForEmail }) => (
  <>
    <Text style={{ fontSize: "14px", color: "#344054" }}>
      Deze e-mail is naar u verzonden omdat u de EIGENAAR of BEHEERDER bent van
      de werkruimte{" "}
      <span style={{ color: "#101828", fontWeight: "600" }}>
        "{booking.organization.name}"
      </span>
      . <br /> Als u denkt dat u deze e-mail niet had mogen ontvangen, neem dan
      contact op met de klantenservice.
    </Text>
    <Text style={{ marginBottom: "32px", fontSize: "14px", color: "#344054" }}>
      {" "}
      © {new Date().getFullYear()} TechOps Asset-inventaris
    </Text>
  </>
);
