import React, { useState } from 'react';
import { Form, Input, Button, Card, Switch, notification, InputNumber } from 'antd';
import { DownCircleOutlined, UpCircleOutlined } from '@ant-design/icons';
import { FleetFormProps } from '../interface'


const DynamicForm = ({ formData }: FleetFormProps) => {
const [form] = Form.useForm();
  const [expandedFleet, setExpandedFleet] = useState<string | null>(null);

  const handleFleetSetup = (fleetName: string) => {
    setExpandedFleet(expandedFleet === fleetName ? null : fleetName);
  };

  const onFinish = (values: any) => {

    console.log('values',values)
    const currentFleetName = Object.keys(values)[0];
    const newFleetName = values[currentFleetName].FleetName; 
    const updatedFormData = { ...formData };
  
    
    if (currentFleetName !== newFleetName) {
        updatedFormData[newFleetName] = { ...updatedFormData[currentFleetName] };
        delete updatedFormData[currentFleetName];
    }
  
  
    const json = JSON.stringify(values, null, 2);
    console.log(json);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fleets_config.json';
    document.body.appendChild(link);
    link.click();
    
};

  
  const renderFormItem = (fieldValue: any, fieldPath: (string | number)[]) => {
    console.log(`${fieldPath.join('.')} - typeof:`, typeof fieldValue);
    if (typeof fieldValue === 'boolean') {
        return (
            <Form.Item label={fieldPath[fieldPath.length - 1]} name={fieldPath} >
                <Switch />
            </Form.Item>
        );
      }else if (typeof fieldValue === 'object') {
        return (
            <div>
                {Object.entries(fieldValue).map(([fieldName, nestedFieldValue]) => (
                    <div key={fieldName}>
                        {renderFormItem(nestedFieldValue, [...fieldPath, fieldName])}
                    </div>
                ))}
            </div>
        );
    } else {
        return (
            <Form.Item label={fieldPath[fieldPath.length - 1].toString()} name={fieldPath}>
                <Input />
            </Form.Item>
        );
    }
};
  return (
    <>
      {Object.entries(formData).map(([fleetName, fleet]) => (
        <div key={fleetName} style={{ height: '500px', overflowY: 'auto' }}>
        <Card
        key={fleetName}
        hoverable title={fleetName}
        extra = { <Button
            onClick={() => handleFleetSetup(fleetName)}
            icon={expandedFleet === fleetName ? <UpCircleOutlined /> : <DownCircleOutlined />}
          />}
        styles={{ body: { padding: 0, overflow: 'hidden' } }}
        >
        {expandedFleet === fleetName && (
          <Form key={fleetName} onFinish={onFinish} initialValues={formData}>
            <Form.Item label="Fleet Name" name={[fleetName, 'FleetName']}>
              <Input />
            </Form.Item>
            {fleet.LaunchSpecifications.length > 0 ? (
              <>
                {fleet.LaunchSpecifications.map((specification, index) => (
              <div key={index}>
                {renderFormItem(specification, [fleetName, 'LaunchSpecifications', index])}
              </div>
            ))}
              </>
            ) : fleet.LaunchTemplateConfigs.length > 0 ? (
              <>
              <Switch />
                {fleet.LaunchTemplateConfigs.map((config, index) => (
                  <div key={index}>
                    {renderFormItem(config, [fleetName, 'LaunchTemplateConfigs', index])}
                  </div>
                ))}
              </>
            ) : null}
            <Form.Item label="Worker maximum capacity" name={[fleetName, 'TargetCapacity']}>
            <InputNumber min={1} max={10}  />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
                {/* Export button */}
                <Button type="primary" onClick={() => form.submit()}>
                  Export
                </Button>
              </Form.Item>
          </Form>
          )}
        </Card>
        </div>
      ))}
    </>
  );
};
export default DynamicForm;
