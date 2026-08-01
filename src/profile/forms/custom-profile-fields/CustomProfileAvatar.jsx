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
  gender,
}) => (
  <ProfileAvatar
    src={src}
    isDefault={isDefault}
    onSave={onSave}
    onDelete={onDelete}
    savePhotoState={savePhotoState}
    isEditable={isEditable}
    gender={gender}
  />
);

CustomProfileAvatar.propTypes = {
  src: PropTypes.string,
  isDefault: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  savePhotoState: PropTypes.oneOf([null, 'pending', 'complete', 'error']),
  isEditable: PropTypes.bool,
  gender: PropTypes.string,
};

CustomProfileAvatar.defaultProps = {
  src: null,
  isDefault: true,
  savePhotoState: null,
  isEditable: false,
  gender: null,
};

export default CustomProfileAvatar;
