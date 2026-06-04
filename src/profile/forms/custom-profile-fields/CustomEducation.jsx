import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import get from 'lodash.get';
import { Form } from '@openedx/paragon';

import messages from '../Education.messages';
import customMessages from './CustomEducation.messages';
import CustomFormControls from '../custom-components/CustomFormControls';
import EditableItemHeader from '../elements/EditableItemHeader';
import EmptyContent from '../elements/EmptyContent';
import SwitchContent from '../elements/SwitchContent';
import CustomSearchDropdown from '../custom-components/CustomSearchDropdown';
import { EDUCATION_LEVELS } from '../../data/constants';
import { editableFormSelector } from '../../data/selectors';
import {
  useCloseOpenHandler,
  useHandleSubmit,
  useIsVisibilityEnabled,
} from '../../data/hooks';

const CustomEducation = ({
  formId,
  levelOfEducation,
  visibilityLevelOfEducation,
  editMode,
  saveState,
  error,
  changeHandler,
  submitHandler,
  closeHandler,
  openHandler,
}) => {
  const isVisibilityEnabled = useIsVisibilityEnabled();
  const { formatMessage } = useIntl();

  const handleSubmit = useHandleSubmit(submitHandler, formId);
  const handleOpen = useCloseOpenHandler(openHandler, formId);
  const handleClose = useCloseOpenHandler(closeHandler, formId);

  const educationOptions = useMemo(() => EDUCATION_LEVELS.map((level) => ({
    value: level,
    label: formatMessage(get(
      messages,
      `profile.education.levels.${level}`,
      messages['profile.education.levels.o'],
    )),
  })), [formatMessage]);

  const selectedEducationLabel = formatMessage(get(
    messages,
    `profile.education.levels.${levelOfEducation}`,
    messages['profile.education.levels.o'],
  ));

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
                isInvalid={error !== null}
              >
                <p data-hj-suppress className="h5 font-weight-bold m-0 pb-2.5">
                  {formatMessage(messages['profile.education.education'])}
                </p>
                <CustomSearchDropdown
                  id={formId}
                  options={educationOptions}
                  value={levelOfEducation || ''}
                  onChange={(selectedValue) => changeHandler(formId, selectedValue)}
                  isInvalid={error !== null}
                />
                {error !== null && (
                  <Form.Control.Feedback hasIcon={false}>
                    {error}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <CustomFormControls
                visibilityId="visibilityLevelOfEducation"
                saveState={saveState}
                visibility={visibilityLevelOfEducation}
                cancelHandler={handleClose}
                onVisibilityChange={(selectedVisibility) => changeHandler('visibilityLevelOfEducation', selectedVisibility)}
              />
            </form>
          </div>
        ),
        editable: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {formatMessage(messages['profile.education.education'])}
            </p>
            <EditableItemHeader
              content={selectedEducationLabel}
              showEditButton
              onClickEdit={handleOpen}
              showVisibility={visibilityLevelOfEducation !== null && isVisibilityEnabled}
              visibility={visibilityLevelOfEducation}
            />
          </>
        ),
        empty: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {formatMessage(messages['profile.education.education'])}
            </p>
            <EmptyContent onClick={handleOpen}>
              {formatMessage(customMessages['profile.custom.education.empty'])}
            </EmptyContent>
          </>
        ),
        static: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {formatMessage(messages['profile.education.education'])}
            </p>
            <EditableItemHeader content={selectedEducationLabel} />
          </>
        ),
      }}
    />
  );
};

CustomEducation.propTypes = {
  formId: PropTypes.string.isRequired,
  levelOfEducation: PropTypes.string,
  visibilityLevelOfEducation: PropTypes.oneOf(['private', 'all_users']),
  editMode: PropTypes.oneOf(['editing', 'editable', 'empty', 'static']),
  saveState: PropTypes.string,
  error: PropTypes.string,
  changeHandler: PropTypes.func.isRequired,
  submitHandler: PropTypes.func.isRequired,
  closeHandler: PropTypes.func.isRequired,
  openHandler: PropTypes.func.isRequired,
};

CustomEducation.defaultProps = {
  editMode: 'static',
  saveState: null,
  levelOfEducation: null,
  visibilityLevelOfEducation: 'private',
  error: null,
};

export default connect(
  editableFormSelector,
  {},
)(CustomEducation);
