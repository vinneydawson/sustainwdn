
export const countries = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  // Add more countries as needed...
].sort((a, b) => a.name.localeCompare(b.name));

export const timezones = Intl.supportedValuesOf('timeZone').map(zone => ({
  value: zone,
  label: zone.replace(/_/g, ' ')
}));

export const detectUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
