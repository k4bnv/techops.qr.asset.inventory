/**
 * Resolves whether the organization logo should be displayed on labels.
 * Uses the organization's showShelfBranding setting to control logo visibility.
 */
export const resolveShowShelfBranding = (
  override?: boolean,
  organizationDefault?: boolean
): boolean => override ?? organizationDefault ?? false;
