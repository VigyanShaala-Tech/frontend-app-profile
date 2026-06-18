import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useDispatch } from 'react-redux';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import get from 'lodash.get';
import { Form } from '@openedx/paragon';

import messages from '../Gender.messages';
import customMessages from './CustomGenderMock.messages';
import CustomFormControls from '../custom-components/CustomFormControls';
import EditableItemHeader from '../elements/EditableItemHeader';
import EmptyContent from '../elements/EmptyContent';
import SwitchContent from '../elements/SwitchContent';
import { fetchProfile } from '../../data/actions';
import { patchProfile } from '../../data/services';
import { patchGenderVisibilityPreference } from './customPreferencesApi';
import { editableFormSelector } from '../../data/selectors';
import { useCloseOpenHandler, useIsVisibilityEnabled } from '../../data/hooks';

const CUSTOM_GENDER_OPTIONS = ['m', 'f', 'o'];

const getCustomGenderLabelMessage = (value) => {
  if (!value) {
    return null;
  }
  if (value === 'o') {
    return messages['profile.gender.options.p'];
  }
  const message = get(
    messages,
    `profile.gender.options.${value}`,
    null,
  );
  return message;
};

const CustomGender = ({
  formId,
  gender,
  visibilityGender,
  editMode,
  saveState,
  error,
  closeHandler,
  openHandler,
}) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const isVisibilityEnabled = useIsVisibilityEnabled();
  const handleOpen = useCloseOpenHandler(openHandler, formId);
  const handleClose = useCloseOpenHandler(closeHandler, formId);
  const [draftGender, setDraftGender] = useState(gender || '');
  const [draftVisibilityGender, setDraftVisibilityGender] = useState(visibilityGender || 'private');
  const [committedGender, setCommittedGender] = useState(gender || '');
  const [committedVisibilityGender, setCommittedVisibilityGender] = useState(visibilityGender || 'private');
  const [localSaveState, setLocalSaveState] = useState(null);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    setCommittedGender(gender || '');
    setCommittedVisibilityGender(visibilityGender || 'private');
  }, [gender, visibilityGender]);

  useEffect(() => {
    if (editMode === 'editing') {
      setDraftGender(committedGender || '');
      setDraftVisibilityGender(committedVisibilityGender || 'private');
      setLocalSaveState(null);
      setLocalError(null);
    }
  }, [editMode, committedGender, committedVisibilityGender]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalSaveState('pending');
    setLocalError(null);
    try {
      const username = getAuthenticatedUser().username;
      await patchProfile(username, { gender: draftGender || '' });
      if (draftVisibilityGender !== committedVisibilityGender) {
        await patchGenderVisibilityPreference(username, draftVisibilityGender);
      }
      setCommittedGender(draftGender || '');
      setCommittedVisibilityGender(draftVisibilityGender || 'private');
      setLocalSaveState('complete');
      closeHandler(formId);
      dispatch(fetchProfile(username));
    } catch (submitError) {
      setLocalSaveState('error');
      setLocalError(submitError?.processedData?.gender || submitError?.response?.data?.message || error);
    }
  };

  return (
    <SwitchContent
      className="mb-5"
      expression={editMode}
      cases={{
        editing: (
          <div role="dialog" aria-labelledby={`${formId}-label`}>
            <form onSubmit={handleSubmit}>
              <Form.Group controlId={formId} isInvalid={Boolean(localError || error)}>
                <label className="edit-section-header" htmlFor={formId}>
                  {formatMessage(messages['profile.gender.gender'])}
                </label>
                <select
                  data-hj-suppress
                  className="d-inline-block form-control"
                  id={formId}
                  name={formId}
                  value={draftGender}
                  onChange={(event) => setDraftGender(event.target.value)}
                >
                  <option value="">&nbsp;</option>
                  {CUSTOM_GENDER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {formatMessage(getCustomGenderLabelMessage(option))}
                    </option>
                  ))}
                </select>
                {(localError || error) && (
                  <Form.Control.Feedback hasIcon={false}>
                    {localError || error}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <CustomFormControls
                visibilityId="visibilityGender"
                saveState={localSaveState || saveState}
                visibility={draftVisibilityGender}
                cancelHandler={handleClose}
                onVisibilityChange={setDraftVisibilityGender}
              />
            </form>
          </div>
        ),
        editable: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {formatMessage(messages['profile.gender.gender'])}
            </p>
            <EditableItemHeader
              content={getCustomGenderLabelMessage(committedGender)
                ? formatMessage(getCustomGenderLabelMessage(committedGender))
                : '-'}
              showEditButton
              onClickEdit={handleOpen}
              showVisibility={committedVisibilityGender !== null && isVisibilityEnabled}
              visibility={committedVisibilityGender}
            />
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
            <p data-hj-suppress className="h5">
              {getCustomGenderLabelMessage(committedGender)
                ? formatMessage(getCustomGenderLabelMessage(committedGender))
                : '-'}
            </p>
          </>
        ),
      }}
    />
  );
};

CustomGender.propTypes = {
  formId: PropTypes.string.isRequired,
  gender: PropTypes.string,
  visibilityGender: PropTypes.oneOf(['private', 'all_users']),
  editMode: PropTypes.oneOf(['editing', 'editable', 'empty', 'static']),
  saveState: PropTypes.string,
  error: PropTypes.string,
  closeHandler: PropTypes.func.isRequired,
  openHandler: PropTypes.func.isRequired,
};

CustomGender.defaultProps = {
  editMode: 'static',
  saveState: null,
  gender: null,
  visibilityGender: 'private',
  error: null,
};

export default connect(
  editableFormSelector,
  {},
)(CustomGender);
