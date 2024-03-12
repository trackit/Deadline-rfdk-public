import React from 'react';
import { Input } from 'antd';
import { InputFieldProps } from '../interface';

const InputField: React.FC<InputFieldProps> = ({ placeholder, value, onChange }) => {
    return (
        <Input
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            style={{ backgroundColor: '#e1e2e3', color: 'white' }}
        />
    );
};

export default InputField;
