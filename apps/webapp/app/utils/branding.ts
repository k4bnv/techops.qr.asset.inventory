/**
 * Resolves whether TechOps branding should be displayed on labels.
 * White-label override: always returns false for TechOps self-hosted instance.
 */
export const resolveShowShelfBranding = (
  _override?: boolean,
  _organizationDefault?: boolean
): boolean => false;
