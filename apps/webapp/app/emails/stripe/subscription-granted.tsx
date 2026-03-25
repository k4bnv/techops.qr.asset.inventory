import {
  Button,
  Container,
  Head,
  Html,
  Link,
  render,
  Text,
} from "@react-email/components";
import { config } from "~/config/shelf.config";
import { SERVER_URL, SUPPORT_EMAIL } from "~/utils/env";
import { ShelfError } from "~/utils/error";
import { Logger } from "~/utils/logger";
import { LogoForEmail } from "../logo";
import { sendEmail } from "../mail.server";
import { styles } from "../styles";

interface SubscriptionGrantedEmailProps {
  customerName?: string | null;
  subscriptionName: string;
}

interface SendSubscriptionGrantedEmailProps
  extends SubscriptionGrantedEmailProps {
  email: string;
}

export const sendSubscriptionGrantedEmail = async ({
  customerName,
  subscriptionName,
  email,
}: SendSubscriptionGrantedEmailProps) => {
  try {
    const subject = "Uw TechOps-abonnement is nu actief";
    const html = await subscriptionGrantedHtml({
      customerName,
      subscriptionName,
    });
    const text = subscriptionGrantedText({ customerName, subscriptionName });

    void sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  } catch (cause) {
    Logger.error(
      new ShelfError({
        cause,
        message:
          "Er is iets misgegaan bij het verzenden van de e-mail over het geactiveerde abonnement",
        additionalData: { email },
        label: "User",
      })
    );
  }
};

export const subscriptionGrantedText = ({
  customerName,
  subscriptionName,
}: SubscriptionGrantedEmailProps) => {
  const greeting = customerName ? `Hoi ${customerName}` : "Hoi";

  return `${greeting},

Goed nieuws! Uw ${subscriptionName}-abonnement is nu actief.

U heeft nu toegang tot alle functies die in uw pakket zijn inbegrepen:

- Onbeperkt aantal aangepaste velden om TechOps af te stemmen op uw behoeften
- Teamwerkruimtes voor naadloze samenwerking
- Geavanceerde functies voor activabeheer
- Prioriteitsondersteuning

Begin nu: ${SERVER_URL}

U kunt uw abonnement op elk moment beheren via uw abonnementsinstellingen:
${SERVER_URL}/account-details/subscription

Als u vragen heeft, neem dan gerust contact met ons op via ${SUPPORT_EMAIL}. We helpen u graag!

Het TechOps Team
`;
};

function SubscriptionGrantedEmailTemplate({
  customerName,
  subscriptionName,
}: SubscriptionGrantedEmailProps) {
  const { emailPrimaryColor } = config;

  return (
    <Html>
      <Head>
        <title>Uw TechOps-abonnement is nu actief</title>
      </Head>

      <Container style={{ padding: "32px 16px", maxWidth: "100%" }}>
        <LogoForEmail />

        <div style={{ paddingTop: "8px" }}>
          <Text style={{ ...styles.p }}>
            Hoi{customerName ? ` ${customerName}` : ""},
          </Text>

          <Text style={{ ...styles.p }}>
            Goed nieuws! Uw <strong>{subscriptionName}</strong>-abonnement is
            nu actief. U heeft toegang tot alle functies die in uw pakket zijn
            inbegrepen.
          </Text>

          <Text style={{ ...styles.h2 }}>
            Dit is wat er is inbegrepen in uw pakket:
          </Text>

          <ul style={{ ...styles.li, paddingLeft: "20px" }}>
            <li style={{ marginBottom: "8px" }}>
              Onbeperkt aantal aangepaste velden om TechOps af te stemmen op uw behoeften
            </li>
            <li style={{ marginBottom: "8px" }}>
              Teamwerkruimtes voor naadloze samenwerking
            </li>
            <li style={{ marginBottom: "8px" }}>
              Geavanceerde functies voor activabeheer
            </li>
            <li style={{ marginBottom: "8px" }}>Prioriteitsondersteuning</li>
          </ul>

          <Button
            href={`${SERVER_URL}`}
            style={{
              ...styles.button,
              textAlign: "center" as const,
              maxWidth: "200px",
              marginBottom: "24px",
            }}
          >
            Ga naar uw werkruimte
          </Button>

          <Text style={{ ...styles.p }}>
            U kunt uw abonnement op elk moment beheren via uw{" "}
            <Link
              href={`${SERVER_URL}/account-details/subscription`}
              style={{ color: emailPrimaryColor }}
            >
              abonnementsinstellingen
            </Link>
            .
          </Text>

          <Text style={{ marginTop: "24px", ...styles.p }}>
            Als u vragen heeft, neem dan gerust contact met ons op via{" "}
            {SUPPORT_EMAIL}. We helpen u graag!
          </Text>

          <Text style={{ marginTop: "24px", ...styles.p }}>Het TechOps Team</Text>
        </div>
      </Container>
    </Html>
  );
}

export const subscriptionGrantedHtml = ({
  customerName,
  subscriptionName,
}: SubscriptionGrantedEmailProps) =>
  render(
    <SubscriptionGrantedEmailTemplate
      customerName={customerName}
      subscriptionName={subscriptionName}
    />
  );
