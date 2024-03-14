import React, { useState } from 'react';
import { Input, Typography } from 'antd';

interface InputFieldProps {
  title: string;
  sentence: string;
  placeholder: string;
  initialValue?: string; // Optional initial value prop
}

const InputField: React.FC<InputFieldProps> = ({ title, sentence, placeholder, initialValue }) => {
  const [value, setValue] = useState(initialValue || ''); // Initialize state with the initial value, if provided

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value); // Update state with the new input value
  };

  return (
    <div>
      <Typography.Title level={5}>{title}</Typography.Title>
      <p>{sentence}</p>
      <Input placeholder={placeholder} value={value} onChange={handleChange} />
    </div>
  );
};

export default InputField;
