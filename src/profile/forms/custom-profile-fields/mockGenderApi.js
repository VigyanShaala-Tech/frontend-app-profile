const STORAGE_KEY = 'custom-profile-gender';

const wait = (ms = 350) => new Promise((resolve) => {
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
  gender: '',
  visibilityGender: 'private',
});

export const getGenderMock = async () => {
  await wait();
  return parseStoredData() || getDefaultResponse();
};

export const upsertGenderMock = async ({ gender, visibilityGender }) => {
  await wait();
  const payload = { gender, visibilityGender };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }
  return payload;
};
