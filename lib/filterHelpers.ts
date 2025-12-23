// Filter Helper Utilities
// Centralized functions to generate translated dropdown options

import { CANTON_CODES } from './cantonData';

// Type for translation function
type TranslationFunction = (key: string) => string;

// Generate canton options for dropdowns
export function getCantonOptions(t: TranslationFunction, includeAll: boolean = true) {
  const options = CANTON_CODES.map(code => ({
    value: code,
    label: t(`cantons.${code}`)
  }));

  if (includeAll) {
    options.unshift({ value: '', label: t('cantons.allCantons') });
  }

  return options;
}

// Generate position options for dropdowns
export function getPositionOptions(t: TranslationFunction, includeAll: boolean = true) {
  const positions = [
    { value: 'OUTSIDE_HITTER', key: 'playerProfile.positionOutsideHitter' },
    { value: 'OPPOSITE', key: 'playerProfile.positionOpposite' },
    { value: 'MIDDLE_BLOCKER', key: 'playerProfile.positionMiddleBlocker' },
    { value: 'SETTER', key: 'playerProfile.positionSetter' },
    { value: 'LIBERO', key: 'playerProfile.positionLibero' },
    { value: 'UNIVERSAL', key: 'playerProfile.positionUniversal' },
  ];

  const options = positions.map(pos => ({
    value: pos.value,
    label: t(pos.key)
  }));

  if (includeAll) {
    options.unshift({ value: '', label: t('clubProfile.all') });
  }

  return options;
}

// Generate video category options
export function getVideoCategoryOptions(t: TranslationFunction) {
  const categories = [
    'HIGHLIGHTS',
    'FULL_MATCH',
    'SKILLS',
    'SERVING',
    'ATTACKING',
    'BLOCKING',
    'DEFENSE',
    'SETTING',
    'TRAINING',
  ];

  return categories.map(category => ({
    value: category,
    label: t(`videoCategories.${category}`)
  }));
}

// Generate recruiter role options
export function getRecruiterRoleOptions(t: TranslationFunction, includeSelect: boolean = true) {
  const roles = [
    'Cheftrainer',
    'Assistenztrainer',
    'Jugendtrainer',
    'Scout',
    'Teammanager',
  ];

  const options = roles.map(role => ({
    value: role,
    label: t(`recruiterRoles.${role}`)
  }));

  if (includeSelect) {
    options.unshift({ value: '', label: t('recruiterRoles.selectRole') });
  }

  return options;
}
