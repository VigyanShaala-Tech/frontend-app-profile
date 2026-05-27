import React, {
  useEffect, useContext, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { ensureConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Alert } from '@openedx/paragon';
import classNames from 'classnames';

import {
  fetchProfile,
  saveProfile,
  saveProfilePhoto,
  deleteProfilePhoto,
  openForm,
  closeForm,
  updateDraft,
} from './data/actions';

import CustomProfileAvatar from './forms/custom-profile-fields/CustomProfileAvatar';
import Name from './forms/Name';
// import CustomGender from './forms/custom-profile-fields/CustomGender';
import CustomCountry from './forms/custom-profile-fields/CustomCountry';
import PreferredLanguage from './forms/PreferredLanguage';
import Education from './forms/Education';
import CustomSocialLinks from './forms/custom-profile-fields/CustomSocialLinks';
import CustomBio from './forms/custom-profile-fields/CustomBio';
import PageLoading from './PageLoading';
import Certificates from './Certificates';
import CustomProfileCompletion from './forms/CustomProfileCompletion';
import CustomExtendedProfileInformation from './forms/CustomDynamicExtendedProfileInformation';
import { profilePageSelector } from './data/selectors';
import messages from './ProfilePage.messages';
import customMessages from './CustomProfilePage.messages';
import withParams from '../utils/hoc';
import { useIsOnMobileScreen } from './data/hooks';
import './forms/custom-style/customProfilePage.scss';
import './forms/custom-style/customGlobalStyle.scss';

import AdditionalProfileFieldsSlot from '../plugin-slots/AdditionalProfileFieldsSlot';

ensureConfig(['CREDENTIALS_BASE_URL', 'LMS_BASE_URL', 'ACCOUNT_SETTINGS_URL'], 'ProfilePage');

const ProfilePage = ({ params }) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const context = useContext(AppContext);
  const {
    dateJoined,
    courseCertificates,
    name,
    visibilityName,
    profileImage,
    savePhotoState,
    isLoadingProfile,
    photoUploadError,
    country,
    visibilityCountry,
    levelOfEducation,
    visibilityLevelOfEducation,
    gender,
    visibilityGender,
    socialLinks,
    draftSocialLinksByPlatform,
    visibilitySocialLinks,
    languageProficiencies,
    visibilityLanguageProficiencies,
    bio,
    visibilityBio,
    saveState,
    username,
  } = useSelector(profilePageSelector);

  const navigate = useNavigate();
  const isMobileView = useIsOnMobileScreen();

  useEffect(() => {
    dispatch(fetchProfile(params.username));
    sendTrackingLogEvent('edx.profile.viewed', {
      username: params.username,
    });
  }, [dispatch, params.username]);

  useEffect(() => {
    if (!username && saveState === 'error' && navigate) {
      navigate('/notfound');
    }
  }, [username, saveState, navigate]);

  const authenticatedUserName = context.authenticatedUser.username;

  const handleSaveProfilePhoto = useCallback((formData) => {
    dispatch(saveProfilePhoto(authenticatedUserName, formData));
  }, [dispatch, authenticatedUserName]);

  const handleDeleteProfilePhoto = useCallback(() => {
    dispatch(deleteProfilePhoto(authenticatedUserName));
  }, [dispatch, authenticatedUserName]);

  const handleClose = useCallback((formId) => {
    dispatch(closeForm(formId));
  }, [dispatch]);

  const handleOpen = useCallback((formId) => {
    dispatch(openForm(formId));
  }, [dispatch]);

  const handleSubmit = useCallback((formId) => {
    dispatch(saveProfile(formId, authenticatedUserName));
  }, [dispatch, authenticatedUserName]);

  const handleChange = useCallback((fieldName, value) => {
    dispatch(updateDraft(fieldName, value));
  }, [dispatch]);

  const isAuthenticatedUserProfile = () => params.username === authenticatedUserName;
  const isBlockVisible = (blockInfo) => isAuthenticatedUserProfile()
      || (!isAuthenticatedUserProfile() && Boolean(blockInfo));

  const joinedYear = (() => {
    if (!dateJoined) {
      return '-';
    }
    const parsedDate = new Date(dateJoined);
    return Number.isNaN(parsedDate.getTime()) ? '-' : parsedDate.getFullYear().toString();
  })();

  const renderPhotoUploadErrorMessage = () => (
    photoUploadError && (
      <div className="row">
        <div className="col-md-4 col-lg-3">
          <Alert variant="danger" dismissible={false} show>
            {photoUploadError.userMessage}
          </Alert>
        </div>
      </div>
    )
  );

  const commonFormProps = {
    openHandler: handleOpen,
    closeHandler: handleClose,
    submitHandler: handleSubmit,
    changeHandler: handleChange,
  };

  return (
    <div className="profile-page custom-profile-root">
      {isLoadingProfile ? (
        <PageLoading srMessage={intl.formatMessage(messages['profile.loading'])} />
      ) : (
        <>
          <div className="custom-profile-hero" />
          <div className={classNames(['custom-profile-main'])}>
            <div className="custom-profile-header-card">
              <div className="custom-profile-header-avatar">
                <CustomProfileAvatar
                  className="w-100 h-100"
                  src={profileImage.src}
                  isDefault={profileImage.isDefault}
                  onSave={handleSaveProfilePhoto}
                  onDelete={handleDeleteProfilePhoto}
                  savePhotoState={savePhotoState}
                  isEditable={isAuthenticatedUserProfile()}
                />
              </div>
              <div className="custom-profile-header-text">
                <p className="custom-profile-header-name">{name || params.username}</p>
                <p className="custom-profile-header-subtext">
                  <FormattedMessage
                    id={customMessages['profile.custom.page.memberSince'].id}
                    defaultMessage={customMessages['profile.custom.page.memberSince'].defaultMessage}
                    values={{ year: joinedYear }}
                  />
                </p>
              </div>
            </div>
            <div className="ml-auto">
              {renderPhotoUploadErrorMessage()}
            </div>
          </div>

          <div className={classNames(['custom-profile-layout', isMobileView ? 'py-2' : 'py-4'])}>
            <div className="custom-profile-top-title">
              <p className="custom-profile-section-title">
                <FormattedMessage
                  id={customMessages['profile.custom.page.profileInformation'].id}
                  defaultMessage={customMessages['profile.custom.page.profileInformation'].defaultMessage}
                />
              </p>
              <p className="custom-profile-section-description">
                <FormattedMessage
                  id={customMessages['profile.custom.page.profileInformationDescription'].id}
                  defaultMessage={customMessages['profile.custom.page.profileInformationDescription'].defaultMessage}
                />
              </p>
            </div>

            <div className="custom-profile-content-grid">
              <div className="custom-profile-left-column">
                {isBlockVisible(name) && (
                  <div className="custom-profile-card">
                    <Name
                      name={name}
                      accountSettingsUrl={context.config.ACCOUNT_SETTINGS_URL}
                      visibilityName={visibilityName}
                      formId="name"
                      {...commonFormProps}
                    />
                  </div>
                )}

                {/* Gender field temporarily disabled due to backend issue. */}
                {/*
                {isBlockVisible(gender) && (
                  <div className="custom-profile-card">
                    <CustomGender
                      gender={gender}
                      visibilityGender={visibilityGender}
                      formId="gender"
                      {...commonFormProps}
                    />
                  </div>
                )}
                */}

                {isBlockVisible(country) && (
                  <div className="custom-profile-card">
                    <CustomCountry
                      country={country}
                      visibilityCountry={visibilityCountry}
                      formId="country"
                      labelMessageId="profile.custom.location.label"
                      defaultLabelMessage="Location"
                      {...commonFormProps}
                    />
                  </div>
                )}

                {isBlockVisible((languageProficiencies || []).length) && (
                  <div className="custom-profile-card">
                    <PreferredLanguage
                      languageProficiencies={languageProficiencies || []}
                      visibilityLanguageProficiencies={visibilityLanguageProficiencies}
                      formId="languageProficiencies"
                      {...commonFormProps}
                    />
                  </div>
                )}

                {isBlockVisible(levelOfEducation) && (
                  <div className="custom-profile-card">
                    <Education
                      levelOfEducation={levelOfEducation}
                      visibilityLevelOfEducation={visibilityLevelOfEducation}
                      formId="levelOfEducation"
                      {...commonFormProps}
                    />
                  </div>
                )}

                {isBlockVisible(bio) && (
                  <div className="custom-profile-card">
                    <CustomBio
                      bio={bio}
                      visibilityBio={visibilityBio}
                      formId="bio"
                      titleMessageId="profile.custom.about.me"
                      defaultTitleMessage="About Me"
                      {...commonFormProps}
                    />
                  </div>
                )}

                <AdditionalProfileFieldsSlot />

                {isBlockVisible((socialLinks || []).some((link) => link?.socialLink !== null)) && (
                  <div className="custom-profile-card">
                    <p className="h5 font-weight-bold m-0 pb-2">
                      <FormattedMessage
                        id={customMessages['profile.custom.page.socialLinks'].id}
                        defaultMessage={customMessages['profile.custom.page.socialLinks'].defaultMessage}
                      />
                    </p>
                    <CustomSocialLinks
                      socialLinks={socialLinks || []}
                      draftSocialLinksByPlatform={draftSocialLinksByPlatform || {}}
                      visibilitySocialLinks={visibilitySocialLinks}
                      formId="socialLinks"
                      {...commonFormProps}
                    />
                  </div>
                )}
              </div>

              <div className="custom-profile-right-column">
                <CustomProfileCompletion />
              </div>
            </div>
          </div>

          <CustomExtendedProfileInformation />

          <div className={classNames(['custom-profile-certificates-section'])}>
            <div className="custom-profile-card w-100">
              <p className="custom-profile-certificate-title">
                <FormattedMessage
                  id={customMessages['profile.custom.page.certificates'].id}
                  defaultMessage={customMessages['profile.custom.page.certificates'].defaultMessage}
                />
              </p>
              {isBlockVisible((courseCertificates || []).length) && (
                <Certificates
                  certificates={courseCertificates || []}
                  formId="certificates"
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

ProfilePage.propTypes = {
  params: PropTypes.shape({
    username: PropTypes.string.isRequired,
  }).isRequired,
  requiresParentalConsent: PropTypes.bool,
  dateJoined: PropTypes.string,
  username: PropTypes.string,
  bio: PropTypes.string,
  visibilityBio: PropTypes.string,
  courseCertificates: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
  })),
  country: PropTypes.string,
  visibilityCountry: PropTypes.string,
  levelOfEducation: PropTypes.string,
  visibilityLevelOfEducation: PropTypes.string,
  languageProficiencies: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string.isRequired,
  })),
  gender: PropTypes.string,
  visibilityGender: PropTypes.string,
  visibilityLanguageProficiencies: PropTypes.string,
  name: PropTypes.string,
  visibilityName: PropTypes.string,
  socialLinks: PropTypes.arrayOf(PropTypes.shape({
    platform: PropTypes.string,
    socialLink: PropTypes.string,
  })),
  draftSocialLinksByPlatform: PropTypes.objectOf(PropTypes.shape({
    platform: PropTypes.string,
    socialLink: PropTypes.string,
  })),
  visibilitySocialLinks: PropTypes.string,
  profileImage: PropTypes.shape({
    src: PropTypes.string,
    isDefault: PropTypes.bool,
  }),
  saveState: PropTypes.oneOf([null, 'pending', 'complete', 'error']),
  savePhotoState: PropTypes.oneOf([null, 'pending', 'complete', 'error']),
  isLoadingProfile: PropTypes.bool,
  photoUploadError: PropTypes.objectOf(PropTypes.string),
};

ProfilePage.defaultProps = {
  saveState: null,
  username: '',
  savePhotoState: null,
  photoUploadError: {},
  profileImage: {},
  name: null,
  levelOfEducation: null,
  country: null,
  socialLinks: [],
  draftSocialLinksByPlatform: {},
  bio: null,
  languageProficiencies: [],
  gender: null,
  visibilityGender: null,
  courseCertificates: [],
  requiresParentalConsent: null,
  dateJoined: null,
  visibilityName: null,
  visibilityCountry: null,
  visibilityLevelOfEducation: null,
  visibilitySocialLinks: null,
  visibilityLanguageProficiencies: null,
  visibilityBio: null,
  isLoadingProfile: false,
};

export default withParams(ProfilePage);
