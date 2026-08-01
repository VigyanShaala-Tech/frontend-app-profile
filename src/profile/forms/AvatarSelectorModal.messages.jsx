import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'profile.avatarselector.modal.title': {
    id: 'profile.avatarselector.modal.title',
    defaultMessage: 'Select Avatar',
    description: 'Title for the avatar selector modal',
  },
  'profile.avatarselector.modal.description': {
    id: 'profile.avatarselector.modal.description',
    defaultMessage: 'Choose an avatar to use as your profile photo.',
    description: 'Helper text for the avatar selector modal',
  },
  'profile.avatarselector.option.alt': {
    id: 'profile.avatarselector.option.alt',
    defaultMessage: 'Avatar option {number}',
    description: 'Alt attribute for an individual avatar thumbnail',
  },
  'profile.avatarselector.error': {
    id: 'profile.avatarselector.error',
    defaultMessage: 'Something went wrong selecting this avatar. Please try again.',
    description: 'Error shown when converting/saving the selected avatar fails',
  },
});

export default messages;
