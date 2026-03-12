import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  StatefulButton,
} from '@openedx/paragon';
import {
  faChevronDown,
  faChevronUp,
  faClose,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import './customDynamicExtendedProfileInformation.scss';
import { emitProfileEvent, PROFILE_EVENTS } from '../../utils/profileEvents';
import messages from './CustomDynamicExtendedProfileInformation.messages';
import { useIntl } from '@edx/frontend-platform/i18n';

const CustomExtendedProfileInformation = () => {
  const { formatMessage } = useIntl();
  const [sections, setSections] = useState([]);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const { LMS_BASE_URL } = getConfig();

    const fetchSections = async () => {
      try {
        const client = getAuthenticatedHttpClient();
        const { data } = await client.get(`${LMS_BASE_URL}/profile/dynamic-form/`);
        setSections(Array.isArray(data.data) ? data.data : []);
        setHidden(data.hidden);
      } catch (err) {
        console.error('Failed to load dynamic form:', err);
        setSections([]);
      }
    };

    fetchSections();
  }, []);
  
  if (hidden) {
    return null;
  }

  return (
    <div className="container-fluid mt-4 mb-4 p-4 extended-profile-information">
      <h3 className="extended-prfile-info-container-title">{formatMessage(messages['Extended.Profile.Information.title'])}</h3>
      <p>{formatMessage(messages['Extended.Profile.Information.description'])}</p>
      <div className="row">
        {sections.map((section, idx) => (
          <div key={idx} className="col-md-6 mb-4">
            <GenericSection config={section} />
          </div>
        ))}
      </div>
    </div>
  );
};

const GenericSection = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [savedData, setSavedData] = useState(null);
  const [multiOpen, setMultiOpen] = useState({});
  const [errors, setErrors] = useState({});

  const hasSavedData = !!savedData;
  const fields = Array.isArray(config.fields) ? config.fields : [];

  useEffect(() => {
    const { LMS_BASE_URL } = getConfig();
    if (!LMS_BASE_URL || !config?.getApi) return;

    const loadSavedData = async () => {
      try {
        const client = getAuthenticatedHttpClient();
        const { data } = await client.get(`${LMS_BASE_URL}${config.getApi}`);
        setSavedData(Object.keys(data || {}).length ? data : null);
      } catch (err) {
        console.error(`Failed to load ${config.getApi}:`, err);
        setSavedData(null);
      }
    };

    loadSavedData();
  }, [config?.getApi, isSaving]);

  useEffect(() => {
    if (hasSavedData) {
      setFormData(savedToForm(savedData, fields));
    } else {
      setFormData(initFormData(fields));
    }
  }, [savedData, fields]);

  const initFormData = (fields) => {
    const data = {};
    fields.forEach((f) => {
      if (f.type === 'multiselect' || f.type === 'checkbox') data[f.name] = [];
      else if (f.type === 'file') data[f.name] = null;
      else data[f.name] = '';
      if (f.customOption) data[f.customFieldName] = '';
    });
    return data;
  };

  const savedToForm = (saved, fields) => {
    const data = initFormData(fields);
    fields.forEach((f) => {
      let val = saved?.[f.name];
      if (f.customOption) {
        const opts = getOptions(f, data[f.dependsOn || '']);
        if (opts && !opts.includes(val) && val) {
          data[f.name] = 'Others';
          data[f.customFieldName] = val;
        } else {
          data[f.name] = val || '';
        }
      } else if (f.type === 'multiselect' || f.type === 'checkbox') {
        data[f.name] = Array.isArray(val) ? val : [];
      } else if (f.type === 'file') {
        data[f.name] = null;
      } else {
        data[f.name] = val || '';
      }
    });
    return data;
  };

  const getOptions = (field, parentValue = '') => {
    if (Array.isArray(field.options)) return field.options;
    if (parentValue && field.options?.[parentValue]) return field.options[parentValue];
    return [];
  };

  const resetDependents = (fieldName, newData) => {
    const dependents = fields.filter((f) => f.dependsOn === fieldName);
    dependents.forEach((d) => {
      newData[d.name] = d.type === 'multiselect' || d.type === 'checkbox' ? [] : (d.type === 'file' ? null : '');
      if (d.customOption) newData[d.customFieldName] = '';
      resetDependents(d.name, newData);
    });
  };

  const toggleAccordion = () => setIsOpen((p) => !p);

  const handleChange = (e, name, field) => {
    let value;
    if (field.type === 'file') {
      value = e.target.files[0] || null;
    } else if (field.type === 'checkbox') {
      value = formData[name] || [];
      if (e.target.checked) {
        value = [...value, e.target.value];
      } else {
        value = value.filter((v) => v !== e.target.value);
      }
    } else if (field.type === 'radio') {
      value = e.target.value;
    } else {
      value = e.target.value;
    }

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      resetDependents(name, newData);
      return newData;
    });
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleMultiSelect = (fieldName, opt) => {
    setFormData((prev) => {
      const arr = prev[fieldName] || [];
      return { ...prev, [fieldName]: arr.includes(opt) ? arr.filter(v => v !== opt) : [...arr, opt] };
    });
  };

  const removeMulti = (fieldName, val) => {
    setFormData(prev => ({ ...prev, [fieldName]: prev[fieldName].filter(v => v !== val) }));
  };

  const toggleMultiDropdown = (fieldName) => setMultiOpen(p => ({ ...p, [fieldName]: !p[fieldName] }));

  const prepareFormData = () => {
  const payload = {};

  fields.forEach((f) => {
    const value = formData[f.name];

    if (f.customOption && value === 'Others') {
      payload[f.name] = formData[f.customFieldName] || '';
    } else {
      // arrays stay arrays, null/undefined → '', scalars stay as-is
      payload[f.name] = value ?? '';
    }
  });

  return payload;
};

  const validateField = (field, value) => {
    if (field.visibleWhen && !evaluateCondition(field.visibleWhen)) return '';

    const isRequired = field.required || (field.requiredWhen && evaluateCondition(field.requiredWhen));
    if (isRequired && (!value || (Array.isArray(value) && !value.length))) {
      return `${field.label.replace('*', '').trim()} is required`;
    }

    if (field.validation) {
      const val = field.validation;
      if (val.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Invalid email';
      }
      if (val.minLength && String(value).length < val.minLength) {
        return `Minimum length ${val.minLength}`;
      }
      if (val.maxLength && String(value).length > val.maxLength) {
        return `Maximum length ${val.maxLength}`;
      }
      if (val.min && Number(value) < val.min) return `Minimum value ${val.min}`;
      if (val.max && Number(value) > val.max) return `Maximum value ${val.max}`;
      if (val.pattern && value && !new RegExp(val.pattern).test(value)) {
        return 'Invalid format';
      }
    }
    return '';
  };

  const evaluateCondition = (cond) => {
    if (!cond) return true;
    return formData[cond.field] === cond.value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const newErrors = {};
    fields.forEach((f) => {
      const err = validateField(f, formData[f.name]);
      if (err) newErrors[f.name] = err;
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setIsSaving(false);
      return;
    }

    try {
      const { LMS_BASE_URL } = getConfig();
      const client = getAuthenticatedHttpClient();

      await client.post(`${LMS_BASE_URL}${config.saveApi}`, prepareFormData());

      // Notify other components that profile data changed → progress should refresh
      emitProfileEvent(PROFILE_EVENTS.PROGRESS_SHOULD_REFRESH);

      // setSavedData({ ...formData });
      setIsEditing(false);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(savedToForm(savedData, fields));
    setIsEditing(false);
    setErrors({});
  };

  const handleEdit = () => setIsEditing(true);

  const isFieldVisible = (field) => !field.visibleWhen || evaluateCondition(field.visibleWhen);

  const renderField = (field) => {
    if (!isFieldVisible(field)) return null;

    const value = formData[field.name];
    const parentVal = field.dependsOn ? formData[field.dependsOn] : '';
    const options = getOptions(field, parentVal);
    const showCustom = field.customOption && value === 'Others';
    const helper = field.helper || '';
    const error = errors[field.name];

    const commonProps = {
      isInvalid: !!error,
    };

    switch (field.type) {
      case 'select':
        return (
          <Form.Group controlId={field.name} className="mb-4" {...commonProps}>
            <label htmlFor={field.name} className="d-block">{field.label}</label>
            {helper && <p className="small text-muted mb-2">{helper}</p>}
            <Form.Control
              as="select"
              value={value}
              onChange={e => handleChange(e, field.name, field)}
            >
              <option value="">{field.placeholder || 'Select'}</option>
              {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </Form.Control>
            {showCustom && (
              <Form.Control
                className="mt-2"
                placeholder={`Enter custom ${field.label.toLowerCase().replace('*', '').trim()}`}
                value={formData[field.customFieldName] || ''}
                onChange={e => handleChange(e, field.customFieldName, field)}
              />
            )}
            {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
          </Form.Group>
        );

      case 'text': case 'tel': case 'email': case 'number': case 'date':
        return (
          <Form.Group controlId={field.name} className="mb-4" {...commonProps}>
            <label htmlFor={field.name} className="d-block">{field.label}</label>
            {helper && <p className="small text-muted mb-2">{helper}</p>}
            <Form.Control
              type={field.type === 'email' ? 'email' : (field.type === 'number' ? 'number' : field.type)}
              placeholder={field.placeholder || ''}
              value={value}
              onChange={e => handleChange(e, field.name, field)}
              min={field.validation?.min}
              max={field.validation?.max}
            />
            {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
          </Form.Group>
        );

      case 'textarea':
        return (
          <Form.Group controlId={field.name} className="mb-4" {...commonProps}>
            <label htmlFor={field.name} className="d-block">{field.label}</label>
            {helper && <p className="small text-muted mb-2">{helper}</p>}
            <Form.Control
              as="textarea"
              rows={field.rows || 3}
              placeholder={field.placeholder || ''}
              value={value}
              onChange={e => handleChange(e, field.name, field)}
            />
            {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
          </Form.Group>
        );

      case 'multiselect':
        return (
          <Form.Group controlId={field.name} className="mb-4" {...commonProps}>
            <label htmlFor={field.name} className="d-block">{field.label}</label>
            {helper && <p className="small text-muted mb-2">{helper}</p>}
            <div className="d-flex flex-wrap gap-3 mb-3">
              {(value || []).map(val => (
                <span key={val} className="badge bg-primary text-white d-flex align-items-center m-1">
                  {val}
                  <Button variant="white" size="sm" className="p-0 ms-1 text-white m-1" onClick={() => removeMulti(field.name, val)}>
                    <FontAwesomeIcon icon={faClose} className="text-white" />
                  </Button>
                </span>
              ))}
            </div>
            <div className="position-relative multi-select-container">
              <div
                className="form-control d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => toggleMultiDropdown(field.name)}
              >
                <span className={value?.length ? 'multi-select-text' : 'text-muted '}>
                  {value?.length ? value.join(', ') : (field.placeholder || 'Select options')}
                </span>
                <FontAwesomeIcon icon={multiOpen[field.name] ? faChevronUp : faChevronDown} className="multi-select-bold-icon" />
              </div>
              {multiOpen[field.name] && (
                <div className="multi-select-dropdown shadow-sm">
                  {options.map(opt => (
                    <div
                      key={opt}
                      className="dropdown-item d-flex align-items-center"
                      onClick={() => handleMultiSelect(field.name, opt)}
                    >
                      <input type="checkbox" checked={value.includes(opt)} readOnly className="me-2 mr-2" />
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
          </Form.Group>
        );

      case 'radio':
        return (
          <Form.Group controlId={field.name} className="mb-4" {...commonProps}>
            <label className="d-block">{field.label}</label>
            {helper && <p className="small text-muted mb-2">{helper}</p>}
            <Form.RadioSet
              name={field.name}
              onChange={e => handleChange(e, field.name, field)}
              value={value}
            >
              {options.map(opt => (
                <Form.Radio key={opt} value={opt}>{opt}</Form.Radio>
              ))}
            </Form.RadioSet>
            {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
          </Form.Group>
        );

      case 'checkbox':
        return (
          <Form.Group controlId={field.name} className="mb-4" {...commonProps}>
            <label className="d-block">{field.label}</label>
            {helper && <p className="small text-muted mb-2">{helper}</p>}
            {options.map(opt => (
              <Form.Checkbox
                key={opt}
                value={opt}
                checked={(value || []).includes(opt)}
                onChange={e => handleChange(e, field.name, field)}
              >
                {opt}
              </Form.Checkbox>
            ))}
            {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
          </Form.Group>
        );

      case 'file':
        return (
          <Form.Group controlId={field.name} className="mb-4" {...commonProps}>
            <label htmlFor={field.name} className="d-block">{field.label}</label>
            {helper && <p className="small text-muted mb-2">{helper}</p>}
            <Form.Control
              type="file"
              accept={field.accept}
              onChange={e => handleChange(e, field.name, field)}
            />
            {value && <p className="mt-2">Selected: {value.name}</p>}
            {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
          </Form.Group>
        );

      default: return null;
    }
  };

  const renderForm = () => (
    <Form onSubmit={handleSubmit} className="p-4">
      <div className="row">
        {fields.map((f, i) => (
          <div key={i} className="col-md-6 mb-4">
            {renderField(f)}
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-end information-form-actions-buttons">
        <Button variant="outline-secondary" onClick={handleCancel} className="information-form-actions-buttons-cancel">
          {config.cancelText}
        </Button>
        <StatefulButton
          state={isSaving ? 'pending' : 'default'}
          labels={{ default: config.saveText, pending: 'Saving...' }}
          type="submit"
          className="information-form-actions-buttons-save"
        />
      </div>
    </Form>
  );

  const renderDisplayMode = () => (
    <div className="p-4">
      <div className="row">
        {fields.map((f, i) => (
          <div key={i} className="col-6 mb-3">
            <strong>{f.label.replace('*', '').trim()}</strong>
            <p className="mb-0">
              {Array.isArray(savedData?.[f.name])
                ? savedData[f.name].join(', ') || '-'
                : (f.type === 'file' ? savedData?.[f.name] || '-' : savedData?.[f.name] || '-')}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 d-flex justify-content-end information-form-actions-buttons">
        <Button variant="outline-primary" className="information-form-button-edit" onClick={handleEdit}>
          {config.editText}
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`compnent-card-container ${isOpen ? 'open' : ''}`}>
      <div className="header d-flex align-items-center justify-content-between p-4" onClick={toggleAccordion}>
        <h5 className="mb-0">{config.title}</h5>
        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
      </div>
      {isOpen && (
        <div className="content">
          {isEditing || !hasSavedData ? renderForm() : renderDisplayMode()}
        </div>
      )}
    </div>
  );
};

export default CustomExtendedProfileInformation;