import { useNotificationPreferenceQuery, useUpcomingQuery } from "../../app/api";

export function useRenewalReminders() {
  const preference = useNotificationPreferenceQuery(undefined);
  const enabled = preference.data?.renewalRemindersEnabled ?? true;
  const days = preference.data?.daysBeforeRenewal ?? 7;
  const upcoming = useUpcomingQuery(days, {skip: preference.data === undefined || !enabled});
  return {preference, upcoming: {...upcoming, data: enabled && preference.data !== undefined ? upcoming.currentData : []}, enabled};
}
