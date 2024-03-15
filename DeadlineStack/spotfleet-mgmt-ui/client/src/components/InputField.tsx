import React, { useState } from 'react';
import { Form, Input, Typography } from 'antd';

interface InputFieldProps {
  title: string;
  sentence: string;
  placeholder: string;
  initialValue?: string;
  name: (string | number)[];
}

const InputField: React.FC<InputFieldProps> = ({ title, sentence, placeholder, initialValue, name }) => {
  const [value, setValue] = useState(initialValue || ''); 

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value); 
  };

  return (
    <div>
      <Typography.Title level={5}>{title}</Typography.Title>
      <p>{sentence}</p>
      <Form.Item name={name}>
      <Input placeholder={placeholder} value={value} onChange={handleChange} />
      </Form.Item>
    </div>
  );
};

export default InputField;