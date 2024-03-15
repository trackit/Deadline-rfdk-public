import React from 'react';
import { Form,Switch } from 'antd';
import InputField from './InputField';
import FormList from './FormList';
import BooleanSelector from './BooleanSelector';


interface FormItemProps {
  fieldValue: any;
  fieldPath: (string | number)[];
}

const FormItem: React.FC<FormItemProps> = ({ fieldValue, fieldPath }) => {
  console.log(fieldPath)
  if (fieldPath[fieldPath.length - 1] === 'Overrides') {
    return <FormList name={fieldPath} subItems={['InstanceType', 'SubnetId']} />;
  } else if (typeof fieldValue === 'boolean') {
    return (
      <Form.Item name={fieldPath}>
        <BooleanSelector label={fieldPath[fieldPath.length - 1]} name={fieldPath} />
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
      <InputField
        title={`Setup ${fieldPath[fieldPath.length - 1].toString()}`}
        sentence=""
        placeholder={`${fieldPath[fieldPath.length - 1].toString()}`} 
        name ={fieldPath}
      />
    );
  }
};

export default FormItem;