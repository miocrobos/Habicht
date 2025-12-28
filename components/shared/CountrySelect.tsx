import React from 'react';
import { getAllCountriesWithFlags } from '@/lib/countryFlags';
import { useLanguage } from '@/contexts/LanguageContext';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const allCountries = getAllCountriesWithFlags();
// Put Switzerland first, then all others
const switzerland = allCountries.find(c => c.name === 'Switzerland');
const otherCountries = allCountries.filter(c => c.name !== 'Switzerland' && c.name !== 'Other');
const other = allCountries.find(c => c.name === 'Other');

const countries = switzerland 
  ? [switzerland, ...otherCountries, ...(other ? [other] : [])]
  : allCountries;

export default function CountrySelect({ value, onChange, className, placeholder = "Select Country" }: CountrySelectProps) {
  const { t } = useLanguage();
  
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={className || 'w-full px-4 py-2 border rounded-lg'}
    >
      {!value && <option value="">{placeholder}</option>}
      {countries.map(country => (
        <option key={country.code} value={country.name}>
          {country.flagEmoji ? `${country.flagEmoji} ` : ''}{t(`countries.${country.code.toLowerCase()}`) || country.name}
        </option>
      ))}
    </select>
  );
}
