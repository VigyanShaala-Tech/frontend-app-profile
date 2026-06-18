import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink, OverlayTrigger, Tooltip } from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';

import messages from '../Name.messages';
import CustomFormControls from '../custom-components/CustomFormControls';
import EditableItemHeader from '../elements/EditableItemHeader';
import EmptyContent from '../elements/EmptyContent';
import SwitchContent from '../elements/SwitchContent';
import { editableFormSelector } from '../../data/selectors';
import {
  useCloseOpenHandler,
  useHandleSubmit,
  useIsVisibilityEnabled,
} from '../../data/hooks';

const NameHeader = ({ formatMessage }) => (
  <div className="row m-0 pb-1.5 align-items-center">
    <p data-hj-suppress className="h5 font-weight-bold m-0">
      {formatMessage(messages['profile.name.full.name'])}
    </p>
    <OverlayTrigger
      key="top"
      placement="top"
      overlay={(
        <Tooltip variant="light" id="tooltip-top">
          <p className="h5 font-weight-normal m-0 p-0">
            {formatMessage(messages['profile.name.tooltip'])}
          </p>
        </Tooltip>
      )}
    >
      <InfoOutline className="m-0 info-icon" />
    </OverlayTrigger>
  </div>
);

NameHeader.propTypes = {
  formatMessage: PropTypes.func.isRequired,
};

const CustomName = ({
  formId,
  name,
  visibilityName,
  editMode,
  saveState,
  changeHandler,
  submitHandler,
  closeHandler,
  openHandler,
  accountSettingsUrl,
}) => {
  const isVisibilityEnabled = useIsVisibilityEnabled();
  const { formatMessage } = useIntl();

  const handleSubmit = useHandleSubmit(submitHandler, formId);
  const handleOpen = useCloseOpenHandler(openHandler, formId);
  const handleClose = useCloseOpenHandler(closeHandler, formId);

  return (
    <SwitchContent
      className="pt-40px"
      expression={editMode}
      cases={{
        editing: (
          <div role="dialog" aria-labelledby={`${formId}-label`}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <NameHeader formatMessage={formatMessage} />
                <EditableItemHeader content={name} />
                <h4 className="font-weight-normal">
                  <Hyperlink destination={accountSettingsUrl} target="_blank">
                    {formatMessage(messages['profile.name.redirect'])}
                  </Hyperlink>
                </h4>
              </div>
              <CustomFormControls
                visibilityId="visibilityName"
                saveState={saveState}
                visibility={visibilityName}
                cancelHandler={handleClose}
                onVisibilityChange={(selectedVisibility) => changeHandler('visibilityName', selectedVisibility)}
              />
            </form>
          </div>
        ),
        editable: (
          <>
            <NameHeader formatMessage={formatMessage} />
            <EditableItemHeader
              content={name}
              showEditButton
              onClickEdit={handleOpen}
              showVisibility={visibilityName !== null && isVisibilityEnabled}
              visibility={visibilityName}
            />
          </>
        ),
        empty: (
          <>
            <NameHeader formatMessage={formatMessage} />
            <EmptyContent onClick={handleOpen}>
              {formatMessage(messages['profile.name.empty'])}
            </EmptyContent>
          </>
        ),
        static: (
          <>
            <NameHeader formatMessage={formatMessage} />
            <EditableItemHeader content={name} />
          </>
        ),
      }}
    />
  );
};

CustomName.propTypes = {
  formId: PropTypes.string.isRequired,
  name: PropTypes.string,
  visibilityName: PropTypes.oneOf(['private', 'all_users']),
  editMode: PropTypes.oneOf(['editing', 'editable', 'empty', 'static']),
  saveState: PropTypes.string,
  changeHandler: PropTypes.func.isRequired,
  submitHandler: PropTypes.func.isRequired,
  closeHandler: PropTypes.func.isRequired,
  openHandler: PropTypes.func.isRequired,
  accountSettingsUrl: PropTypes.string.isRequired,
};

CustomName.defaultProps = {
  editMode: 'static',
  saveState: null,
  name: null,
  visibilityName: 'private',
};

export default connect(
  editableFormSelector,
  {},
)(CustomName);
