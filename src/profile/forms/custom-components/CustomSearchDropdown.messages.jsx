import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'custom.dropdown.select.placeholder': {
    id: 'profile.custom.dropdown.select.placeholder',
    defaultMessage: 'Select an option',
    description: 'Default placeholder for single select dropdown.',
  },
  'custom.dropdown.multiselect.placeholder': {
    id: 'profile.custom.dropdown.multiselect.placeholder',
    defaultMessage: 'Select options',
    description: 'Default placeholder for multi select dropdown.',
  },
  'custom.dropdown.search.placeholder': {
    id: 'profile.custom.dropdown.search.placeholder',
    defaultMessage: 'Search options',
    description: 'Search input placeholder inside custom dropdown.',
  },
  'custom.dropdown.no.results': {
    id: 'profile.custom.dropdown.no.results',
    defaultMessage: 'No matching options found',
    description: 'Empty state message when filtered dropdown has no options.',
  },
});

export default messages;
