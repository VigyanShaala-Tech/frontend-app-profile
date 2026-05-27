import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import get from 'lodash.get';
import { Form } from '@openedx/paragon';

import messages from '../Gender.messages';
import FormControls from '../elements/FormControls';
import EditableItemHeader from '../elements/EditableItemHeader';
import EmptyContent from '../elements/EmptyContent';
import SwitchContent from '../elements/SwitchContent';
import { GENDER_OPTIONS } from '../../data/constants';
import { editableFormSelector } from '../../data/selectors';

class CustomGender extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.props.changeHandler(name, value);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.submitHandler(this.props.formId);
  }

  handleClose() {
    this.props.closeHandler(this.props.formId);
  }

  handleOpen() {
    this.props.openHandler(this.props.formId);
  }

  render() {
    const {
      formId, gender, visibilityGender, editMode, saveState, error, intl,
    } = this.props;

    return (
      <SwitchContent
        className="mb-5"
        expression={editMode}
        cases={{
          editing: (
            <div role="dialog" aria-labelledby={`${formId}-label`}>
              <form onSubmit={this.handleSubmit}>
                <Form.Group controlId={formId} isInvalid={error !== null}>
                  <label className="edit-section-header" htmlFor={formId}>
                    {intl.formatMessage(messages['profile.gender.gender'])}
                  </label>
                  <select
                    data-hj-suppress
                    className="d-inline-block form-control"
                    id={formId}
                    name={formId}
                    value={gender || ''}
                    onChange={this.handleChange}
                  >
                    <option value="">&nbsp;</option>
                    {GENDER_OPTIONS.map(option => (
                      <option key={option} value={option}>
                        {intl.formatMessage(get(
                          messages,
                          `profile.gender.options.${option}`,
                          messages['profile.gender.options.o'],
                        ))}
                      </option>
                    ))}
                  </select>
                  {error !== null && (
                    <Form.Control.Feedback hasIcon={false}>
                      {error}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
                <FormControls
                  visibilityId="visibilityGender"
                  saveState={saveState}
                  visibility={visibilityGender}
                  cancelHandler={this.handleClose}
                  changeHandler={this.handleChange}
                />
              </form>
            </div>
          ),
          editable: (
            <>
              <EditableItemHeader
                content={intl.formatMessage(messages['profile.gender.gender'])}
                showEditButton
                onClickEdit={this.handleOpen}
                showVisibility={visibilityGender !== null}
                visibility={visibilityGender}
              />
              <p data-hj-suppress className="h5">
                {intl.formatMessage(get(
                  messages,
                  `profile.gender.options.${gender}`,
                  messages['profile.gender.options.o'],
                ))}
              </p>
            </>
          ),
          empty: (
            <>
              <EditableItemHeader content={intl.formatMessage(messages['profile.gender.gender'])} />
              <EmptyContent onClick={this.handleOpen}>
                <FormattedMessage
                  id="profile.gender.empty"
                  defaultMessage="Add gender"
                  description="instructions when the user doesn't have their gender set"
                />
              </EmptyContent>
            </>
          ),
          static: (
            <>
              <EditableItemHeader content={intl.formatMessage(messages['profile.gender.gender'])} />
              <p data-hj-suppress className="h5">
                {intl.formatMessage(get(
                  messages,
                  `profile.gender.options.${gender}`,
                  messages['profile.gender.options.o'],
                ))}
              </p>
            </>
          ),
        }}
      />
    );
  }
}

CustomGender.propTypes = {
  formId: PropTypes.string.isRequired,
  gender: PropTypes.string,
  visibilityGender: PropTypes.oneOf(['private', 'all_users']),
  editMode: PropTypes.oneOf(['editing', 'editable', 'empty', 'static']),
  saveState: PropTypes.string,
  error: PropTypes.string,
  changeHandler: PropTypes.func.isRequired,
  submitHandler: PropTypes.func.isRequired,
  closeHandler: PropTypes.func.isRequired,
  openHandler: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
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
)(injectIntl(CustomGender));
