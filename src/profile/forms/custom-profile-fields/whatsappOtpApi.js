import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const otpApiBase = () => `${getConfig().LMS_BASE_URL}`;

const postJson = async (url, payload) => {
  const response = await getAuthenticatedHttpClient().post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data || {};
};

export const sendWhatsappOtp = async (phoneNumber) => {
  const data = await postJson(`${otpApiBase()}/otp/send/`, {
    contact_identifier: phoneNumber,
  });
  return {
    success: Boolean(data.success),
    verificationKey: data.verification_key || '',
    resendAfterSeconds: Number(data.resend_after_seconds) || 30,
    expiresInSeconds: Number(data.expires_in_seconds) || 300,
    message: data.message || '',
  };
};

export const resendWhatsappOtp = sendWhatsappOtp;

export const verifyWhatsappOtp = async ({ phoneNumber, otpCode, verificationKey }) => {
  const data = await postJson(`${otpApiBase()}/otp/verify/`, {
    contact_identifier: phoneNumber,
    otp_code: otpCode,
    verification_key: verificationKey,
  });

  return {
    success: Boolean(data.success),
    message: data.message || '',
  };
};
