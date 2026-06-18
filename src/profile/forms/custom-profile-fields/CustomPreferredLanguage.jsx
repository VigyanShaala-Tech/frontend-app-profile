import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';

import messages from '../PreferredLanguage.messages';
import CustomFormControls from '../custom-components/CustomFormControls';
import EditableItemHeader from '../elements/EditableItemHeader';
import EmptyContent from '../elements/EmptyContent';
import SwitchContent from '../elements/SwitchContent';
import CustomSearchDropdown from '../custom-components/CustomSearchDropdown';
import { preferredLanguageSelector } from '../../data/selectors';
import {
  useCloseOpenHandler,
  useHandleSubmit,
  useIsVisibilityEnabled,
} from '../../data/hooks';

const CustomPreferredLanguage = ({
  formId,
  languageProficiencies,
  visibilityLanguageProficiencies,
  editMode,
  saveState,
  error,
  sortedLanguages,
  languageMessages,
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

  const value = languageProficiencies.length ? languageProficiencies[0].code : '';
  const languageOptions = useMemo(
    () => sortedLanguages.map(({ code, name }) => ({ value: code, label: name })),
    [sortedLanguages],
  );

  const handleFieldChange = (selectedCode) => {
    changeHandler(formId, selectedCode ? [{ code: selectedCode }] : []);
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
                isInvalid={error !== null}
              >
                <p data-hj-suppress className="h5 font-weight-bold m-0 pb-2.5">
                  {formatMessage(messages['profile.preferredlanguage.label'])}
                </p>
                <CustomSearchDropdown
                  id={formId}
                  options={languageOptions}
                  value={value}
                  onChange={handleFieldChange}
                  isInvalid={error !== null}
                />
                {error !== null && (
                  <Form.Control.Feedback hasIcon={false}>
                    {error}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <CustomFormControls
                visibilityId="visibilityLanguageProficiencies"
                saveState={saveState}
                visibility={visibilityLanguageProficiencies}
                cancelHandler={handleClose}
                onVisibilityChange={(selectedVisibility) => changeHandler('visibilityLanguageProficiencies', selectedVisibility)}
              />
            </form>
          </div>
        ),
        editable: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {formatMessage(messages['profile.preferredlanguage.label'])}
            </p>
            <EditableItemHeader
              content={languageMessages[value]}
              showEditButton
              onClickEdit={handleOpen}
              showVisibility={visibilityLanguageProficiencies !== null && isVisibilityEnabled}
              visibility={visibilityLanguageProficiencies}
            />
          </>
        ),
        empty: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {formatMessage(messages['profile.preferredlanguage.label'])}
            </p>
            <EmptyContent onClick={handleOpen}>
              {formatMessage(messages['profile.preferredlanguage.empty'])}
            </EmptyContent>
          </>
        ),
        static: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {formatMessage(messages['profile.preferredlanguage.label'])}
            </p>
            <EditableItemHeader content={languageMessages[value]} />
          </>
        ),
      }}
    />
  );
};

CustomPreferredLanguage.propTypes = {
  formId: PropTypes.string.isRequired,
  languageProficiencies: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string })),
    PropTypes.oneOf(['']),
  ]),
  visibilityLanguageProficiencies: PropTypes.oneOf(['private', 'all_users']),
  editMode: PropTypes.oneOf(['editing', 'editable', 'empty', 'static']),
  saveState: PropTypes.string,
  error: PropTypes.string,
  sortedLanguages: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  languageMessages: PropTypes.objectOf(PropTypes.string).isRequired,
  changeHandler: PropTypes.func.isRequired,
  submitHandler: PropTypes.func.isRequired,
  closeHandler: PropTypes.func.isRequired,
  openHandler: PropTypes.func.isRequired,
};

CustomPreferredLanguage.defaultProps = {
  editMode: 'static',
  saveState: null,
  languageProficiencies: [],
  visibilityLanguageProficiencies: 'private',
  error: null,
};

export default connect(
  preferredLanguageSelector,
  {},
)(CustomPreferredLanguage);
