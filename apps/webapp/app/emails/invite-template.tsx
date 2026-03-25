import {
  Button,
  Html,
  Text,
  Head,
  render,
  Container,
  Section,
} from "@react-email/components";
import { config } from "~/config/shelf.config";
import type { InviteWithInviterAndOrg } from "~/modules/invite/types";
import { SERVER_URL, SUPPORT_EMAIL } from "~/utils/env";
import { CustomEmailFooter } from "./components/custom-footer";
import { LogoForEmail } from "./logo";
import { styles } from "./styles";

interface Props {
  invite: InviteWithInviterAndOrg;
  token: string;
  extraMessage?: string | null;
}

export function InvitationEmailTemplate({
  invite,
  token,
  extraMessage,
}: Props) {
  const { emailPrimaryColor } = config;
  return (
    <Html>
      <Head>
        <title>Uitnodiging om lid te worden van TechOps</title>
      </Head>

      <Container
        style={{ padding: "32px 16px", maxWidth: "600px", margin: "0 auto" }}
      >
        <LogoForEmail />

        <div style={{ paddingTop: "8px" }}>
          <Text style={{ marginBottom: "24px", ...styles.p }}>
            Hallo,
            <br />
            {invite.inviter.firstName} {invite.inviter.lastName} nodigt u uit om
            lid te worden van TechOps als lid van de werkruimte van {invite.organization.name}
            . Klik op de link om de uitnodiging te accepteren:
          </Text>

          {extraMessage ? (
            <Section
              style={{
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#F9FAFB",
                marginBottom: "24px",
              }}
            >
              <Text
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#6B7280",
                  margin: "0 0 8px 0",
                }}
              >
                Bericht van {invite.inviter.firstName}{" "}
                {invite.inviter.lastName}:
              </Text>

              <Text
                style={{
                  fontSize: "15px",
                  color: "#111827",
                  margin: "0px",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.5",
                }}
              >
                {extraMessage}
              </Text>
            </Section>
          ) : null}

          <Button
            href={`${SERVER_URL}/accept-invite/${invite.id}?token=${token}`}
            style={{ ...styles.button, textAlign: "center" }}
          >
            Accepteer de uitnodiging
          </Button>
          <Text style={{ ...styles.p, marginBottom: "24px" }}>
            Zodra u klaar bent met het instellen van uw account, heeft u toegang
            tot de werkruimte en kunt u functies verkennen zoals Asset Explorer,
            Locatiebeheer, Samenwerking, Aangepaste velden en meer. Als u
            vragen heeft of hulp nodig heeft, aarzel dan niet om contact op te
            nemen met ons ondersteuningsteam via {SUPPORT_EMAIL}.
          </Text>

          <Text style={{ marginBottom: "32px", ...styles.p }}>
            Bedankt, <br />
            Het TechOps team
          </Text>

          <CustomEmailFooter
            footerText={invite.organization.customEmailFooter}
          />

          <Text style={{ fontSize: "14px", color: "#344054" }}>
            Dit is een automatische e-mail verzonden van TechOps naar{" "}
            <span style={{ color: emailPrimaryColor }}>
              {invite.inviteeEmail}
            </span>
            .
          </Text>
        </div>
      </Container>
    </Html>
  );
}

/*
 *The HTML content of an email will be accessed by a server file to send email,
  we cannot import a TSX component in a server file so we are exporting TSX converted to HTML string using render function by react-email.
 */
export const invitationTemplateString = ({
  token,
  invite,
  extraMessage,
}: Props) =>
  render(
    <InvitationEmailTemplate
      token={token}
      invite={invite}
      extraMessage={extraMessage}
    />
  );
