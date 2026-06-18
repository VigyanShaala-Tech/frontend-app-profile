import React from 'react';
import PropTypes from 'prop-types';

import ProfileAvatar from '../ProfileAvatar';

const CustomProfileAvatar = ({
  src,
  isDefault,
  onSave,
  onDelete,
  savePhotoState,
  isEditable,
}) => (
  <ProfileAvatar
    src={src}
    isDefault={isDefault}
    onSave={onSave}
    onDelete={onDelete}
    savePhotoState={savePhotoState}
    isEditable={isEditable}
  />
);

CustomProfileAvatar.propTypes = {
  src: PropTypes.string,
  isDefault: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  savePhotoState: PropTypes.oneOf([null, 'pending', 'complete', 'error']),
  isEditable: PropTypes.bool,
};

CustomProfileAvatar.defaultProps = {
  src: null,
  isDefault: true,
  savePhotoState: null,
  isEditable: false,
};

export default CustomProfileAvatar;
