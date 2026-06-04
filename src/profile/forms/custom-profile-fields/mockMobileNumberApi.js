const STORAGE_KEY = 'custom-profile-mobile-number';
const OTP_CODE = '123456';

const wait = (ms = 500) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const parseStoredData = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

const getDefaultResponse = () => ({
  mobileNumber: '',
});

export const getMobileNumberMock = async () => {
  await wait();
  return parseStoredData() || getDefaultResponse();
};

export const sendMobileOtpMock = async () => {
  await wait();
  return { requestId: `mock-otp-${Date.now()}` };
};

export const verifyMobileOtpMock = async ({ otp }) => {
  await wait(350);
  return { verified: otp === OTP_CODE };
};

export const upsertMobileNumberMock = async ({ mobileNumber }) => {
  await wait();
  const payload = {
    mobileNumber,
  };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }
  return payload;
};
