import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';

import messages from '../Country.messages';
import CustomFormControls from '../custom-components/CustomFormControls';
import EditableItemHeader from '../elements/EditableItemHeader';
import EmptyContent from '../elements/EmptyContent';
import SwitchContent from '../elements/SwitchContent';
import CustomSearchDropdown from '../custom-components/CustomSearchDropdown';
import { countrySelector } from '../../data/selectors';
import {
  useCloseOpenHandler,
  useHandleSubmit,
  useIsVisibilityEnabled,
} from '../../data/hooks';

const CustomCountry = ({
  formId,
  country,
  visibilityCountry,
  editMode,
  saveState,
  error,
  translatedCountries,
  countriesCodesList,
  countryMessages,
  labelMessageId,
  defaultLabelMessage,
  changeHandler,
  submitHandler,
  closeHandler,
  openHandler,
}) => {
  const isVisibilityEnabled = useIsVisibilityEnabled();
  const { formatMessage } = useIntl();

  const fieldLabel = labelMessageId
    ? formatMessage({ id: labelMessageId, defaultMessage: defaultLabelMessage })
    : formatMessage(messages['profile.country.label']);

  const handleSubmit = useHandleSubmit(submitHandler, formId);
  const handleOpen = useCloseOpenHandler(openHandler, formId);
  const handleClose = useCloseOpenHandler(closeHandler, formId);

  const availableCountries = useMemo(() => translatedCountries.filter(({ code }) => (
    countriesCodesList.length === 0
      || countriesCodesList.includes(code)
      || code === country
  )), [translatedCountries, countriesCodesList, country]);

  const countryOptions = useMemo(
    () => availableCountries.map(({ code, name }) => ({ value: code, label: name })),
    [availableCountries],
  );

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
                  {fieldLabel}
                </p>
                <CustomSearchDropdown
                  id={formId}
                  options={countryOptions}
                  value={country || ''}
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
                visibilityId="visibilityCountry"
                saveState={saveState}
                visibility={visibilityCountry}
                cancelHandler={handleClose}
                onVisibilityChange={(selectedVisibility) => changeHandler('visibilityCountry', selectedVisibility)}
              />
            </form>
          </div>
        ),
        editable: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {fieldLabel}
            </p>
            <EditableItemHeader
              content={countryMessages[country]}
              showEditButton
              onClickEdit={handleOpen}
              showVisibility={visibilityCountry !== null && isVisibilityEnabled}
              visibility={visibilityCountry}
            />
          </>
        ),
        empty: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {fieldLabel}
            </p>
            <EmptyContent onClick={handleOpen}>
              {formatMessage(messages['profile.country.empty'])}
            </EmptyContent>
          </>
        ),
        static: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {fieldLabel}
            </p>
            <EditableItemHeader content={countryMessages[country]} />
          </>
        ),
      }}
    />
  );
};

CustomCountry.propTypes = {
  formId: PropTypes.string.isRequired,
  country: PropTypes.string,
  visibilityCountry: PropTypes.oneOf(['private', 'all_users']),
  editMode: PropTypes.oneOf(['editing', 'editable', 'empty', 'static']),
  saveState: PropTypes.string,
  error: PropTypes.string,
  translatedCountries: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  countriesCodesList: PropTypes.arrayOf(PropTypes.string).isRequired,
  countryMessages: PropTypes.objectOf(PropTypes.string).isRequired,
  labelMessageId: PropTypes.string,
  defaultLabelMessage: PropTypes.string,
  changeHandler: PropTypes.func.isRequired,
  submitHandler: PropTypes.func.isRequired,
  closeHandler: PropTypes.func.isRequired,
  openHandler: PropTypes.func.isRequired,
};

CustomCountry.defaultProps = {
  editMode: 'static',
  saveState: null,
  country: null,
  visibilityCountry: 'private',
  error: null,
  labelMessageId: null,
  defaultLabelMessage: 'Country',
};

export default connect(
  countrySelector,
  {},
)(CustomCountry);
