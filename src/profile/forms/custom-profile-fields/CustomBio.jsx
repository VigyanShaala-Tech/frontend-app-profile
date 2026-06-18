import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import classNames from 'classnames';

import messages from '../Bio.messages';
import customMessages from './CustomBio.messages';
import CustomFormControls from '../custom-components/CustomFormControls';
import EditableItemHeader from '../elements/EditableItemHeader';
import EmptyContent from '../elements/EmptyContent';
import SwitchContent from '../elements/SwitchContent';
import { editableFormSelector } from '../../data/selectors';
import {
  useCloseOpenHandler,
  useHandleChange,
  useHandleSubmit,
  useIsOnMobileScreen,
  useIsVisibilityEnabled,
} from '../../data/hooks';

const CustomBio = ({
  formId,
  bio,
  visibilityBio,
  editMode,
  saveState,
  error,
  titleMessageId,
  defaultTitleMessage,
  changeHandler,
  submitHandler,
  closeHandler,
  openHandler,
}) => {
  const isMobileView = useIsOnMobileScreen();
  const isVisibilityEnabled = useIsVisibilityEnabled();
  const { formatMessage } = useIntl();

  const sectionTitle = titleMessageId
    ? formatMessage({ id: titleMessageId, defaultMessage: defaultTitleMessage })
    : formatMessage(messages['profile.bio.about.me']);

  const handleChange = useHandleChange(changeHandler);
  const handleSubmit = useHandleSubmit(submitHandler, formId);
  const handleOpen = useCloseOpenHandler(openHandler, formId);
  const handleClose = useCloseOpenHandler(closeHandler, formId);

  return (
    <SwitchContent
      className={classNames([
        isMobileView ? 'pt-40px' : 'pt-0',
      ])}
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
                  {sectionTitle}
                </p>
                <textarea
                  className="form-control py-10px"
                  id={formId}
                  name={formId}
                  value={bio}
                  onChange={handleChange}
                />
                {error !== null && (
                  <Form.Control.Feedback hasIcon={false}>
                    {error}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <CustomFormControls
                visibilityId="visibilityBio"
                saveState={saveState}
                visibility={visibilityBio}
                cancelHandler={handleClose}
                onVisibilityChange={(selectedVisibility) => changeHandler('visibilityBio', selectedVisibility)}
              />
            </form>
          </div>
        ),
        editable: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {sectionTitle}
            </p>
            <EditableItemHeader
              content={bio}
              showEditButton
              onClickEdit={handleOpen}
              showVisibility={visibilityBio !== null && isVisibilityEnabled}
              visibility={visibilityBio}
            />
          </>
        ),
        empty: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {sectionTitle}
            </p>
            <EmptyContent onClick={handleOpen}>
              {formatMessage(customMessages['profile.custom.bio.empty'])}
            </EmptyContent>
          </>
        ),
        static: (
          <>
            <p data-hj-suppress className="h5 font-weight-bold m-0 pb-1.5">
              {sectionTitle}
            </p>
            <EditableItemHeader content={bio} />
          </>
        ),
      }}
    />
  );
};

CustomBio.propTypes = {
  formId: PropTypes.string.isRequired,
  bio: PropTypes.string,
  visibilityBio: PropTypes.oneOf(['private', 'all_users']),
  editMode: PropTypes.oneOf(['editing', 'editable', 'empty', 'static']),
  saveState: PropTypes.string,
  error: PropTypes.string,
  titleMessageId: PropTypes.string,
  defaultTitleMessage: PropTypes.string,
  changeHandler: PropTypes.func.isRequired,
  submitHandler: PropTypes.func.isRequired,
  closeHandler: PropTypes.func.isRequired,
  openHandler: PropTypes.func.isRequired,
};

CustomBio.defaultProps = {
  editMode: 'static',
  saveState: null,
  bio: null,
  visibilityBio: 'private',
  error: null,
  titleMessageId: null,
  defaultTitleMessage: 'About me',
};

export default connect(
  editableFormSelector,
  {},
)(CustomBio);
