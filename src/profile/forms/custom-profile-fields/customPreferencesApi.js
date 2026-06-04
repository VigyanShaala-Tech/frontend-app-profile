import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const patchGenderVisibilityPreference = async (username, visibilityGender) => {
  const payload = {
    account_privacy: 'custom',
    'visibility.gender': visibilityGender,
  };

  const response = await getAuthenticatedHttpClient().patch(
    `${getConfig().LMS_BASE_URL}/api/user/v1/preferences/${username}`,
    payload,
    {
      headers: { 'Content-Type': 'application/merge-patch+json' },
    },
  );

  return response.data || {};
};
