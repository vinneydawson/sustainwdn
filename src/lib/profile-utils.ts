export const countries = [
  { code: "US", name: "United States", continent: "North America" },
  { code: "GB", name: "United Kingdom", continent: "Europe" },
  { code: "CA", name: "Canada", continent: "North America" },
  { code: "AU", name: "Australia", continent: "Oceania" },
  { code: "DE", name: "Germany", continent: "Europe" },
  { code: "FR", name: "France", continent: "Europe" },
  { code: "JP", name: "Japan", continent: "Asia" },
  { code: "CN", name: "China", continent: "Asia" },
  { code: "IN", name: "India", continent: "Asia" },
  { code: "BR", name: "Brazil", continent: "South America" },
  { code: "MX", name: "Mexico", continent: "North America" },
  { code: "IT", name: "Italy", continent: "Europe" },
  { code: "ES", name: "Spain", continent: "Europe" },
  { code: "NL", name: "Netherlands", continent: "Europe" },
  { code: "SG", name: "Singapore", continent: "Asia" },
  { code: "KR", name: "South Korea", continent: "Asia" },
  { code: "NZ", name: "New Zealand", continent: "Oceania" },
  { code: "IE", name: "Ireland", continent: "Europe" },
  { code: "SE", name: "Sweden", continent: "Europe" },
  { code: "NO", name: "Norway", continent: "Europe" },
].sort((a, b) => a.name.localeCompare(b.name));

const COMMON_COUNTRY_CODES = ["US", "GB", "CA", "AU", "DE", "FR", "JP"];

export const groupedCountries = countries.reduce((acc, country) => {
  const group = COMMON_COUNTRY_CODES.includes(country.code) ? "Common Countries" : country.continent;
  if (!acc[group]) {
    acc[group] = [];
  }
  acc[group].push(country);
  return acc;
}, {} as Record<string, typeof countries>);

Object.keys(groupedCountries).forEach(group => {
  groupedCountries[group].sort((a, b) => a.name.localeCompare(b.name));
});

export const detectUserCountry = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('detect-location');
    
    if (error) throw error;
    
    // If the country code exists in our list, use it, otherwise default to US
    const countryExists = countries.some(c => c.code === data.country);
    return countryExists ? data.country : 'US';
  } catch (error) {
    console.error('Error detecting user country:', error);
    return 'US'; // Default to US if detection fails
  }
};

export const timezones = [
  // North America (Common)
  { value: "America/Los_Angeles", label: "Los Angeles, US (Pacific Time, GMT-07:00)", continent: "North America", common: true },
  { value: "America/New_York", label: "New York, US (Eastern Time, GMT-04:00)", continent: "North America", common: true },
  { value: "America/Chicago", label: "Chicago, US (Central Time, GMT-05:00)", continent: "North America", common: true },
  { value: "America/Denver", label: "Denver, US (Mountain Time, GMT-06:00)", continent: "North America", common: true },
  
  // Europe (Common)
  { value: "Europe/London", label: "London, UK (GMT+00:00)", continent: "Europe", common: true },
  { value: "Europe/Paris", label: "Paris, France (GMT+02:00)", continent: "Europe", common: true },
  { value: "Europe/Berlin", label: "Berlin, Germany (GMT+02:00)", continent: "Europe", common: true },

  // Asia Pacific (Common)
  { value: "Asia/Tokyo", label: "Tokyo, Japan (GMT+09:00)", continent: "Asia", common: true },
  { value: "Asia/Singapore", label: "Singapore (GMT+08:00)", continent: "Asia", common: true },
  { value: "Australia/Sydney", label: "Sydney, Australia (GMT+10:00)", continent: "Australia", common: true },

  // North America (Additional)
  { value: "America/Phoenix", label: "Phoenix, US (Mountain Time - No DST, GMT-07:00)", continent: "North America" },
  { value: "America/Anchorage", label: "Anchorage, US (Alaska Time, GMT-08:00)", continent: "North America" },
  { value: "America/Halifax", label: "Halifax, Canada (Atlantic Time, GMT-03:00)", continent: "North America" },
  { value: "America/Toronto", label: "Toronto, Canada (Eastern Time, GMT-04:00)", continent: "North America" },
  { value: "America/Vancouver", label: "Vancouver, Canada (Pacific Time, GMT-07:00)", continent: "North America" },
  { value: "Pacific/Honolulu", label: "Honolulu, US (Hawaii Time, GMT-10:00)", continent: "North America" },

  // Europe (Additional)
  { value: "Europe/Amsterdam", label: "Amsterdam, Netherlands (GMT+02:00)", continent: "Europe" },
  { value: "Europe/Madrid", label: "Madrid, Spain (GMT+02:00)", continent: "Europe" },
  { value: "Europe/Rome", label: "Rome, Italy (GMT+02:00)", continent: "Europe" },
  { value: "Europe/Stockholm", label: "Stockholm, Sweden (GMT+02:00)", continent: "Europe" },
  { value: "Europe/Zurich", label: "Zurich, Switzerland (GMT+02:00)", continent: "Europe" },

  // Asia & Pacific (Additional)
  { value: "Asia/Dubai", label: "Dubai, UAE (GMT+04:00)", continent: "Asia" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (GMT+08:00)", continent: "Asia" },
  { value: "Asia/Seoul", label: "Seoul, South Korea (GMT+09:00)", continent: "Asia" },
  { value: "Asia/Shanghai", label: "Shanghai, China (GMT+08:00)", continent: "Asia" },
  { value: "Australia/Melbourne", label: "Melbourne, Australia (GMT+10:00)", continent: "Australia" },
  { value: "Australia/Perth", label: "Perth, Australia (GMT+08:00)", continent: "Australia" },
];

export const groupedTimezones = timezones.reduce((acc, tz) => {
  const group = tz.common ? "Common Locations" : tz.continent;
  if (!acc[group]) {
    acc[group] = [];
  }
  acc[group].push(tz);
  return acc;
}, {} as Record<string, typeof timezones>);

Object.keys(groupedTimezones).forEach(group => {
  groupedTimezones[group].sort((a, b) => a.label.localeCompare(b.label));
});

export const detectUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
