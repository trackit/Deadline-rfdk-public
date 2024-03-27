import React from 'react';
import { Form } from 'antd';
import InputField from './InputField';
import BooleanSelector from './BooleanSelector';

interface FormItemProps {
  fieldValue: any;
  fieldPath: any[];
}

const FormItem: React.FC<FormItemProps> = ({ fieldValue, fieldPath }) => {
  if (typeof fieldValue === 'boolean')
    return (
      <Form.Item name={fieldPath}>
        <BooleanSelector label={fieldPath[fieldPath.length - 1]} name={fieldPath} />
      </Form.Item>
    );
  if (typeof fieldValue === 'object')
    return (
      <div>
        {Object.entries(fieldValue).map(([fieldName, nestedFieldValue]) => (
          <div key={fieldName}>
            <FormItem fieldValue={nestedFieldValue} fieldPath={[...fieldPath, fieldName]} />
          </div>
        ))}
      </div>
    );
  return (
    <InputField
      title={`Setup ${fieldPath[fieldPath.length - 1].toString()}`}
      sentence=""
      placeholder={`Enter a ${fieldPath[fieldPath.length - 1].toString()}`}
      name={fieldPath}
    />
  );
};

export default FormItem;