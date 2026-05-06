export const GENERAL_MEETING_DATE = new Date("2026-06-16");

export const GENERAL_MEETING_DATE_DISPLAY = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(GENERAL_MEETING_DATE);
