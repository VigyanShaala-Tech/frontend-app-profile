import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'profile.completion.title': {
    id: 'profile.completion.title',
    defaultMessage: 'Profile Completion',
    description: 'Heading for profile completion section',
  },
  'profile.completion.message': {
    id: 'profile.completion.message',
    defaultMessage:
      'Complete your profile to unlock more features and personalized recommendations.',
    description: 'Description text shown below profile completion progress bar',
  },
  'profile.completion.count': {
    id: 'profile.completion.count',
    defaultMessage: '({completed}/{total})',
    description: 'Display for completed profile fields count.',
  },
  'profile.completion.error': {
    id: 'profile.completion.error',
    defaultMessage: 'Could not load profile progress.',
    description: 'Fallback error message when progress API fails.',
  },
});

export default messages;
