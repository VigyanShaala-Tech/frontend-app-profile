import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import get from 'lodash.get';
import { useSelector } from 'react-redux';

import messages from '../Gender.messages';
import customMessages from './CustomGenderMock.messages';
import CustomSearchDropdown from '../custom-components/CustomSearchDropdown';
import CustomFormControls from '../custom-components/CustomFormControls';
import EditableItemHeader from '../elements/EditableItemHeader';
import EmptyContent from '../elements/EmptyContent';
import SwitchContent from '../elements/SwitchContent';
import { GENDER_OPTIONS } from '../../data/constants';
import { useIsVisibilityEnabled } from '../../data/hooks';
import { getGenderMock, upsertGenderMock } from './mockGenderApi';

const CustomGenderMock = ({
  formId,
  openHandler,
  closeHandler,
}) => {
  const { formatMessage } = useIntl();
  const isVisibilityEnabled = useIsVisibilityEnabled();
  const currentlyEditingField = useSelector((state) => state.profilePage.currentlyEditingField);
  const isAuthenticatedUserProfile = useSelector((state) => state.profilePage.isAuthenticatedUserProfile);

  const editMode = useMemo(() => {
    if (!isAuthenticatedUserProfile) {
      return 'static';
    }
    if (currentlyEditingField === formId) {
      return 'editing';
    }
    return 'editable';
  }, [currentlyEditingField, formId, isAuthenticatedUserProfile]);

  const [gender, setGender] = useState('');
  const [visibilityGender, setVisibilityGender] = useState('private');
  const [draftGender, setDraftGender] = useState('');
  const [draftVisibility, setDraftVisibility] = useState('private');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const genderOptions = useMemo(
    () => GENDER_OPTIONS.map((option) => ({
      value: option,
      label: formatMessage(get(
        messages,
        `profile.gender.options.${option}`,
        messages['profile.gender.options.o'],
      )),
    })),
    [formatMessage],
  );

  const genderLabel = draftGender
    ? formatMessage(get(
      messages,
      `profile.gender.options.${draftGender}`,
      messages['profile.gender.options.o'],
    ))
    : '';

  const savedGenderLabel = gender
    ? formatMessage(get(
      messages,
      `profile.gender.options.${gender}`,
      messages['profile.gender.options.o'],
    ))
    : '';

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      const response = await getGenderMock();
      if (!mounted) {
        return;
      }
      setGender(response.gender || '');
      setVisibilityGender(response.visibilityGender || 'private');
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (editMode === 'editing') {
      setDraftGender(gender || '');
      setDraftVisibility(visibilityGender || 'private');
      setErrorMessage('');
      setIsSaving(false);
    }
  }, [editMode, gender, visibilityGender]);

  const handleOpen = useCallback(() => {
    openHandler(formId);
  }, [formId, openHandler]);

  const handleClose = useCallback(() => {
    closeHandler(formId);
    setErrorMessage('');
    setIsSaving(false);
  }, [closeHandler, formId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!draftGender) {
      setErrorMessage(formatMessage(customMessages['profile.custom.gender.validation.required']));
      return;
    }
    setErrorMessage('');
    setIsSaving(true);
    try {
      const response = await upsertGenderMock({
        gender: draftGender,
        visibilityGender: draftVisibility,
      });
      setGender(response.gender || '');
      setVisibilityGender(response.visibilityGender || 'private');
      closeHandler(formId);
    } finally {
      setIsSaving(false);
    }
  };

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
                  {formatMessage(messages['profile.gender.gender'])}
                </p>
                <CustomSearchDropdown
                  id={formId}
                  options={genderOptions}
                  value={draftGender}
                  onChange={setDraftGender}
                  isInvalid={Boolean(errorMessage)}
                />
                {errorMessage && (
                  <Form.Control.Feedback hasIcon={false} type="invalid">
                    {errorMessage}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <CustomFormControls
                visibilityId="visibilityGender"
                saveState={isSaving ? 'pending' : null}
                visibility={draftVisibility}
                cancelHandler={handleClose}
                onVisibilityChange={setDraftVisibility}
              />
              {!genderLabel && (
                <p className="small text-muted mt-2 mb-0">
                  {formatMessage(customMessages['profile.custom.gender.helper.save'])}
                </p>
              )}
            </form>
          </div>
        ),
        editable: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {formatMessage(messages['profile.gender.gender'])}
            </p>
            {savedGenderLabel ? (
              <EditableItemHeader
                content={savedGenderLabel}
                showEditButton
                onClickEdit={handleOpen}
                showVisibility={visibilityGender !== null && isVisibilityEnabled}
                visibility={visibilityGender}
              />
            ) : (
              <EmptyContent onClick={handleOpen}>
                {formatMessage(customMessages['profile.custom.gender.empty'])}
              </EmptyContent>
            )}
          </>
        ),
        empty: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {formatMessage(messages['profile.gender.gender'])}
            </p>
            <EmptyContent onClick={handleOpen}>
              {formatMessage(customMessages['profile.custom.gender.empty'])}
            </EmptyContent>
          </>
        ),
        static: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {formatMessage(messages['profile.gender.gender'])}
            </p>
            <EditableItemHeader content={savedGenderLabel || '-'} />
          </>
        ),
      }}
    />
  );
};

CustomGenderMock.propTypes = {
  formId: PropTypes.string.isRequired,
  openHandler: PropTypes.func.isRequired,
  closeHandler: PropTypes.func.isRequired,
};

export default CustomGenderMock;
