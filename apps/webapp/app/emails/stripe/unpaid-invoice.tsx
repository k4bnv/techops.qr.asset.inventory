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

// --- Admin email (text-only, internal notification) ---

interface AdminEmailProps {
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  eventType: string;
  invoiceId: string;
}

export const unpaidInvoiceAdminText = ({
  user,
  eventType,
  invoiceId,
}: AdminEmailProps) => {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return `Een Stripe-factuurgebeurtenis vereist aandacht.

Gebeurtenis: ${eventType}
Gebruiker: ${name || "Onbekend"} (${user.email})
Factuur: https://dashboard.stripe.com/invoices/${invoiceId}
Gebruikersdashboard: ${SERVER_URL}/admin-dashboard/${user.id}

Controleer de abonnementsstatus van de gebruiker in het Stripe-dashboard.

— TechOps Systeem
`;
};

// --- User email (HTML + text) ---

interface UserEmailProps {
  customerEmail: string;
  customerName?: string | null;
  subscriptionName: string;
  amountDue: string;
  dueDate?: string | null;
}

interface SendUnpaidInvoiceUserEmailProps extends UserEmailProps {
  subject: string;
}

export const sendUnpaidInvoiceUserEmail = async ({
  customerEmail,
  customerName,
  subscriptionName,
  amountDue,
  dueDate,
  subject,
}: SendUnpaidInvoiceUserEmailProps) => {
  try {
    const html = await unpaidInvoiceUserHtml({
      customerEmail,
      customerName,
      subscriptionName,
      amountDue,
      dueDate,
    });
    const text = unpaidInvoiceUserText({
      customerEmail,
      customerName,
      subscriptionName,
      amountDue,
      dueDate,
    });

    void sendEmail({
      to: customerEmail,
      subject,
      html,
      text,
    });
  } catch (cause) {
    Logger.error(
      new ShelfError({
        cause,
        message:
          "Er is iets misgegaan bij het verzenden van de e-mail voor de onbetaalde factuur",
        additionalData: { customerEmail },
        label: "User",
      })
    );
  }
};

export const unpaidInvoiceUserText = ({
  customerName,
  subscriptionName,
  amountDue,
  dueDate,
}: UserEmailProps) => {
  const greeting = customerName ? `Hoi ${customerName}` : "Beste klant";

  return `${greeting},

We willen u laten weten dat we uw recente betaling voor uw TechOps-abonnement niet hebben kunnen verwerken.

Abonnement: ${subscriptionName}
Verschuldigd bedrag: ${amountDue}${dueDate ? `\nVervaldatum: ${dueDate}` : ""}

Maak u geen zorgen - dit kan gebeuren! Om uw abonnement actief te houden en eventuele onderbrekingen van uw service te voorkomen, verzoeken wij u uw betalingsgegevens bij te werken.

Bijwerken van uw betalingsmethode: ${SERVER_URL}/account-details/subscription

Als u vragen heeft, neem dan gerust contact met ons op via ${SUPPORT_EMAIL}. We helpen u graag!

Het TechOps Team
`;
};

function UnpaidInvoiceUserEmailTemplate({
  customerName,
  subscriptionName,
  amountDue,
  dueDate,
}: UserEmailProps) {
  const { emailPrimaryColor } = config;

  return (
    <Html>
      <Head>
        <title>Actie vereist: Betalingsprobleem met uw TechOps-abonnement</title>
      </Head>

      <Container style={{ padding: "32px 16px", maxWidth: "100%" }}>
        <LogoForEmail />

        <div style={{ paddingTop: "8px" }}>
          <Text style={{ ...styles.p }}>
            Hoi{customerName ? ` ${customerName}` : ""},
          </Text>

          <Text style={{ ...styles.p }}>
            We willen u laten weten dat we uw recente betaling voor uw
            TechOps-abonnement niet hebben kunnen verwerken.
          </Text>

          <Text
            style={{
              ...styles.p,
              backgroundColor: "#FFF8E1",
              border: "1px solid #FFE082",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <strong>Abonnement:</strong> {subscriptionName}
            <br />
            <strong>Verschuldigd bedrag:</strong> {amountDue}
            {dueDate ? (
              <>
                <br />
                <strong>Vervaldatum:</strong> {dueDate}
              </>
            ) : null}
          </Text>

          <Text style={{ ...styles.p }}>
            Maak u geen zorgen - dit kan gebeuren! Om uw abonnement actief te
            houden en eventuele onderbrekingen van uw service te voorkomen,
            verzoeken wij u uw betalingsgegevens bij te werken.
          </Text>

          <Button
            href={`${SERVER_URL}/account-details/subscription`}
            style={{
              ...styles.button,
              textAlign: "center" as const,
              maxWidth: "250px",
              marginBottom: "24px",
            }}
          >
            Betalingsmethode bijwerken
          </Button>

          <Text style={{ ...styles.p }}>
            Als u hulp nodig heeft, kunt u uw abonnement ook beheren via uw{" "}
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

export const unpaidInvoiceUserHtml = ({
  customerEmail,
  customerName,
  subscriptionName,
  amountDue,
  dueDate,
}: UserEmailProps) =>
  render(
    <UnpaidInvoiceUserEmailTemplate
      customerEmail={customerEmail}
      customerName={customerName}
      subscriptionName={subscriptionName}
      amountDue={amountDue}
      dueDate={dueDate}
    />
  );
