/**
 * Pending deep link to Pet screen (e.g. from Dynamic Island tap).
 * Used when app is opened via wallpe://pet so we can navigate to PetScreen after stack mounts.
 */
let pendingNavigateToPet = false;

export function setPendingNavigateToPet(value: boolean): void {
  pendingNavigateToPet = value;
}

export function getAndClearPendingNavigateToPet(): boolean {
  const v = pendingNavigateToPet;
  pendingNavigateToPet = false;
  return v;
}
