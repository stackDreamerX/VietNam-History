import React from 'react';
import Select from 'react-select';

const FormSelectComponent = ({ label, placeholder, options, selectedValue, onChange, isMulti }) => {
  return (
    <div>
      <label>{label}</label>
      <Select
        isMulti={isMulti}
        options={options}
        value={options.filter(option => selectedValue.includes(option.value))}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

export default FormSelectComponent;
