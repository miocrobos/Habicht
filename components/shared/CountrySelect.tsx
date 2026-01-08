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
  
  const getCountryTranslation = (country: any) => {
    // Convert country code to camelCase key for translation lookup
    const key = country.code.toLowerCase().replace(/_/g, '');
    const translated = t(`countries.${key}`);
    // If translation returns the key itself (no translation found), use country name
    return translated.startsWith('countries.') ? country.name : translated;
  };
  
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={className || 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}
      style={{ colorScheme: 'light dark' }}
    >
      {!value && <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">{placeholder}</option>}
      {countries.map(country => (
        <option key={country.code} value={country.name} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          {country.flagEmoji ? `${country.flagEmoji} ` : ''}{getCountryTranslation(country)}
        </option>
      ))}
    </select>
  );
}
