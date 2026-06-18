import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@openedx/paragon';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faFacebook, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';

import CustomFormControls from '../custom-components/CustomFormControls';
import EditableItemHeader from '../elements/EditableItemHeader';
import EmptyContent from '../elements/EmptyContent';
import SwitchContent from '../elements/SwitchContent';
import { editableFormSelector } from '../../data/selectors';
import { useIsVisibilityEnabled } from '../../data/hooks';
import messages from './CustomSocialLinks.messages';
import './customSocialLinks.scss';

const platformDisplayInfo = (formatMessage) => ({
  facebook: {
    icon: faFacebook,
    name: formatMessage(messages['profile.custom.social.platform.facebook']),
  },
  twitter: {
    icon: faTwitter,
    name: formatMessage(messages['profile.custom.social.platform.twitter']),
  },
  linkedin: {
    icon: faLinkedin,
    name: formatMessage(messages['profile.custom.social.platform.linkedin']),
  },
});

const PlatformHeading = ({ platform, platformInfo }) => {
  const info = platformInfo[platform];

  return (
    <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5 custom-social-platform-heading">
      <span className="custom-social-platform-heading__content">
        <FontAwesomeIcon icon={info.icon} className="custom-social-platform-heading__icon" />
        <span>{info.name}</span>
      </span>
    </p>
  );
};

PlatformHeading.propTypes = {
  platform: PropTypes.oneOf(['facebook', 'twitter', 'linkedin']).isRequired,
  platformInfo: PropTypes.objectOf(PropTypes.shape({
    icon: PropTypes.shape({}),
    name: PropTypes.string,
  })).isRequired,
};

const CustomSocialLinks = ({
  formId,
  socialLinks,
  draftSocialLinksByPlatform,
  visibilitySocialLinks,
  editMode,
  saveState,
  error,
  changeHandler,
  submitHandler,
  closeHandler,
  openHandler,
}) => {
  const { formatMessage } = useIntl();
  const isVisibilityEnabled = useIsVisibilityEnabled();
  const [activePlatform, setActivePlatform] = useState(null);
  const platformInfo = platformDisplayInfo(formatMessage);

  useEffect(() => {
    if (editMode !== 'editing' && activePlatform !== null) {
      setActivePlatform(null);
    }
  }, [editMode, activePlatform]);

  const mergeWithDrafts = (newSocialLink) => {
    const knownPlatforms = ['twitter', 'facebook', 'linkedin'];
    const updated = [];
    knownPlatforms.forEach((platform) => {
      if (newSocialLink.platform === platform) {
        updated.push(newSocialLink);
      } else if (draftSocialLinksByPlatform[platform] !== undefined) {
        updated.push(draftSocialLinksByPlatform[platform]);
      }
    });
    return updated;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name !== 'visibilitySocialLinks') {
      changeHandler(
        'socialLinks',
        mergeWithDrafts({
          platform: name,
          socialLink: value,
        }),
      );
    } else {
      changeHandler(name, value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitHandler(formId);
    setActivePlatform(null);
  };

  const handleClose = () => {
    closeHandler(formId);
    setActivePlatform(null);
  };

  const handleOpen = (platform) => {
    openHandler(formId);
    setActivePlatform(platform);
  };

  const renderPlatformContent = (platform, socialLink, isEditing) => {
    if (isEditing) {
      return (
        <form onSubmit={handleSubmit}>
          <div className="form-group m-0">
            {error !== null && (
              <div id="social-error-feedback">
                <Alert variant="danger" dismissible={false} show>
                  {error}
                </Alert>
              </div>
            )}
            <div className="pb-3">
              <input
                className={classNames('form-control py-10px', { 'is-invalid': Boolean(error) })}
                type="text"
                id={`social-${platform}`}
                name={platform}
                value={socialLink || ''}
                onChange={handleChange}
                aria-describedby="social-error-feedback"
              />
            </div>
            <CustomFormControls
              visibilityId="visibilitySocialLinks"
              saveState={saveState}
              visibility={visibilitySocialLinks}
              cancelHandler={handleClose}
              onVisibilityChange={(selectedVisibility) => changeHandler('visibilitySocialLinks', selectedVisibility)}
            />
          </div>
        </form>
      );
    }
    if (socialLink) {
      return (
        <div className="w-100 overflowWrap-breakWord">
          <EditableItemHeader
            content={socialLink}
            showEditButton
            onClickEdit={() => handleOpen(platform)}
            showVisibility={visibilitySocialLinks !== null && isVisibilityEnabled}
            visibility={visibilitySocialLinks}
          />
        </div>
      );
    }
    return (
      <EmptyContent onClick={() => handleOpen(platform)}>
        {formatMessage(messages['profile.custom.social.add.network'], { network: platformInfo[platform].name })}
      </EmptyContent>
    );
  };

  return (
    <SwitchContent
      className="p-0"
      expression={editMode}
      cases={{
        empty: (
          <div>
            <div className="custom-social-links__list">
              {socialLinks.map(({ platform }) => (
                <div key={platform} className="custom-social-links__item">
                  <PlatformHeading platform={platform} platformInfo={platformInfo} />
                  <EmptyContent onClick={() => handleOpen(platform)}>
                    {formatMessage(messages['profile.custom.social.add.network.profile'], {
                      network: platformInfo[platform].name,
                    })}
                  </EmptyContent>
                </div>
              ))}
            </div>
          </div>
        ),
        static: (
          <div>
            <div className="custom-social-links__list">
              {socialLinks
                .filter(({ socialLink }) => Boolean(socialLink))
                .map(({ platform, socialLink }) => (
                  <div key={platform} className="custom-social-links__item">
                    <PlatformHeading platform={platform} platformInfo={platformInfo} />
                    <EditableItemHeader
                      content={socialLink}
                      contentPrefix={`${platformInfo[platform].name}: `}
                    />
                  </div>
                ))}
            </div>
          </div>
        ),
        editable: (
          <div>
            <div className="custom-social-links__list">
              {socialLinks.map(({ platform, socialLink }) => (
                <div key={platform} className="custom-social-links__item">
                  <PlatformHeading platform={platform} platformInfo={platformInfo} />
                  {renderPlatformContent(platform, socialLink, false)}
                </div>
              ))}
            </div>
          </div>
        ),
        editing: (
          <div>
            <div className="custom-social-links__list">
              {socialLinks.map(({ platform, socialLink }) => (
                <div key={platform} className="custom-social-links__item">
                  <PlatformHeading platform={platform} platformInfo={platformInfo} />
                  {renderPlatformContent(platform, socialLink, editMode === 'editing' && activePlatform === platform)}
                </div>
              ))}
            </div>
          </div>
        ),
      }}
    />
  );
};

CustomSocialLinks.propTypes = {
  formId: PropTypes.string.isRequired,
  socialLinks: PropTypes.arrayOf(PropTypes.shape({
    platform: PropTypes.string,
    socialLink: PropTypes.string,
  })).isRequired,
  draftSocialLinksByPlatform: PropTypes.objectOf(PropTypes.shape({
    platform: PropTypes.string,
    socialLink: PropTypes.string,
  })),
  visibilitySocialLinks: PropTypes.oneOf(['private', 'all_users']),
  editMode: PropTypes.oneOf(['editing', 'editable', 'empty', 'static']),
  saveState: PropTypes.string,
  error: PropTypes.string,
  changeHandler: PropTypes.func.isRequired,
  submitHandler: PropTypes.func.isRequired,
  closeHandler: PropTypes.func.isRequired,
  openHandler: PropTypes.func.isRequired,
};

CustomSocialLinks.defaultProps = {
  editMode: 'static',
  saveState: null,
  draftSocialLinksByPlatform: {},
  visibilitySocialLinks: 'private',
  error: null,
};

export default connect(
  editableFormSelector,
  {},
)(CustomSocialLinks);
