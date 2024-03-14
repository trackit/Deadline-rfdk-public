import React from 'react';
import { Form, Input, Switch } from 'antd';
import InputField from './InputField';

interface FormItemProps {
  fieldValue: any;
  fieldPath: (string | number)[];
}

const FormItem: React.FC<FormItemProps> = ({ fieldValue, fieldPath }) => {
  if (typeof fieldValue === 'boolean') {
    return (
      <Form.Item label={fieldPath[fieldPath.length - 1]} name={fieldPath}>
        <Switch />
      </Form.Item>
    );
  } else if (typeof fieldValue === 'object') {
    return (
      <div>
        {Object.entries(fieldValue).map(([fieldName, nestedFieldValue]) => (
          <div key={fieldName}>
            <FormItem fieldValue={nestedFieldValue} fieldPath={[...fieldPath, fieldName]} />
          </div>
        ))}
      </div>
    );
  } else {
    return (
      <Form.Item  name={fieldPath.join('.')}>
        <InputField
        title={`Setup ${fieldPath[fieldPath.length - 1].toString()}`}
        sentence=""
        placeholder={`${fieldPath[fieldPath.length - 1].toString()}`}
        />
      </Form.Item>
    );
  }
};

export default FormItem;