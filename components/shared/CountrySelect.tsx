import React from 'react';
import { getAllCountriesWithFlags } from '@/lib/countryFlags';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const countries = getAllCountriesWithFlags();

export default function CountrySelect({ value, onChange, className }: CountrySelectProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={className || 'w-full px-4 py-2 border rounded-lg'}
    >
      {countries.map(country => (
        <option key={country.code} value={country.name}>
          {country.flagEmoji ? `${country.flagEmoji} ` : ''}{country.name}
        </option>
      ))}
      <option value="Other">🌍 Other</option>
    </select>
  );
}
