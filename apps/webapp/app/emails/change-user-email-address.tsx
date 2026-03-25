import { Container, Head, Html, render, Text } from "@react-email/components";
import { styles } from "./styles";

/**
 * THis is the text version of the change email address email
 */
export const changeEmailAddressTextEmail = ({
  otp,
  user,
}: {
  otp: string;
  user: { firstName?: string | null; lastName?: string | null; email: string };
}) => `Hallo ${user.firstName ? user.firstName : ""} ${
  user.lastName ? user.lastName : ""
},

Uw verificatiecode voor de wijziging van uw e-mailadres is: ${otp}

Deel deze code met niemand. Onze klantenservice zal u nooit om uw wachtwoord, OTP, creditcardgegevens of bankgegevens vragen.
Deze code verloopt over 1 uur. Als u deze wijziging niet heeft aangevraagd, negeer dan deze e-mail en neem onmiddellijk contact op met de klantenservice.

Met vriendelijke groet,
het TechOps team`;

function ChangeEmailAddressHtmlEmailTemplate({
  otp,
  user,
}: {
  otp: string;
  user: { firstName?: string | null; lastName?: string | null; email: string };
}) {
  return (
    <Html>
      <Head>
        <title>🔐 Uw verificatiecode voor de wijziging van uw e-mailadres is: {otp}</title>
      </Head>

      <Container style={{ maxWidth: "100%" }}>
        <div style={{ paddingTop: "8px" }}>
          <Text style={{ ...styles.p }}>
            Hallo{" "}
            {`${user.firstName ? user.firstName : ""} ${
              user.lastName ? user.lastName : ""
            }`}
            ,
          </Text>
          <Text style={{ ...styles.p }}>
            Uw verificatiecode voor de wijziging van uw e-mailadres is:
          </Text>
          <h2>
            <b>{otp}</b>
          </h2>
          <Text style={{ ...styles.p }}>
            Deel deze code met niemand. Onze klantenservice zal u nooit om uw
            wachtwoord, OTP, creditcardgegevens of bankgegevens vragen.
          </Text>
          <Text style={{ ...styles.p }}>
            Deze code verloopt over 1 uur. Als u deze wijziging niet heeft
            aangevraagd, negeer dan deze e-mail en neem onmiddellijk contact op
            met de klantenservice.
            <br />
            <br />
            Met vriendelijke groet,
            <br />
            het TechOps team
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
export const changeEmailAddressHtmlEmail = (
  otp: string,
  user: { firstName?: string | null; lastName?: string | null; email: string }
) => render(<ChangeEmailAddressHtmlEmailTemplate otp={otp} user={user} />);
