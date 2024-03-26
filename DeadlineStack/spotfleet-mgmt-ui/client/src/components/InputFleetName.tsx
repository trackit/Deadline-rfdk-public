import React, { useState } from 'react';
import { Form, Input, Typography } from 'antd';

interface InputFleetNameProps {
  title?: string;
  sentence?: string;
  placeholder?: string;
  initialValue?: string;
  name: (string | number)[];
}

const InputFleetName: React.FC<InputFleetNameProps> = ({ title, sentence, placeholder, initialValue, name }) => {
  const [value, setValue] = useState(initialValue || ''); 

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value); 
  };

  return (
    <div>
      <Typography.Title level={5}>{title}</Typography.Title>
      <p>{sentence}</p>
      <Form.Item 
      name={name}
      rules={[
        {
          pattern: new RegExp(
            /^[a-zA-Z0-9_-]+$/i
          ),
          message: "Fleet name contained invalid characters. Valid characters are A-Z, a-z, 0-9, - and _"
        }
      ]}
      >
      <Input placeholder={placeholder} variant='filled' value={value} onChange={handleChange} defaultValue={value} />
      </Form.Item>
    </div>
  );
};

export default InputFleetName;