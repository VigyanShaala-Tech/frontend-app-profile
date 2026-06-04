import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button, StatefulButton } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import formControlMessages from '../elements/FormControls.messages';
import visibilityMessages from '../elements/Visibility.messages';
import { useIsVisibilityEnabled } from '../../data/hooks';
import CustomSearchDropdown from './CustomSearchDropdown';

const CustomFormControls = ({
  cancelHandler,
  visibility = 'private',
  visibilityId,
  saveState = null,
  onVisibilityChange,
}) => {
  const { formatMessage } = useIntl();
  const buttonState = saveState === 'error' ? null : saveState;
  const isVisibilityEnabled = useIsVisibilityEnabled();

  const visibilityOptions = useMemo(() => [
    {
      value: 'private',
      label: formatMessage(visibilityMessages['profile.visibility.who.just.me']),
    },
    {
      value: 'all_users',
      label: formatMessage(visibilityMessages['profile.visibility.who.everyone'], {
        siteName: getConfig().SITE_NAME,
      }),
    },
  ], [formatMessage]);

  return (
    <div className="d-flex flex-row-reverse flex-wrap justify-content-end align-items-center">
      {isVisibilityEnabled && (
        <div className="form-group d-flex flex-wrap align-items-center w-100">
          <label className="col-form-label mr-2 mb-2 mb-md-0" htmlFor={visibilityId}>
            {formatMessage(formControlMessages['profile.formcontrols.who.can.see'])}
          </label>
          <div className="w-100">
            <CustomSearchDropdown
              id={visibilityId}
              options={visibilityOptions}
              value={visibility}
              onChange={onVisibilityChange}
            />
          </div>
        </div>
      )}
      <div className="row form-group flex-shrink-0 flex-grow-1 m-0 p-0">
        <div className="pr-2 pl-0 m-0">
          <Button variant="outline-primary" onClick={cancelHandler}>
            {formatMessage(formControlMessages['profile.formcontrols.button.cancel'])}
          </Button>
        </div>
        <div className="p-0 m-0">
          <StatefulButton
            type="submit"
            state={buttonState}
            labels={{
              default: formatMessage(
                formControlMessages['profile.formcontrols.button.save'],
              ),
              pending: formatMessage(
                formControlMessages['profile.formcontrols.button.saving'],
              ),
              complete: formatMessage(
                formControlMessages['profile.formcontrols.button.saved'],
              ),
            }}
            onClick={(e) => {
              if (buttonState === 'pending') {
                e.preventDefault();
              }
            }}
            disabledStates={[]}
          />
        </div>
      </div>
    </div>
  );
};

CustomFormControls.propTypes = {
  saveState: PropTypes.oneOf([null, 'pending', 'complete', 'error']),
  visibility: PropTypes.oneOf(['private', 'all_users']),
  visibilityId: PropTypes.string.isRequired,
  cancelHandler: PropTypes.func.isRequired,
  onVisibilityChange: PropTypes.func.isRequired,
};

export default CustomFormControls;
