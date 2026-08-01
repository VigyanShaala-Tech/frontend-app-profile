import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Form, StatefulButton } from '@openedx/paragon';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

import messages from './CustomMobileNumber.messages';
import formControlMessages from '../elements/FormControls.messages';
import EditableItemHeader from '../elements/EditableItemHeader';
import EmptyContent from '../elements/EmptyContent';
import SwitchContent from '../elements/SwitchContent';
import './customMobileNumber.scss';
import { fetchProfile } from '../../data/actions';
import { patchProfile } from '../../data/services';
import {
  resendWhatsappOtp,
  sendWhatsappOtp,
  verifyWhatsappOtp,
} from './whatsappOtpApi';

const extractPhoneDigits = (value = '') => value.replace(/\D/g, '');
const isValidMobile = (value) => {
  const digits = extractPhoneDigits(value);
  return digits.length >= 10 && digits.length <= 15;
};

const getBackendErrorMessage = (error) => {
  const responseData = error?.response?.data;
  if (!responseData) {
    return '';
  }

  if (typeof responseData === 'string') {
    return responseData;
  }

  if (typeof responseData.message === 'string' && responseData.message.trim()) {
    return responseData.message;
  }

  if (typeof responseData.detail === 'string' && responseData.detail.trim()) {
    return responseData.detail;
  }

  if (typeof responseData.error === 'string' && responseData.error.trim()) {
    return responseData.error;
  }

  if (Array.isArray(responseData.non_field_errors) && responseData.non_field_errors.length > 0) {
    return responseData.non_field_errors[0];
  }

  return '';
};

const CustomMobileNumber = ({
  formId,
  openHandler,
  closeHandler,
}) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const currentlyEditingField = useSelector((state) => state.profilePage.currentlyEditingField);
  const isAuthenticatedUserProfile = useSelector((state) => state.profilePage.isAuthenticatedUserProfile);
  const accountPhoneNumber = useSelector((state) => state.profilePage.account.phoneNumber || '');

  const editMode = useMemo(() => {
    if (!isAuthenticatedUserProfile) {
      return 'static';
    }
    if (currentlyEditingField === formId) {
      return 'editing';
    }
    return 'editable';
  }, [currentlyEditingField, formId, isAuthenticatedUserProfile]);

  const [mobileNumber, setMobileNumber] = useState('');
  const [draftMobileNumber, setDraftMobileNumber] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpForNumber, setOtpForNumber] = useState('');
  const [verificationKey, setVerificationKey] = useState('');
  const [resendInSeconds, setResendInSeconds] = useState(0);
  const [otpExpiresInSeconds, setOtpExpiresInSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMobileNumber(accountPhoneNumber || '');
  }, [accountPhoneNumber]);

  useEffect(() => {
    if (editMode === 'editing') {
      setDraftMobileNumber(mobileNumber || '');
      setOtpValue('');
      setOtpSent(false);
      setOtpForNumber('');
      setVerificationKey('');
      setResendInSeconds(0);
      setOtpExpiresInSeconds(0);
      setErrorMessage('');
      setStatusMessage('');
      setIsSendingOtp(false);
      setIsSaving(false);
    }
  }, [editMode, mobileNumber]);

  useEffect(() => {
    if (resendInSeconds <= 0) {
      return undefined;
    }
    const intervalId = setInterval(() => {
      setResendInSeconds((previous) => Math.max(0, previous - 1));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [resendInSeconds]);

  useEffect(() => {
    if (!otpSent || otpExpiresInSeconds <= 0) {
      return undefined;
    }
    const intervalId = setInterval(() => {
      setOtpExpiresInSeconds((previous) => Math.max(0, previous - 1));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [otpSent, otpExpiresInSeconds]);

  const handleOpen = useCallback(() => {
    openHandler(formId);
  }, [formId, openHandler]);

  const handleClose = useCallback(() => {
    closeHandler(formId);
    setOtpValue('');
    setOtpSent(false);
    setOtpForNumber('');
    setVerificationKey('');
    setResendInSeconds(0);
    setOtpExpiresInSeconds(0);
    setErrorMessage('');
    setStatusMessage('');
  }, [closeHandler, formId]);

  const isOtpExpired = otpSent && otpExpiresInSeconds === 0;

  const sendOtp = async () => {
    if (!isValidMobile(draftMobileNumber)) {
      setErrorMessage(formatMessage(messages['profile.custom.mobile.whatsapp.validation.invalid']));
      return;
    }
    setErrorMessage('');
    setStatusMessage('');
    setIsSendingOtp(true);
    try {
      const apiResponse = otpSent
        ? await resendWhatsappOtp(draftMobileNumber)
        : await sendWhatsappOtp(draftMobileNumber);
      if (!apiResponse.success) {
        setErrorMessage(apiResponse.message || formatMessage(messages['profile.custom.mobile.whatsapp.validation.send.failed']));
        return;
      }
      setOtpSent(true);
      setOtpForNumber(draftMobileNumber);
      setVerificationKey(apiResponse.verificationKey || '');
      setResendInSeconds(apiResponse.resendAfterSeconds || 30);
      setOtpExpiresInSeconds(apiResponse.expiresInSeconds || 300);
      setStatusMessage(apiResponse.message || formatMessage(messages['profile.custom.mobile.whatsapp.status.otp.sent']));
    } catch (error) {
      setErrorMessage(
        getBackendErrorMessage(error)
        || formatMessage(messages['profile.custom.mobile.whatsapp.validation.send.failed']),
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValidMobile(draftMobileNumber)) {
      setErrorMessage(formatMessage(messages['profile.custom.mobile.whatsapp.validation.invalid']));
      return;
    }
    if (!otpSent) {
      setErrorMessage(formatMessage(messages['profile.custom.mobile.whatsapp.validation.send.otp']));
      return;
    }
    if (otpForNumber !== draftMobileNumber) {
      setErrorMessage(formatMessage(messages['profile.custom.mobile.whatsapp.validation.send.otp']));
      return;
    }
    if (isOtpExpired) {
      setErrorMessage(formatMessage(messages['profile.custom.mobile.whatsapp.validation.otp.expired']));
      return;
    }
    if (!otpValue) {
      setErrorMessage(formatMessage(messages['profile.custom.mobile.whatsapp.validation.enter.otp']));
      return;
    }
    setErrorMessage('');
    setStatusMessage('');
    setIsSaving(true);
    try {
      const verification = await verifyWhatsappOtp({
        phoneNumber: draftMobileNumber,
        otpCode: otpValue,
        verificationKey,
      });
      if (!verification.success) {
        setErrorMessage(verification.message || formatMessage(messages['profile.custom.mobile.whatsapp.validation.invalid.otp']));
        return;
      }
      const username = getAuthenticatedUser().username;
      const accountResponse = await patchProfile(username, {
        phoneNumber: draftMobileNumber,
      });
      setMobileNumber(accountResponse.phoneNumber || draftMobileNumber);
      setStatusMessage(formatMessage(messages['profile.custom.mobile.whatsapp.status.saved']));
      closeHandler(formId);
      dispatch(fetchProfile(username));
    } catch (error) {
      setErrorMessage(
        getBackendErrorMessage(error)
        || formatMessage(messages['profile.custom.mobile.whatsapp.validation.invalid.otp']),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const canSendOtp = isValidMobile(draftMobileNumber) && !isSendingOtp && (!otpSent || resendInSeconds === 0);
  const canSave = Boolean(otpValue)
    && otpSent
    && otpForNumber === draftMobileNumber
    && !isOtpExpired
    && !isSaving;

  return (
    <SwitchContent
      className="pt-40px"
      expression={editMode}
      cases={{
        editing: (
          <div role="dialog" aria-labelledby={`${formId}-label`}>
            <form onSubmit={handleSubmit}>
              <Form.Group
                controlId={formId}
                className="m-0 pb-3"
                isInvalid={Boolean(errorMessage)}
              >
                <p data-hj-suppress className="h5 font-weight-bold m-0 pb-2.5">
                  {formatMessage(messages['profile.custom.mobile.whatsapp.label'])}
                </p>
                <PhoneInput
                  defaultCountry="in"
                  value={draftMobileNumber}
                  onChange={(phone) => {
                    setDraftMobileNumber(phone);
                    setOtpSent(false);
                    setOtpValue('');
                    setOtpForNumber('');
                    setVerificationKey('');
                    setResendInSeconds(0);
                  }}
                  className={`custom-whatsapp-phone-input ${errorMessage ? 'is-invalid' : ''}`}
                  inputProps={{
                    id: formId,
                    name: formId,
                    placeholder: formatMessage(messages['profile.custom.mobile.whatsapp.placeholder']),
                  }}
                />
                <p className="small text-muted mt-2 mb-2">
                  {formatMessage(messages['profile.custom.mobile.whatsapp.helper.send.otp'])}
                </p>
                <div className="d-flex flex-wrap align-items-center mt-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm mr-2 mb-2"
                    onClick={sendOtp}
                    disabled={!canSendOtp}
                  >
                    {isSendingOtp
                      ? formatMessage(messages['profile.custom.mobile.whatsapp.button.sending.otp'])
                      : (otpSent && resendInSeconds > 0
                        ? formatMessage(messages['profile.custom.mobile.whatsapp.button.resend.otp.timer'], {
                          seconds: resendInSeconds,
                        })
                        : (otpSent
                          ? formatMessage(messages['profile.custom.mobile.whatsapp.button.resend.otp'])
                          : formatMessage(messages['profile.custom.mobile.whatsapp.button.send.otp'])))}
                  </button>
                </div>

                {otpSent && (
                  <input
                    className="form-control py-10px mt-2"
                    name="mobileOtp"
                    value={otpValue}
                    placeholder={formatMessage(messages['profile.custom.mobile.whatsapp.placeholder.otp'])}
                    onChange={(event) => setOtpValue(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={isOtpExpired}
                  />
                )}

                {statusMessage && (
                  <p className="small text-success mb-0 mt-2">{statusMessage}</p>
                )}
                {errorMessage && (
                  <Form.Control.Feedback hasIcon={false} type="invalid">
                    {errorMessage}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <div className="d-flex justify-content-start">
                <Button variant="outline-primary" onClick={handleClose} className="mr-2">
                  {formatMessage(formControlMessages['profile.formcontrols.button.cancel'])}
                </Button>
                <StatefulButton
                  type="submit"
                  state={isSaving ? 'pending' : 'default'}
                  labels={{
                    default: formatMessage(formControlMessages['profile.formcontrols.button.save']),
                    pending: formatMessage(formControlMessages['profile.formcontrols.button.saving']),
                    complete: formatMessage(formControlMessages['profile.formcontrols.button.saved']),
                  }}
                  disabled={!canSave}
                />
              </div>
              {otpSent && !canSave && (
                <p className="small text-muted mt-2 mb-0">
                  {isOtpExpired
                    ? formatMessage(messages['profile.custom.mobile.whatsapp.helper.otp.expired'])
                    : formatMessage(messages['profile.custom.mobile.whatsapp.helper.enter.otp'])}
                </p>
              )}
            </form>
          </div>
        ),
        editable: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {formatMessage(messages['profile.custom.mobile.whatsapp.label'])}
            </p>
            {mobileNumber ? (
              <EditableItemHeader
                content={mobileNumber}
                showEditButton
                onClickEdit={handleOpen}
              />
            ) : (
              <EmptyContent onClick={handleOpen}>
                {formatMessage(messages['profile.custom.mobile.whatsapp.add'])}
              </EmptyContent>
            )}
          </>
        ),
        empty: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {formatMessage(messages['profile.custom.mobile.whatsapp.label'])}
            </p>
            <EmptyContent onClick={handleOpen}>
              {formatMessage(messages['profile.custom.mobile.whatsapp.add'])}
            </EmptyContent>
          </>
        ),
        static: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {formatMessage(messages['profile.custom.mobile.whatsapp.label'])}
            </p>
            <EditableItemHeader content={mobileNumber || '-'} />
          </>
        ),
      }}
    />
  );
};

CustomMobileNumber.propTypes = {
  formId: PropTypes.string.isRequired,
  openHandler: PropTypes.func.isRequired,
  closeHandler: PropTypes.func.isRequired,
};

export default CustomMobileNumber;
