import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'profile.viewMyRecords': {
    id: 'profile.viewMyRecords',
    defaultMessage: 'View My Records',
    description: 'A link to go view my academic records',
  },
  'profile.loading': {
    id: 'profile.loading',
    defaultMessage: 'Profile loading...',
    description: 'Message displayed when the profile data is loading.',
  },
  'profile.username': {
    id: 'profile.username',
    defaultMessage: 'Username',
    description: 'Label for the username field.',
  },
  'profile.username.tooltip': {
    id: 'profile.username.tooltip',
    defaultMessage: 'The name that identifies you on edX. You cannot change your username.',
    description: 'Tooltip for the username field.',
  },
  'profile.completion.title': {
    id: 'profile.completion.title',
    defaultMessage: 'Profile Completion',
    description: 'Title for profile completion section',
  },
  'profile.completion.message': {
    id: 'profile.completion.message',
    defaultMessage: 'Complete your profile to unlock more features and personalized recommendations.',
    description: 'Message for profile completion',
  },
  'profile.extended.title': {
    id: 'profile.extended.title',
    defaultMessage: 'Extended Profile Information',
    description: 'Title for extended profile section',
  },
  'profile.extended.message': {
    id: 'profile.extended.message',
    defaultMessage: 'Please complete the following sections to help us personalize your learning experience.',
    description: 'Message for extended profile',
  },
});

export default messages;
