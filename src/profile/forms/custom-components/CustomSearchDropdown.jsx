import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { faChevronDown, faChevronUp, faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import messages from './CustomSearchDropdown.messages';
import './customSearchDropdown.scss';

const SEARCH_THRESHOLD = 10;
const PANEL_MAX_HEIGHT = 280;
const PANEL_MIN_HEIGHT = 180;
const VIEWPORT_SAFE_GAP = 12;

const resolveOptionValue = (option) => {
  if (typeof option === 'string') {
    return option;
  }
  if (!option || typeof option !== 'object') {
    return '';
  }
  return option.value || option.code || option.id || option.key || option.label || option.name || '';
};

const resolveOptionLabel = (option, fallbackValue) => {
  if (typeof option === 'string') {
    return option;
  }
  if (!option || typeof option !== 'object') {
    return fallbackValue;
  }
  return option.label || option.name || fallbackValue;
};

const CustomSearchDropdown = ({
  id,
  options,
  value,
  onChange,
  placeholder,
  multiple,
  isInvalid,
}) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [openDirection, setOpenDirection] = useState('down');
  const [panelMaxHeight, setPanelMaxHeight] = useState(PANEL_MAX_HEIGHT);
  const [reservedParentSpace, setReservedParentSpace] = useState(0);
  const wrapperRef = useRef(null);
  const normalizedOptions = useMemo(() => options
    .map((option) => {
      const optionValue = resolveOptionValue(option);
      return {
        key: optionValue || JSON.stringify(option),
        value: optionValue,
        label: resolveOptionLabel(option, optionValue),
      };
    })
    .filter((option) => option.value), [options]);
  const hasSearch = normalizedOptions.length > SEARCH_THRESHOLD;

  const normalizedValue = useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }
    return value || '';
  }, [value, multiple]);

  const resolvedPlaceholder = placeholder || (
    multiple
      ? formatMessage(messages['custom.dropdown.multiselect.placeholder'])
      : formatMessage(messages['custom.dropdown.select.placeholder'])
  );

  const filteredOptions = useMemo(() => {
    if (!search.trim()) {
      return normalizedOptions;
    }
    const normalizedSearch = search.trim().toLowerCase();
    return normalizedOptions.filter((option) => option.label.toLowerCase().includes(normalizedSearch));
  }, [search, normalizedOptions]);

  const labelByValue = useMemo(() => normalizedOptions.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {}), [normalizedOptions]);

  const triggerLabel = useMemo(() => {
    if (multiple) {
      if (!normalizedValue.length) return resolvedPlaceholder;
      return normalizedValue.map((selectedValue) => labelByValue[selectedValue] || selectedValue).join(', ');
    }
    return labelByValue[normalizedValue] || normalizedValue || resolvedPlaceholder;
  }, [multiple, normalizedValue, resolvedPlaceholder, labelByValue]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setOpenDirection('down');
      setPanelMaxHeight(PANEL_MAX_HEIGHT);
      setReservedParentSpace(0);
      return undefined;
    }

    const calculatePlacement = () => {
      const triggerElement = wrapperRef.current?.querySelector('.custom-search-dropdown__trigger');
      if (!triggerElement) {
        return;
      }

      const triggerRect = triggerElement.getBoundingClientRect();
      const availableBelow = window.innerHeight - triggerRect.bottom - VIEWPORT_SAFE_GAP;
      const availableAbove = triggerRect.top - VIEWPORT_SAFE_GAP;

      if (availableBelow >= PANEL_MIN_HEIGHT) {
        setOpenDirection('down');
        setPanelMaxHeight(Math.max(PANEL_MIN_HEIGHT, Math.min(PANEL_MAX_HEIGHT, availableBelow)));
        setReservedParentSpace(0);
        return;
      }

      if (availableAbove >= PANEL_MIN_HEIGHT) {
        setOpenDirection('up');
        setPanelMaxHeight(Math.max(PANEL_MIN_HEIGHT, Math.min(PANEL_MAX_HEIGHT, availableAbove)));
        setReservedParentSpace(0);
        return;
      }

      // When both sides are tight, keep dropdown downward and reserve extra layout space.
      setOpenDirection('down');
      setPanelMaxHeight(PANEL_MAX_HEIGHT);
      setReservedParentSpace(Math.max(0, PANEL_MAX_HEIGHT - availableBelow) + 8);
    };

    calculatePlacement();
    window.addEventListener('resize', calculatePlacement);
    window.addEventListener('scroll', calculatePlacement, true);
    return () => {
      window.removeEventListener('resize', calculatePlacement);
      window.removeEventListener('scroll', calculatePlacement, true);
    };
  }, [isOpen]);

  const handleSelect = (option) => {
    if (multiple) {
      const selectedOptions = normalizedValue.includes(option.value)
        ? normalizedValue.filter((selectedOption) => selectedOption !== option.value)
        : [...normalizedValue, option.value];
      onChange(selectedOptions);
      return;
    }
    onChange(option.value);
    setIsOpen(false);
  };

  const removeSelection = (option) => {
    if (!multiple) {
      return;
    }
    onChange(normalizedValue.filter((selectedOption) => selectedOption !== option));
  };

  return (
    <div
      className={`custom-search-dropdown ${isOpen ? 'is-open' : ''}`}
      ref={wrapperRef}
      style={isOpen && openDirection === 'down' && reservedParentSpace > 0
        ? {
          paddingBottom: `${reservedParentSpace}px`,
          marginBottom: `${reservedParentSpace}px`,
        }
        : undefined}
    >
      <button
        id={id}
        type="button"
        className={`custom-search-dropdown__trigger ${isInvalid ? 'is-invalid' : ''} ${(!multiple && normalizedValue) || (multiple && normalizedValue.length) ? 'is-selected' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={`custom-search-dropdown__trigger-text ${!value || (multiple && !normalizedValue.length) ? 'custom-search-dropdown__placeholder' : ''}`}>
          {triggerLabel}
        </span>
        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
      </button>

      {multiple && normalizedValue.length > 0 && (
        <div className="custom-search-dropdown__chips">
          {normalizedValue.map((selectedOption) => (
            <span key={selectedOption} className="custom-search-dropdown__chip">
              {labelByValue[selectedOption] || selectedOption}
              <button
                type="button"
                className="custom-search-dropdown__chip-btn"
                onClick={() => removeSelection(selectedOption)}
                aria-label={selectedOption}
              >
                <FontAwesomeIcon icon={faClose} />
              </button>
            </span>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className={`custom-search-dropdown__panel ${openDirection === 'up' ? 'is-up' : 'is-down'} ${hasSearch ? 'has-search' : ''}`}
          style={{ maxHeight: `${panelMaxHeight}px` }}
        >
          {hasSearch && (
            <div className="custom-search-dropdown__search-wrap">
              <input
                className="custom-search-dropdown__search"
                type="text"
                value={search}
                placeholder={formatMessage(messages['custom.dropdown.search.placeholder'])}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          )}
          <div className="custom-search-dropdown__options">
            {filteredOptions.length === 0 && (
              <p className="custom-search-dropdown__empty">
                {formatMessage(messages['custom.dropdown.no.results'])}
              </p>
            )}
            {filteredOptions.map((option) => {
              const isSelected = multiple
                ? normalizedValue.includes(option.value)
                : normalizedValue === option.value;

              return (
                <button
                  key={option.key}
                  type="button"
                  className={`custom-search-dropdown__option ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  {multiple && (
                    <input type="checkbox" readOnly checked={isSelected} />
                  )}
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

CustomSearchDropdown.propTypes = {
  id: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
      code: PropTypes.string,
      name: PropTypes.string,
      id: PropTypes.string,
      key: PropTypes.string,
    }),
  ])),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  multiple: PropTypes.bool,
  isInvalid: PropTypes.bool,
};

CustomSearchDropdown.defaultProps = {
  options: [],
  value: '',
  placeholder: '',
  multiple: false,
  isInvalid: false,
};

export default CustomSearchDropdown;
