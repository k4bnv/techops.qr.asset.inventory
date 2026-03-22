import type { FC } from "react";
import SubHeading from "~/components/shared/sub-heading";

export type OtpVerifyMode = "login" | "signup" | "confirm_signup";

export type OtpPageData = Record<
  OtpVerifyMode,
  {
    title: string;
    SubHeading: FC<{ email: string }>;
    buttonTitle: string;
  }
>;

export const OTP_PAGE_MAP: OtpPageData = {
  login: {
    title: "Vul uw code in",
    SubHeading: ({ email }) => (
      <SubHeading className="-mt-4 text-center">
        We hebben een code verzonden naar{" "}
        <span className="font-bold text-gray-900">{email}</span>. Vul de onderstaande code
        in om in te loggen.
      </SubHeading>
    ),
    buttonTitle: "Inloggen",
  },
  signup: {
    title: "Maak een account aan",
    SubHeading: () => (
      <SubHeading className="-mt-4 text-center">
        Begin uw reis met TechOps.
      </SubHeading>
    ),
    buttonTitle: "Account Aanmaken",
  },
  confirm_signup: {
    title: "Bevestig uw e-mailadres",
    SubHeading: ({ email }) => (
      <SubHeading className="-mt-4 text-center">
        We hebben een code verzonden naar{" "}
        <span className="font-bold text-gray-900">{email}</span>. Vul de onderstaande code
        in om uw e-mailadres te bevestigen.
      </SubHeading>
    ),
    buttonTitle: "Bevestigen",
  },
};

export const DEFAULT_PAGE_DATA: OtpPageData["login"] = {
  title: "Eenmalig Wachtwoord",
  buttonTitle: "Doorgaan",
  SubHeading: () => (
    <SubHeading className="-mt-4 text-center">
      Bevestig uw OTP om door te gaan
    </SubHeading>
  ),
};

export function getOtpPageData(mode: OtpVerifyMode) {
  return OTP_PAGE_MAP[mode] ?? DEFAULT_PAGE_DATA;
}
