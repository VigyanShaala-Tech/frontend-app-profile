import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'Extended.Profile.Information.title': {
    id: 'extended.profile.information.title',
    defaultMessage: 'Extended Profile Information',
    description: 'Heading for extended profile information section',
  },
  'Extended.Profile.Information.description': {
    id: 'extended.profile.information.description',
    defaultMessage: 'Please complete the following sections to help us personalize your learning experience.',
    description: 'Description for extended profile information section',
  },
  'Extended.Profile.Information.load.error': {
    id: 'extended.profile.information.load.error',
    defaultMessage: 'Unable to load extended profile sections right now.',
    description: 'Fallback message when dynamic sections API fails.',
  },
  'Extended.Profile.Information.section.load.error': {
    id: 'extended.profile.information.section.load.error',
    defaultMessage: 'Unable to load this section right now.',
    description: 'Fallback message when a section API fails.',
  },
  'Extended.Profile.Information.save.pending': {
    id: 'extended.profile.information.save.pending',
    defaultMessage: 'Saving...',
    description: 'Pending state label for save button in dynamic form.',
  },
  'Extended.Profile.Information.save.success': {
    id: 'extended.profile.information.save.success',
    defaultMessage: 'Section updated successfully.',
    description: 'Fallback success message after section save.',
  },
  'Extended.Profile.Information.save.error': {
    id: 'extended.profile.information.save.error',
    defaultMessage: 'Unable to save this section. Please try again.',
    description: 'Fallback error message after section save failure.',
  },
  'Extended.Profile.Information.required.suffix': {
    id: 'extended.profile.information.required.suffix',
    defaultMessage: 'is required',
    description: 'Suffix used in required field validation message.',
  },
  'Extended.Profile.Information.validation.invalid.email': {
    id: 'extended.profile.information.validation.invalid.email',
    defaultMessage: 'Please enter a valid email address.',
    description: 'Validation message for invalid email.',
  },
  'Extended.Profile.Information.validation.min.length': {
    id: 'extended.profile.information.validation.min.length',
    defaultMessage: 'Minimum length is {minLength}.',
    description: 'Validation message for minimum length.',
  },
  'Extended.Profile.Information.validation.max.length': {
    id: 'extended.profile.information.validation.max.length',
    defaultMessage: 'Maximum length is {maxLength}.',
    description: 'Validation message for maximum length.',
  },
  'Extended.Profile.Information.validation.min.value': {
    id: 'extended.profile.information.validation.min.value',
    defaultMessage: 'Minimum value is {min}.',
    description: 'Validation message for minimum value.',
  },
  'Extended.Profile.Information.validation.max.value': {
    id: 'extended.profile.information.validation.max.value',
    defaultMessage: 'Maximum value is {max}.',
    description: 'Validation message for maximum value.',
  },
  'Extended.Profile.Information.validation.invalid.format': {
    id: 'extended.profile.information.validation.invalid.format',
    defaultMessage: 'Please enter a valid format.',
    description: 'Validation message for invalid pattern.',
  },
  'Extended.Profile.Information.empty.value': {
    id: 'extended.profile.information.empty.value',
    defaultMessage: 'Not specified',
    description: 'Fallback text when field value is empty.',
  },
  'Extended.Profile.Information.custom.placeholder': {
    id: 'extended.profile.information.custom.placeholder',
    defaultMessage: 'Enter custom {fieldLabel}',
    description: 'Placeholder for custom option input field.',
  },
  'Extended.Profile.Information.select.placeholder': {
    id: 'extended.profile.information.select.placeholder',
    defaultMessage: 'Select',
    description: 'Generic select placeholder in dynamic form.',
  },
  'Extended.Profile.Information.selected.file': {
    id: 'extended.profile.information.selected.file',
    defaultMessage: 'Selected: {fileName}',
    description: 'Text shown when file input has selected file.',
  },
  'Extended.Profile.Information.file.change.label': {
    id: 'extended.profile.information.file.change.label',
    defaultMessage: 'Replace file',
    description: 'Label for the file input used to replace an already-uploaded file field.',
  },
  'Extended.Profile.Information.file.uploading': {
    id: 'extended.profile.information.file.uploading',
    defaultMessage: 'Uploading...',
    description: 'Status text shown while a replacement file is uploading.',
  },
  'Extended.Profile.Information.file.upload.success': {
    id: 'extended.profile.information.file.upload.success',
    defaultMessage: 'File uploaded successfully.',
    description: 'Status text shown after a replacement file upload succeeds.',
  },
  'Extended.Profile.Information.file.upload.error': {
    id: 'extended.profile.information.file.upload.error',
    defaultMessage: 'Unable to upload this file. Please try again.',
    description: 'Fallback status text shown after a replacement file upload fails.',
  },
  'Extended.Profile.Information.file.validation.too.large': {
    id: 'extended.profile.information.file.validation.too.large',
    defaultMessage: 'File is too large. Maximum size is {maxSizeMB} MB.',
    description: 'Client-side validation message when a selected file exceeds the field\'s size limit.',
  },
  'Extended.Profile.Information.file.validation.invalid.type': {
    id: 'extended.profile.information.file.validation.invalid.type',
    defaultMessage: 'Unsupported file type. Allowed: {accept}.',
    description: 'Client-side validation message when a selected file does not match the field\'s accepted types.',
  },
  'Extended.Profile.Information.file.no.file': {
    id: 'extended.profile.information.file.no.file',
    defaultMessage: 'No file uploaded',
    description: 'Text shown for a file field with no uploaded file yet.',
  },
});

export default messages;
