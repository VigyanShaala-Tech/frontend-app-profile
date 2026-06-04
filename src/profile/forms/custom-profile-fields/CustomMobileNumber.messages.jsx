import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'profile.custom.mobile.whatsapp.label': {
    id: 'profile.custom.mobile.whatsapp.label',
    defaultMessage: 'WhatsApp Number',
    description: 'Label for custom WhatsApp number profile field',
  },
  'profile.custom.mobile.whatsapp.placeholder': {
    id: 'profile.custom.mobile.whatsapp.placeholder',
    defaultMessage: 'Enter WhatsApp number',
    description: 'Placeholder for custom WhatsApp number input',
  },
  'profile.custom.mobile.whatsapp.add': {
    id: 'profile.custom.mobile.whatsapp.add',
    defaultMessage: 'Add WhatsApp number',
    description: 'Empty state text for custom WhatsApp number field',
  },
  'profile.custom.mobile.whatsapp.validation.invalid': {
    id: 'profile.custom.mobile.whatsapp.validation.invalid',
    defaultMessage: 'Please enter a valid WhatsApp number.',
    description: 'Validation error for invalid WhatsApp number',
  },
  'profile.custom.mobile.whatsapp.validation.send.otp': {
    id: 'profile.custom.mobile.whatsapp.validation.send.otp',
    defaultMessage: 'Please send OTP before saving.',
    description: 'Validation error shown when OTP is required before save',
  },
  'profile.custom.mobile.whatsapp.validation.enter.otp': {
    id: 'profile.custom.mobile.whatsapp.validation.enter.otp',
    defaultMessage: 'Please enter OTP.',
    description: 'Validation error shown when OTP input is empty',
  },
  'profile.custom.mobile.whatsapp.validation.send.failed': {
    id: 'profile.custom.mobile.whatsapp.validation.send.failed',
    defaultMessage: 'Unable to send OTP. Please try again.',
    description: 'Error shown when sending OTP fails',
  },
  'profile.custom.mobile.whatsapp.validation.invalid.otp': {
    id: 'profile.custom.mobile.whatsapp.validation.invalid.otp',
    defaultMessage: 'Invalid OTP. Please retry or resend OTP.',
    description: 'Validation error shown when OTP verification fails',
  },
  'profile.custom.mobile.whatsapp.validation.otp.expired': {
    id: 'profile.custom.mobile.whatsapp.validation.otp.expired',
    defaultMessage: 'OTP expired. Please resend OTP.',
    description: 'Validation error shown when OTP is expired',
  },
  'profile.custom.mobile.whatsapp.status.otp.sent': {
    id: 'profile.custom.mobile.whatsapp.status.otp.sent',
    defaultMessage: 'OTP sent successfully.',
    description: 'Status message after OTP send succeeds',
  },
  'profile.custom.mobile.whatsapp.status.saved': {
    id: 'profile.custom.mobile.whatsapp.status.saved',
    defaultMessage: 'WhatsApp number saved successfully.',
    description: 'Status message after WhatsApp number save succeeds',
  },
  'profile.custom.mobile.whatsapp.button.send.otp': {
    id: 'profile.custom.mobile.whatsapp.button.send.otp',
    defaultMessage: 'Send OTP',
    description: 'Button label to send OTP',
  },
  'profile.custom.mobile.whatsapp.button.send.otp.again': {
    id: 'profile.custom.mobile.whatsapp.button.send.otp.again',
    defaultMessage: 'Send OTP Again',
    description: 'Button label to resend OTP from primary button',
  },
  'profile.custom.mobile.whatsapp.button.sending.otp': {
    id: 'profile.custom.mobile.whatsapp.button.sending.otp',
    defaultMessage: 'Sending OTP...',
    description: 'Button label while OTP is being sent',
  },
  'profile.custom.mobile.whatsapp.button.resend.otp': {
    id: 'profile.custom.mobile.whatsapp.button.resend.otp',
    defaultMessage: 'Resend OTP',
    description: 'Secondary button label to resend OTP',
  },
  'profile.custom.mobile.whatsapp.button.resend.otp.timer': {
    id: 'profile.custom.mobile.whatsapp.button.resend.otp.timer',
    defaultMessage: 'Resend OTP in {seconds}s',
    description: 'Resend OTP button label while countdown is active',
  },
  'profile.custom.mobile.whatsapp.placeholder.otp': {
    id: 'profile.custom.mobile.whatsapp.placeholder.otp',
    defaultMessage: 'Enter OTP',
    description: 'Placeholder for OTP input field',
  },
  'profile.custom.mobile.whatsapp.helper.enter.otp': {
    id: 'profile.custom.mobile.whatsapp.helper.enter.otp',
    defaultMessage: 'Enter OTP and click save.',
    description: 'Helper text shown after OTP is sent',
  },
  'profile.custom.mobile.whatsapp.helper.otp.expired': {
    id: 'profile.custom.mobile.whatsapp.helper.otp.expired',
    defaultMessage: 'OTP expired. Click resend OTP to continue.',
    description: 'Helper text shown when OTP expires',
  },
  'profile.custom.mobile.whatsapp.helper.send.otp': {
    id: 'profile.custom.mobile.whatsapp.helper.send.otp',
    defaultMessage: 'Select country and enter number to send OTP.',
    description: 'Helper text shown before OTP send',
  },
});

export default messages;
