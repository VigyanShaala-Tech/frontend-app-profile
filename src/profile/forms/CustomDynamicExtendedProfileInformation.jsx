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

// ---------------------------------------------------------------------------
// Eligibility rule evaluation (mirrors server-side _evaluate_rule in Python)
// ---------------------------------------------------------------------------

const ELIGIBILITY_DYNAMIC_TODAY = '__today__';

const isDateString = (v) => /^\d{4}-\d{2}-\d{2}/.test(String(v));

const compareValuesForRule = (a, b) => {
  if (isDateString(a) && isDateString(b)) {
    return new Date(a) - new Date(b);
  }
  const fa = parseFloat(a);
  const fb = parseFloat(b);
  if (!Number.isNaN(fa) && !Number.isNaN(fb)) {
    return fa - fb;
  }
  const sa = String(a).toLowerCase();
  const sb = String(b).toLowerCase();
  // eslint-disable-next-line no-nested-ternary
  return sa < sb ? -1 : sa > sb ? 1 : 0;
};

const resolveExpectedValue = (v) => (v === ELIGIBILITY_DYNAMIC_TODAY
  ? new Date().toISOString().split('T')[0]
  : v);

const evaluateEligibilityRule = (operator, value, expected) => {
  const resolved = Array.isArray(expected)
    ? expected.map(resolveExpectedValue)
    : resolveExpectedValue(expected);
  const valStr = String(value).toLowerCase();

  switch (operator) {
    case 'eq':
      return valStr === String(resolved).toLowerCase();
    case 'ne':
      return valStr !== String(resolved).toLowerCase();
    case 'in': {
      const lst = Array.isArray(resolved) ? resolved : [resolved];
      return lst.map((x) => String(x).toLowerCase()).includes(valStr);
    }
    case 'not_in': {
      const lst = Array.isArray(resolved) ? resolved : [resolved];
      return !lst.map((x) => String(x).toLowerCase()).includes(valStr);
    }
    case 'gte':
      return compareValuesForRule(value, resolved) >= 0;
    case 'lte':
      return compareValuesForRule(value, resolved) <= 0;
    case 'gt':
      return compareValuesForRule(value, resolved) > 0;
    case 'lt':
      return compareValuesForRule(value, resolved) < 0;
    default:
      return true;
  }
};

const isDisplayOnlyField = (field) => field.type === 'file';

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
  const [fileUploadState, setFileUploadState] = useState({});

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
      if (field.readOnly || isDisplayOnlyField(field)) {
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
    // Read-only and display-only (file) fields are never validated (user cannot change them here)
    if (field.readOnly || isDisplayOnlyField(field)) {
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

    // Eligibility rules — only checked when a value is present
    if (value && field.eligibilityRules && field.eligibilityRules.length > 0) {
      for (const rule of field.eligibilityRules) {
        if (!evaluateEligibilityRule(rule.operator, value, rule.expectedValue)) {
          return rule.message;
        }
      }
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
      const errData = error?.response?.data;
      if (errData?.fieldErrors && typeof errData.fieldErrors === 'object') {
        setErrors(errData.fieldErrors);
      }
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

  // Client-side mirror of the server-side checks in file_upload.save_profile_upload — purely
  // for fast feedback; the server re-validates independently and is the actual authority.
  const validateSelectedFile = (field, selectedFile) => {
    const { validation } = field;
    if (!validation) {
      return '';
    }
    if (validation.maxSizeMB && selectedFile.size > validation.maxSizeMB * 1024 * 1024) {
      return formatMessage(
        messages['Extended.Profile.Information.file.validation.too.large'],
        { maxSizeMB: validation.maxSizeMB },
      );
    }
    if (validation.accept) {
      const acceptTokens = String(validation.accept)
        .split(',')
        .map((token) => token.trim().toLowerCase())
        .filter(Boolean);
      const fileName = (selectedFile.name || '').toLowerCase();
      const fileType = (selectedFile.type || '').toLowerCase();
      const matches = acceptTokens.some((token) => (
        token.startsWith('.') ? fileName.endsWith(token) : token === fileType
      ));
      if (!matches) {
        return formatMessage(
          messages['Extended.Profile.Information.file.validation.invalid.type'],
          { accept: validation.accept },
        );
      }
    }
    return '';
  };

  const uploadFile = async (field, selectedFile) => {
    if (!selectedFile) {
      return;
    }
    const validationError = validateSelectedFile(field, selectedFile);
    if (validationError) {
      setFileUploadState((previous) => ({
        ...previous,
        [field.name]: { status: 'error', message: validationError },
      }));
      return;
    }

    setFileUploadState((previous) => ({
      ...previous,
      [field.name]: { status: 'uploading', message: '' },
    }));

    try {
      const { LMS_BASE_URL } = getConfig();
      const client = getAuthenticatedHttpClient();
      const payload = new FormData();
      payload.append('file', selectedFile);
      const { data } = await client.post(`${LMS_BASE_URL}${field.fileApi}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSavedData((previous) => ({
        ...(previous || {}),
        [field.name]: { fileName: data.fileName, fileSize: data.fileSize },
      }));
      setFileUploadState((previous) => ({
        ...previous,
        [field.name]: {
          status: 'success',
          message: getBackendMessage(data) || formatMessage(messages['Extended.Profile.Information.file.upload.success']),
        },
      }));
      emitProfileEvent(PROFILE_EVENTS.PROGRESS_SHOULD_REFRESH);
    } catch (error) {
      setFileUploadState((previous) => ({
        ...previous,
        [field.name]: {
          status: 'error',
          message: getErrorMessage(error) || formatMessage(messages['Extended.Profile.Information.file.upload.error']),
        },
      }));
    }
  };

  // Renders a file-type field's current value as a clickable link to the streaming download
  // endpoint (GET fileApi), or an empty-state message when nothing has been uploaded.
  const renderFileLink = (field, value) => {
    const fileName = value && typeof value === 'object' ? value.fileName : '';
    if (!fileName) {
      return <p className="mb-0 text-dark">{formatMessage(messages['Extended.Profile.Information.file.no.file'])}</p>;
    }
    const { LMS_BASE_URL } = getConfig();
    return (
      <p className="mb-0">
        <a href={`${LMS_BASE_URL}${field.fileApi}`} target="_blank" rel="noopener noreferrer">
          {fileName}
        </a>
      </p>
    );
  };

  const renderFieldValue = (field, value) => {
    const emptyLabel = formatMessage(messages['Extended.Profile.Information.empty.value']);
    // File fields store an upload-metadata object ({fileName, fileSize, uploadId, contentType}),
    // never a display-ready primitive — show just the filename instead of the raw object.
    if (field.type === 'file') {
      return (value && typeof value === 'object' && value.fileName) || emptyLabel;
    }
    if (Array.isArray(value)) {
      return value.join(', ') || emptyLabel;
    }
    // Defensive: no other field type is expected to hand us an object here, but never let one
    // crash the render — React cannot render a plain object as a child.
    if (value && typeof value === 'object') {
      return emptyLabel;
    }
    return value || emptyLabel;
  };

  // Returns the display label for a field, appending * for required editable fields
  const fieldLabel = (field) => {
    const clean = field.label.replace('*', '').trim();
    if (!field.readOnly && field.required) {
      return <>{clean} <span className="text-danger" aria-hidden="true">*</span></>;
    }
    return clean;
  };

  const renderField = (field) => {
    if (!isFieldVisible(field)) {
      return null;
    }
    if (field.type === 'file') {
      const uploadState = fileUploadState[field.name] || {};
      return (
        <Form.Group controlId={field.name} className="mb-4">
          <label htmlFor={field.name} className="d-block font-weight-bold small text-muted">
            {fieldLabel(field)}
          </label>
          {field.helper && <p className="small text-muted mb-2">{field.helper}</p>}
          {renderFileLink(field, savedData?.[field.name])}
          {!field.readOnly && (
            <>
              <Form.Control
                id={field.name}
                type="file"
                className="mt-2"
                accept={field.validation?.accept}
                aria-label={formatMessage(messages['Extended.Profile.Information.file.change.label'])}
                disabled={uploadState.status === 'uploading'}
                onChange={(event) => {
                  const picked = event.target.files?.[0] || null;
                  // Reset so choosing the same filename again still fires onChange next time
                  // eslint-disable-next-line no-param-reassign
                  event.target.value = '';
                  uploadFile(field, picked);
                }}
              />
              {uploadState.status === 'uploading' && (
                <p className="small text-muted mt-1 mb-0">{formatMessage(messages['Extended.Profile.Information.file.uploading'])}</p>
              )}
              {uploadState.status === 'success' && (
                <p className="small text-success mt-1 mb-0">{uploadState.message}</p>
              )}
              {uploadState.status === 'error' && (
                <p className="small text-danger mt-1 mb-0">{uploadState.message}</p>
              )}
            </>
          )}
        </Form.Group>
      );
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
          <label htmlFor={field.name} className="d-block">{fieldLabel(field)}</label>
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
          <label htmlFor={field.name} className="d-block">{fieldLabel(field)}</label>
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
          <label htmlFor={field.name} className="d-block">{fieldLabel(field)}</label>
          {helper && <p className="small text-muted mb-2">{helper}</p>}
          <Form.Control
            as="textarea"
            rows={field.rows || 5}
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
          <label className="d-block">{fieldLabel(field)}</label>
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
          <label className="d-block">{fieldLabel(field)}</label>
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

    const isNumber = field.type === 'number';
    const inputType = field.type === 'email' ? 'email' : (isNumber ? 'number' : field.type);
    return (
      <Form.Group controlId={field.name} className="mb-4" isInvalid={Boolean(error)}>
        <label htmlFor={field.name} className="d-block">{fieldLabel(field)}</label>
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
                    {field.type === 'file' ? (
                      renderFileLink(field, savedData?.[field.name])
                    ) : (
                      <p className="mb-0">{renderFieldValue(field, savedData?.[field.name])}</p>
                    )}
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
