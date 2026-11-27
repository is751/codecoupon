export type CountryCode =
  | 'GLOBAL'
  | 'US'
  | 'UK'
  | 'CA'
  | 'AU'
  | 'DE'
  | 'AE'
  | 'IN'
  | 'PK';

export type CountryFilter = 'ALL' | CountryCode;

export interface CountryOption {
  code: CountryCode;
  label: string;
  shortLabel: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: 'GLOBAL', label: 'Worldwide / Global', shortLabel: 'Global' },
  { code: 'US', label: 'United States', shortLabel: 'US' },
  { code: 'UK', label: 'United Kingdom', shortLabel: 'UK' },
  { code: 'CA', label: 'Canada', shortLabel: 'CA' },
  { code: 'AU', label: 'Australia', shortLabel: 'AU' },
  { code: 'DE', label: 'Germany / EU', shortLabel: 'DE / EU' },
  { code: 'AE', label: 'United Arab Emirates', shortLabel: 'UAE' },
  { code: 'IN', label: 'India', shortLabel: 'IN' },
  { code: 'PK', label: 'Pakistan', shortLabel: 'PK' },
];

export function getCountryInfo(code: CountryCode): CountryOption {
  return COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
}

export function formatCountriesBadge(countries?: CountryCode[]): string {
  if (!countries || countries.length === 0) return 'Global';
  if (countries.includes('GLOBAL')) return 'Global';
  if (countries.length <= 3) {
    return countries.map((c) => getCountryInfo(c).shortLabel).join(' · ');
  }
  const firstTwo = countries.slice(0, 2).map((c) => getCountryInfo(c).shortLabel).join(' · ');
  return `${firstTwo} +${countries.length - 2}`;
}

export function formatCountriesFull(countries?: CountryCode[]): string {
  if (!countries || countries.length === 0) return 'Worldwide (International)';
  if (countries.includes('GLOBAL')) return 'Worldwide (Eligible International Regions)';
  return countries.map((c) => getCountryInfo(c).label).join(', ');
}

export function matchesCountryFilter(
  itemCountries: CountryCode[] | undefined,
  selectedCountry: CountryFilter
): boolean {
  if (selectedCountry === 'ALL') return true;
  if (!itemCountries || itemCountries.length === 0) return true;
  if (itemCountries.includes('GLOBAL')) return true;
  if (selectedCountry === 'GLOBAL') return itemCountries.includes('GLOBAL');
  return itemCountries.includes(selectedCountry);
}
