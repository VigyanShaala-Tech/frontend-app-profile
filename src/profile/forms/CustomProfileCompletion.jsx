import React from 'react';
import { useEffect, useState } from 'react';
import { ProgressBar } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './CustomProfileCompletion.messages';
import './customProfileComplition.scss';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { onProfileEvent, PROFILE_EVENTS } from '../../utils/profileEvents';

const CustomProfileCompletion = () => {
  const { formatMessage } = useIntl();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchProgress = async () => {
    try {
      setLoading(true);
      const { LMS_BASE_URL } = getConfig();
      const client = getAuthenticatedHttpClient();
      const response = await client.get(
        `${LMS_BASE_URL}/profile/progress/?role=student`
      );
      setProgressData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load progress:', err);
      setError('Could not load profile progress.');
    } finally {
      setLoading(false);
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

  if (progressData?.hidden) {
    return null;
  }
  
  return (
    <div className="profile-completion-container">
      <h2 className='container-header'>{formatMessage(messages['profile.completion.title'])}</h2>
      <div className="d-flex align-items-center">
        <ProgressBar
          now={progressData ? progressData.percentage : 0}
          max={100}
          variant="primary"
          className="flex-grow-1 mr-2 profile-progress"
        />
        <span>{progressData ? `${progressData.percentage}%` : '0%'} </span>
      </div>
      <div className="d-flex justify-content-between">
        <p>{formatMessage(messages['profile.completion.message'])}</p>
        <div className="field-count">{progressData ? `(${progressData.completed}/${progressData.total_required})` : '(0/0)'}</div>
      </div>
    </div>
  );
};

export default CustomProfileCompletion;
