import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, ProgressBar } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './CustomProfileCompletion.messages';
import './customProfileComplition.scss';
import './custom-style/customGlobalStyle.scss';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { onProfileEvent, PROFILE_EVENTS } from '../../utils/profileEvents';

const getBackendMessage = (payload) => payload?.message
  || payload?.detail
  || payload?.error
  || payload?.data?.message
  || '';

const CustomProfileCompletion = ({ onVisibilityChange }) => {
  const { formatMessage } = useIntl();
  const [progressData, setProgressData] = useState(null);
  const [error, setError] = useState('');

  const fetchProgress = async () => {
    try {
      const { LMS_BASE_URL } = getConfig();
      const client = getAuthenticatedHttpClient();
      const response = await client.get(
        `${LMS_BASE_URL}/profile/progress/?role=student`
      );
      setProgressData(response.data);
      setError('');
    } catch (err) {
      setError(
        getBackendMessage(err?.response?.data) || formatMessage(messages['profile.completion.error']),
      );
    }
  };

  useEffect(() => {
    fetchProgress(); // initial load

    const unsubscribe = onProfileEvent(
      PROFILE_EVENTS.PROGRESS_SHOULD_REFRESH,
      () => {
        fetchProgress();
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    onVisibilityChange(!(progressData?.hidden));
  }, [progressData?.hidden, onVisibilityChange]);

  if (progressData?.hidden) {
    return null;
  }

  return (
    <div className="profile-completion-container custom-profile-soft-card">
      <h2 className="container-header">{formatMessage(messages['profile.completion.title'])}</h2>
      {error && (
        <Alert variant="warning" dismissible={false} show className="mb-3">
          {error}
        </Alert>
      )}
      <div className="d-flex align-items-center profile-completion-progress-wrap">
        <ProgressBar
          now={progressData ? progressData.percentage : 0}
          max={100}
          variant="primary"
          className="flex-grow-1 mr-2 profile-progress"
        />
        <span className="profile-completion-percentage">{progressData ? `${progressData.percentage}%` : '0%'}</span>
      </div>
      <div className="d-flex justify-content-between">
        <p>{formatMessage(messages['profile.completion.message'])}</p>
        <div className="field-count">
          {formatMessage(messages['profile.completion.count'], {
            completed: progressData?.completed || 0,
            total: progressData?.total_required || 0,
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomProfileCompletion;

CustomProfileCompletion.propTypes = {
  onVisibilityChange: PropTypes.func,
};

CustomProfileCompletion.defaultProps = {
  onVisibilityChange: () => {},
};
