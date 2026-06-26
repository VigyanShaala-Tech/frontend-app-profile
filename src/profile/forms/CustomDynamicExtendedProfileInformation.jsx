import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Form,
  Button,
  StatefulButton,
} from '@openedx/paragon';
import {
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';

import './customDynamicExtendedProfileInformation.scss';
import './custom-style/customGlobalStyle.scss';
import { emitProfileEvent, PROFILE_EVENTS } from '../../utils/profileEvents';
import messages from './CustomDynamicExtendedProfileInformation.messages';
import CustomSearchDropdown from './custom-components/CustomSearchDropdown';

const getBackendMessage = (payload) => payload?.message
  || payload?.detail
  || payload?.error
  || payload?.data?.message
  || '';

const getErrorMessage = (error) => getBackendMessage(error?.response?.data);

const resolveOptionValue = (option) => {
  if (typeof option === 'string') {
    return option;
  }
  if (!option || typeof option !== 'object') {
    return '';
  }
  return option.value || option.code || option.id || option.key || option.label || option.name || '';
};

const CustomExtendedProfileInformation = () => {
  const { formatMessage } = useIntl();
  const [sections, setSections] = useState([]);
  const [hidden, setHidden] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState('');

  useEffect(() => {
    const { LMS_BASE_URL } = getConfig();

    const fetchSections = async () => {
      try {
        const client = getAuthenticatedHttpClient();
        const { data } = await client.get(`${LMS_BASE_URL}/profile/dynamic-form/`);
        setSections(Array.isArray(data.data) ? data.data : []);
        setHidden(Boolean(data.hidden));
        setLoadErrorMessage('');
      } catch (error) {
        setSections([]);
        setLoadErrorMessage(
          getErrorMessage(error) || formatMessage(messages['Extended.Profile.Information.load.error']),
        );
      }
    };

    fetchSections();
  }, [formatMessage]);

  if (hidden) {
    return null;
  }

  return (
    <div className="custom-extended-wrapper">
      <div className="extended-profile-information custom-profile-soft-card">
        <div className="extended-profile-information__heading">
          <h3 className="custom-profile-section-title">
            {formatMessage(messages['Extended.Profile.Information.title'])}
          </h3>
          <p className="custom-profile-section-description">
            {formatMessage(messages['Extended.Profile.Information.description'])}
          </p>
        </div>
        {loadErrorMessage && (
          <Alert variant="danger" dismissible={false} show className="mb-3">
            {loadErrorMessage}
          </Alert>
        )}
        <div className="extended-profile-information__grid">
          {sections.map((section) => (
            <GenericSection key={section.name} config={section} />
          ))}
        </div>
      </div>
    </div>
  );
};

const GenericSection = ({ config }) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(Boolean(config.defaultOpen));
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [savedData, setSavedData] = useState(null);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  // Options loaded dynamically via optionsApi when parent dropdown changes
  const [dynamicOptions, setDynamicOptions] = useState({});

  const fields = useMemo(() => (Array.isArray(config.fields) ? config.fields : []), [config.fields]);
  const hasSavedData = Boolean(savedData) && Object.keys(savedData || {}).length > 0;

  // Section is read-only when no saveApi is provided (all fields are display-only)
  const isReadOnlySection = !config.saveApi;

  useEffect(() => {
    const { LMS_BASE_URL } = getConfig();
    if (!LMS_BASE_URL || !config?.getApi) {
      return undefined;
    }

    let active = true;
    const loadSavedData = async () => {
      try {
        const client = getAuthenticatedHttpClient();
        const { data } = await client.get(`${LMS_BASE_URL}${config.getApi}`);
        if (!active) return;
        setSavedData(Object.keys(data || {}).length ? data : null);
        setStatusMessage({ type: '', message: '' });
      } catch (error) {
        if (!active) return;
        setSavedData(null);
        setStatusMessage({
          type: 'danger',
          message: getErrorMessage(error) || formatMessage(messages['Extended.Profile.Information.section.load.error']),
        });
      }
    };

    loadSavedData();
    return () => { active = false; };
  }, [config?.getApi, formatMessage, isSaving]);

  useEffect(() => {
    const initialData = hasSavedData
      ? mapSavedToFormData(savedData, fields)
      : initializeFormData(fields);
    setFormData(initialData);
  }, [savedData, hasSavedData, fields]);

  const evaluateCondition = (condition) => {
    if (!condition) {
      return true;
    }
    return formData[condition.field] === condition.value;
  };

  const isFieldVisible = (field) => !field.visibleWhen || evaluateCondition(field.visibleWhen);

  const getOptions = (field, parentValue = '') => {
    // Dynamic options loaded via optionsApi take priority
    if (dynamicOptions[field.name] !== undefined) {
      return dynamicOptions[field.name];
    }
    if (Array.isArray(field.options)) {
      return field.options;
    }
    if (parentValue && field.options?.[parentValue]) {
      return field.options[parentValue];
    }
    return [];
  };

  const resetDependents = (fieldName, nextData) => {
    fields
      .filter((field) => field.dependsOn === fieldName)
      .forEach((dependentField) => {
        if (dependentField.type === 'multiselect' || dependentField.type === 'checkbox') {
          nextData[dependentField.name] = [];
        } else if (dependentField.type === 'file') {
          nextData[dependentField.name] = null;
        } else {
          nextData[dependentField.name] = '';
        }
        if (dependentField.customOption && dependentField.customFieldName) {
          nextData[dependentField.customFieldName] = '';
        }
        resetDependents(dependentField.name, nextData);
      });
  };

  const updateFieldValue = (fieldName, value, field, shouldResetDependents = true) => {
    setFormData((previous) => {
      const nextData = {
        ...previous,
        [fieldName]: value,
      };
      if (shouldResetDependents) {
        resetDependents(fieldName, nextData);
      }
      return nextData;
    });

    if (field?.name) {
      setErrors((previous) => ({ ...previous, [field.name]: '' }));
    }
    setStatusMessage({ type: '', message: '' });

    // Reload child dropdown options when a parent field changes (optionsApi cascading)
    if (shouldResetDependents) {
      const dependentCascadeFields = fields.filter(
        (f) => f.dependsOn === fieldName && f.optionsApi && f.fieldId,
      );
      if (dependentCascadeFields.length > 0) {
        const { LMS_BASE_URL } = getConfig();
        const client = getAuthenticatedHttpClient();
        dependentCascadeFields.forEach(async (childField) => {
          let opts = [];
          if (value) {
            try {
              const url = `${LMS_BASE_URL}${childField.optionsApi}?field_id=${childField.fieldId}&parent_value=${encodeURIComponent(String(value))}`;
              const { data } = await client.get(url);
              opts = Array.isArray(data) ? data : [];
            } catch {
              opts = [];
            }
          }
          setDynamicOptions((prev) => ({ ...prev, [childField.name]: opts }));
        });
      }
    }
  };

  const preparePayload = () => {
    const payload = {};
    fields.forEach((field) => {
      // Skip read-only fields — the server enforces this too, but skip here to keep the payload clean
      if (field.readOnly) {
        return;
      }
      const fieldValue = formData[field.name];
      if (field.customOption && fieldValue === 'Others') {
        payload[field.name] = formData[field.customFieldName] || '';
      } else {
        payload[field.name] = fieldValue ?? '';
      }
    });
    return payload;
  };

  const validateField = (field, value) => {
    // Read-only fields are never validated (user cannot change them)
    if (field.readOnly) {
      return '';
    }
    if (!isFieldVisible(field)) {
      return '';
    }

    const isRequired = field.required || (field.requiredWhen && evaluateCondition(field.requiredWhen));
    if (isRequired && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label.replace('*', '').trim()} ${formatMessage(messages['Extended.Profile.Information.required.suffix'])}`;
    }

    if (!field.validation) {
      return '';
    }

    const { validation } = field;
    if (validation.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return formatMessage(messages['Extended.Profile.Information.validation.invalid.email']);
    }
    if (validation.minLength && String(value).length < validation.minLength) {
      return formatMessage(messages['Extended.Profile.Information.validation.min.length'], { minLength: validation.minLength });
    }
    if (validation.maxLength && String(value).length > validation.maxLength) {
      return formatMessage(messages['Extended.Profile.Information.validation.max.length'], { maxLength: validation.maxLength });
    }
    if (validation.min && Number(value) < validation.min) {
      return formatMessage(messages['Extended.Profile.Information.validation.min.value'], { min: validation.min });
    }
    if (validation.max && Number(value) > validation.max) {
      return formatMessage(messages['Extended.Profile.Information.validation.max.value'], { max: validation.max });
    }
    if (validation.pattern && value && !new RegExp(validation.pattern).test(value)) {
      return formatMessage(messages['Extended.Profile.Information.validation.invalid.format']);
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    const nextErrors = {};
    fields.forEach((field) => {
      const validationError = validateField(field, formData[field.name]);
      if (validationError) {
        nextErrors[field.name] = validationError;
      }
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setIsSaving(false);
      return;
    }

    try {
      const { LMS_BASE_URL } = getConfig();
      const client = getAuthenticatedHttpClient();
      const response = await client.post(`${LMS_BASE_URL}${config.saveApi}`, preparePayload());
      setStatusMessage({
        type: 'success',
        message: getBackendMessage(response?.data)
          || formatMessage(messages['Extended.Profile.Information.save.success']),
      });
      setIsEditing(false);
      emitProfileEvent(PROFILE_EVENTS.PROGRESS_SHOULD_REFRESH);
    } catch (error) {
      setStatusMessage({
        type: 'danger',
        message: getErrorMessage(error)
          || formatMessage(messages['Extended.Profile.Information.save.error']),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(mapSavedToFormData(savedData, fields));
    setErrors({});
    setStatusMessage({ type: '', message: '' });
    // Reset dynamic options so field.options (pre-loaded for saved values) takes over
    setDynamicOptions({});
    setIsEditing(false);
  };

  const renderFieldValue = (field, value) => {
    if (Array.isArray(value)) {
      return value.join(', ') || formatMessage(messages['Extended.Profile.Information.empty.value']);
    }
    return value || formatMessage(messages['Extended.Profile.Information.empty.value']);
  };

  const renderField = (field) => {
    if (!isFieldVisible(field)) {
      return null;
    }

    const value = formData[field.name];

    // Read-only field: render as static text even in edit mode
    if (field.readOnly) {
      return (
        <Form.Group controlId={field.name} className="mb-4">
          <label className="d-block font-weight-bold small text-muted">{field.label.replace('*', '').trim()}</label>
          <p className="mb-0 text-dark">{renderFieldValue(field, value)}</p>
        </Form.Group>
      );
    }

    const parentValue = field.dependsOn ? formData[field.dependsOn] : '';
    const options = getOptions(field, parentValue);
    const showCustomInput = field.customOption && value === 'Others' && field.customFieldName;
    const helper = field.helper || '';
    const error = errors[field.name];

    if (field.type === 'select') {
      return (
        <Form.Group controlId={field.name} className="mb-4" isInvalid={Boolean(error)}>
          <label htmlFor={field.name} className="d-block">{field.label}</label>
          {helper && <p className="small text-muted mb-2">{helper}</p>}
          <CustomSearchDropdown
            id={field.name}
            options={options}
            value={value}
            placeholder={field.placeholder || formatMessage(messages['Extended.Profile.Information.select.placeholder'])}
            isInvalid={Boolean(error)}
            onChange={(selectedValue) => updateFieldValue(field.name, selectedValue, field)}
          />
          {showCustomInput && (
            <Form.Control
              className="mt-2"
              value={formData[field.customFieldName] || ''}
              placeholder={formatMessage(messages['Extended.Profile.Information.custom.placeholder'], {
                fieldLabel: field.label.toLowerCase().replace('*', '').trim(),
              })}
              onChange={(event) => updateFieldValue(field.customFieldName, event.target.value, field, false)}
            />
          )}
          {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
        </Form.Group>
      );
    }

    if (field.type === 'multiselect') {
      return (
        <Form.Group controlId={field.name} className="mb-4" isInvalid={Boolean(error)}>
          <label htmlFor={field.name} className="d-block">{field.label}</label>
          {helper && <p className="small text-muted mb-2">{helper}</p>}
          <CustomSearchDropdown
            id={field.name}
            options={options}
            value={Array.isArray(value) ? value : []}
            multiple
            isInvalid={Boolean(error)}
            placeholder={field.placeholder || ''}
            onChange={(selectedValues) => updateFieldValue(field.name, selectedValues, field)}
          />
          {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
        </Form.Group>
      );
    }

    if (field.type === 'textarea') {
      return (
        <Form.Group controlId={field.name} className="mb-4" isInvalid={Boolean(error)}>
          <label htmlFor={field.name} className="d-block">{field.label}</label>
          {helper && <p className="small text-muted mb-2">{helper}</p>}
          <Form.Control
            as="textarea"
            rows={field.rows || 3}
            value={value}
            placeholder={field.placeholder || ''}
            onChange={(event) => updateFieldValue(field.name, event.target.value, field)}
          />
          {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
        </Form.Group>
      );
    }

    if (field.type === 'radio') {
      return (
        <Form.Group controlId={field.name} className="mb-4" isInvalid={Boolean(error)}>
          <label className="d-block">{field.label}</label>
          {helper && <p className="small text-muted mb-2">{helper}</p>}
          <Form.RadioSet
            name={field.name}
            value={value}
            onChange={(event) => updateFieldValue(field.name, event.target.value, field)}
          >
            {options.map((option) => (
              <Form.Radio key={option} value={option}>{option}</Form.Radio>
            ))}
          </Form.RadioSet>
          {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
        </Form.Group>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <Form.Group controlId={field.name} className="mb-4" isInvalid={Boolean(error)}>
          <label className="d-block">{field.label}</label>
          {helper && <p className="small text-muted mb-2">{helper}</p>}
          {options.map((option) => {
            const checkedOptions = Array.isArray(value) ? value : [];
            const isChecked = checkedOptions.includes(option);
            const nextValue = isChecked
              ? checkedOptions.filter((selectedValue) => selectedValue !== option)
              : [...checkedOptions, option];

            return (
              <Form.Checkbox
                key={option}
                value={option}
                checked={isChecked}
                onChange={() => updateFieldValue(field.name, nextValue, field)}
              >
                {option}
              </Form.Checkbox>
            );
          })}
          {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
        </Form.Group>
      );
    }

    if (field.type === 'file') {
      return (
        <Form.Group controlId={field.name} className="mb-4" isInvalid={Boolean(error)}>
          <label htmlFor={field.name} className="d-block">{field.label}</label>
          {helper && <p className="small text-muted mb-2">{helper}</p>}
          <Form.Control
            type="file"
            accept={field.accept}
            onChange={(event) => updateFieldValue(field.name, event.target.files?.[0] || null, field)}
          />
          {value?.name && (
            <p className="small text-muted mt-2 mb-0">
              {formatMessage(messages['Extended.Profile.Information.selected.file'], { fileName: value.name })}
            </p>
          )}
          {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
        </Form.Group>
      );
    }

    const isNumber = field.type === 'number';
    const inputType = field.type === 'email' ? 'email' : (isNumber ? 'number' : field.type);
    return (
      <Form.Group controlId={field.name} className="mb-4" isInvalid={Boolean(error)}>
        <label htmlFor={field.name} className="d-block">{field.label}</label>
        {helper && <p className="small text-muted mb-2">{helper}</p>}
        <Form.Control
          type={inputType}
          value={value}
          placeholder={field.placeholder || ''}
          min={field.validation?.min}
          max={field.validation?.max}
          onChange={(event) => updateFieldValue(field.name, event.target.value, field)}
        />
        {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
      </Form.Group>
    );
  };

  // Determine whether to show the edit form:
  //   - Never for read-only sections
  //   - Show when actively editing OR when there's no saved data yet (first fill)
  const showForm = !isReadOnlySection && (isEditing || !hasSavedData);

  return (
    <div className={`compnent-card-container ${isOpen ? 'open' : ''}`}>
      <button
        type="button"
        className="header d-flex align-items-center justify-content-between p-4"
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <h5 className="mb-0">{config.title}</h5>
        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
      </button>

      {isOpen && (
        <div className="content">
          {statusMessage.message && (
            <Alert variant={statusMessage.type} dismissible={false} show className="m-4 mb-0">
              {statusMessage.message}
            </Alert>
          )}

          {showForm ? (
            <Form onSubmit={handleSubmit} className="p-4">
              <div className="row">
                {fields.map((field) => (
                  <div key={field.name} className="col-md-6 mb-2">
                    {renderField(field)}
                  </div>
                ))}
              </div>
              <div className="d-flex justify-content-end information-form-actions-buttons">
                <Button
                  variant="outline-secondary"
                  onClick={handleCancel}
                  className="information-form-actions-buttons-cancel"
                >
                  {config.cancelText}
                </Button>
                <StatefulButton
                  state={isSaving ? 'pending' : 'default'}
                  labels={{
                    default: config.saveText,
                    pending: formatMessage(messages['Extended.Profile.Information.save.pending']),
                  }}
                  type="submit"
                  className="information-form-actions-buttons-save"
                />
              </div>
            </Form>
          ) : (
            <div className="p-4">
              <div className="row">
                {fields.map((field) => (
                  <div key={field.name} className="col-6 mb-3">
                    <strong>{field.label.replace('*', '').trim()}</strong>
                    <p className="mb-0">
                      {Array.isArray(savedData?.[field.name])
                        ? savedData[field.name].join(', ') || formatMessage(messages['Extended.Profile.Information.empty.value'])
                        : savedData?.[field.name] || formatMessage(messages['Extended.Profile.Information.empty.value'])}
                    </p>
                  </div>
                ))}
              </div>
              {!isReadOnlySection && (
                <div className="mt-4 d-flex justify-content-end information-form-actions-buttons">
                  <Button
                    variant="outline-primary"
                    className="information-form-button-edit"
                    onClick={() => {
                      setStatusMessage({ type: '', message: '' });
                      setIsEditing(true);
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-1 text-primary"
                    >
                      <path
                        d="m14.06 9.02.92.92L5.92 19H5v-.92l9.06-9.06ZM17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83a.996.996 0 0 0 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29Zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75Z"
                        fill="currentColor"
                      />
                    </svg>
                    {config.editText}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const initializeFormData = (fields) => {
  const data = {};
  fields.forEach((field) => {
    if (field.type === 'multiselect' || field.type === 'checkbox') {
      data[field.name] = [];
    } else if (field.type === 'file') {
      data[field.name] = null;
    } else {
      data[field.name] = '';
    }
    if (field.customOption && field.customFieldName) {
      data[field.customFieldName] = '';
    }
  });
  return data;
};

const mapSavedToFormData = (savedData, fields) => {
  const data = initializeFormData(fields);

  fields.forEach((field) => {
    const value = savedData?.[field.name];
    if (field.customOption && field.customFieldName) {
      const options = Array.isArray(field.options) ? field.options : [];
      const optionValues = options.map((option) => resolveOptionValue(option)).filter(Boolean);
      if (value && !optionValues.includes(value)) {
        data[field.name] = 'Others';
        data[field.customFieldName] = value;
      } else {
        data[field.name] = value || '';
      }
      return;
    }

    if (field.type === 'multiselect' || field.type === 'checkbox') {
      data[field.name] = Array.isArray(value) ? value : [];
      return;
    }

    if (field.type === 'file') {
      data[field.name] = null;
      return;
    }

    data[field.name] = value || '';
  });

  return data;
};

GenericSection.propTypes = {
  config: PropTypes.shape({
    title: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.shape({})),
    getApi: PropTypes.string,
    saveApi: PropTypes.string,
    defaultOpen: PropTypes.bool,
    cancelText: PropTypes.string,
    saveText: PropTypes.string,
    editText: PropTypes.string,
  }).isRequired,
};

export default CustomExtendedProfileInformation;
