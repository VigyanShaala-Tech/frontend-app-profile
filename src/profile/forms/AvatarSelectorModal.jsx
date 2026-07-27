import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ModalDialog } from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { getAvatarsForGender } from '../assets/avatars';
import messages from './AvatarSelectorModal.messages';
import './custom-style/customAvatarSelector.scss';

// Maps the Blob's sniffed content-type back to a file extension so the
// synthetic File we build looks exactly like a real upload to the backend's
// image-extension/mimetype validation (see profile_images/images.py IMAGE_TYPES).
const MIME_TO_EXTENSION = {
  'image/jpeg': 'jpg',
  'image/pjpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
};

// Converts a bundled avatar asset (webpack-resolved URL) into the same
// multipart FormData shape ProfileAvatar's real file input produces
// (`new FormData(form)` where the input is `name="file"`), so it can be
// handed to the exact same onSave/saveProfilePhoto save path as an upload.
const buildAvatarFormData = async (avatar) => {
  const response = await fetch(avatar.src);
  const blob = await response.blob();
  const extension = MIME_TO_EXTENSION[blob.type] || 'jpg';
  const file = new File([blob], `${avatar.id}.${extension}`, { type: blob.type });
  const formData = new FormData();
  formData.append('file', file);
  return formData;
};

const AvatarSelectorModal = ({ isOpen, onClose, onSelect, gender }) => {
  const intl = useIntl();
  const [pendingAvatarId, setPendingAvatarId] = useState(null);
  const [error, setError] = useState(null);
  const filteredAvatars = useMemo(() => getAvatarsForGender(gender), [gender]);

  const handleSelect = useCallback(async (avatar) => {
    setError(null);
    setPendingAvatarId(avatar.id);
    try {
      const formData = await buildAvatarFormData(avatar);
      onSelect(formData);
      onClose();
    } catch (e) {
      setError(intl.formatMessage(messages['profile.avatarselector.error']));
    } finally {
      setPendingAvatarId(null);
    }
  }, [intl, onSelect, onClose]);

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
      title={intl.formatMessage(messages['profile.avatarselector.modal.title'])}
      className="avatar-selector-modal"
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          <FormattedMessage {...messages['profile.avatarselector.modal.title']} />
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        <p className="small text-muted mb-3">
          <FormattedMessage {...messages['profile.avatarselector.modal.description']} />
        </p>

        {error && <p className="small text-danger mb-3">{error}</p>}

        <div className="avatar-selector-grid">
          {filteredAvatars.map((avatar, index) => (
            <button
              key={avatar.id}
              type="button"
              className="avatar-selector-grid__item"
              disabled={pendingAvatarId !== null}
              onClick={() => handleSelect(avatar)}
            >
              {pendingAvatarId === avatar.id && (
                <span className="avatar-selector-grid__spinner spinner-border text-primary" role="status" />
              )}
              <img
                src={avatar.src}
                alt={intl.formatMessage(messages['profile.avatarselector.option.alt'], { number: index + 1 })}
                className="avatar-selector-grid__image"
              />
            </button>
          ))}
        </div>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

AvatarSelectorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  gender: PropTypes.string,
};

AvatarSelectorModal.defaultProps = {
  gender: null,
};

export default AvatarSelectorModal;
