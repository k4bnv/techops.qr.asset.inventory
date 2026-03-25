import { Html, Text, Head, render, Container } from "@react-email/components";
import { config } from "~/config/shelf.config";
import { SUPPORT_EMAIL } from "~/utils/env";
import { CustomEmailFooter } from "./components/custom-footer";
import { LogoForEmail } from "./logo";
import { styles } from "./styles";

interface Props {
  orgName: string;
  previousRole: string;
  newRole: string;
  recipientEmail: string;
  customEmailFooter?: string | null;
}

export function RoleChangeEmailTemplate({
  orgName,
  previousRole,
  newRole,
  recipientEmail,
  customEmailFooter,
}: Props) {
  const { emailPrimaryColor } = config;
  return (
    <Html>
      <Head>
        <title>Uw rol is gewijzigd</title>
      </Head>

      <Container
        style={{ padding: "32px 16px", maxWidth: "600px", margin: "0 auto" }}
      >
        <LogoForEmail />

        <div style={{ paddingTop: "8px" }}>
          <Text style={{ marginBottom: "24px", ...styles.p }}>
            Hallo,
            <br />
            Uw rol in <strong>{orgName}</strong> is gewijzigd van{" "}
            <strong>{previousRole}</strong> naar <strong>{newRole}</strong>.
          </Text>

          <Text style={{ ...styles.p, marginBottom: "24px" }}>
            Als u denkt dat dit een vergissing is, neem dan contact op met de
            beheerder van de werkruimte. Als u vragen heeft of hulp nodig heeft,
            aarzel dan niet om contact op te nemen met ons ondersteuningsteam
            via {SUPPORT_EMAIL}.
          </Text>

          <Text style={{ marginBottom: "32px", ...styles.p }}>
            Bedankt, <br />
            Het TechOps team
          </Text>

          <CustomEmailFooter footerText={customEmailFooter} />

          <Text style={{ fontSize: "14px", color: "#344054" }}>
            Dit is een automatische e-mail verzonden van TechOps naar{" "}
            <span style={{ color: emailPrimaryColor }}>{recipientEmail}</span>.
          </Text>
        </div>
      </Container>
    </Html>
  );
}

/*
 * The HTML content of an email will be accessed by a server file to send email,
 * we cannot import a TSX component in a server file so we are exporting TSX
 * converted to HTML string using render function by react-email.
 */
export const roleChangeTemplateString = (props: Props) =>
  render(<RoleChangeEmailTemplate {...props} />);
