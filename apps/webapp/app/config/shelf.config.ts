import {
  COLLECT_BUSINESS_INTEL,
  DISABLE_SIGNUP,
  DISABLE_SSO,
  ENABLE_PREMIUM_FEATURES,
  FREE_TRIAL_DAYS,
  GEOCODING_USER_AGENT,
  SEND_ONBOARDING_EMAIL,
  SHOW_HOW_DID_YOU_FIND_US,
} from "~/utils/env";
import { Config } from "./types";

export const config: Config = {
  sendOnboardingEmail: SEND_ONBOARDING_EMAIL || true,
  enablePremiumFeatures: false, // White-label: paywalls disabled for TechOps
  freeTrialDays: Number(FREE_TRIAL_DAYS || 7),
  disableSignup: false, // Hardcoded to true for TechOps deployment
  disableSSO: DISABLE_SSO || false,

  logoPath: {
    fullLogo: "/static/images/logo-full-color(x2).png",
    symbol: "/static/images/shelf-symbol.png",
  },
  faviconPath: "/static/favicon.svg",
  emailPrimaryColor: "#EF6820",
  showHowDidYouFindUs: SHOW_HOW_DID_YOU_FIND_US || false,
  collectBusinessIntel:
    COLLECT_BUSINESS_INTEL || SHOW_HOW_DID_YOU_FIND_US || false,
  geocoding: {
    userAgent: GEOCODING_USER_AGENT || "Self-hosted Asset Management System",
  },
};
