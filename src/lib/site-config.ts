// Midnight in Stockholm (Europe/Stockholm, CEST = UTC+2 in June) on 16 June 2026
export const GENERAL_MEETING_DATE = new Date("2026-06-10T22:00:00Z");

export const GENERAL_MEETING_DATE_DISPLAY = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(GENERAL_MEETING_DATE);
