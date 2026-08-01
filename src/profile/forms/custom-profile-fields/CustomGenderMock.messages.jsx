import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'profile.custom.gender.validation.required': {
    id: 'profile.custom.gender.validation.required',
    defaultMessage: 'Please select gender.',
    description: 'Validation error when gender is not selected',
  },
  'profile.custom.gender.helper.save': {
    id: 'profile.custom.gender.helper.save',
    defaultMessage: 'Select gender to enable save.',
    description: 'Helper text shown when gender is not selected',
  },
  'profile.custom.gender.empty': {
    id: 'profile.custom.gender.empty',
    defaultMessage: 'Add gender',
    description: 'Empty state CTA for custom gender field',
  },
  'profile.custom.gender.placeholder': {
    id: 'profile.custom.gender.placeholder',
    defaultMessage: 'Select gender',
    description: 'Placeholder for custom gender searchable dropdown',
  },
});

export default messages;
