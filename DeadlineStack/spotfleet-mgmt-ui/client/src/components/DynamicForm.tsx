import React, { useState } from 'react';
import { Form, Input, Button, Card, Switch, notification, InputNumber, Typography } from 'antd';
import { DownCircleOutlined, UpCircleOutlined } from '@ant-design/icons';
import { FleetFormProps } from '../interface'
import FormItem from './FormItem';
import InputField from './InputField';
import BooleanSelector from './BooleanSelector';
import DropDownSelector from './DropDownSelector';
import { AllocationStrategyValue, TypeValue } from '../data/ItemsValues';



const DynamicForm = ({ formData, onDataUpdate }: FleetFormProps) => {
  const [expandedFleet, setExpandedFleet] = useState<string | null>(null);
  const [submittedValues, setSubmittedValues] = useState<any>(null);

  const handleFleetSetup = (fleetName: string) => {
    setExpandedFleet(expandedFleet === fleetName ? null : fleetName);
  };

  const onFinish = (values: any) => {

    console.log('values',values)
   //const currentFleetName = Object.keys(values)[0];
    //const newFleetName = values[currentFleetName].FleetName; 
    //const updatedFormData = { ...formData };
    //updatedFormData[newFleetName] = { ...updatedFormData[currentFleetName] };
    //delete updatedFormData[currentFleetName];
    const updatedValues = { ...formData, ...values };
    Object.keys(updatedValues).forEach((fleetName) => {
      if (updatedValues[fleetName].LaunchSpecifications) {
        updatedValues[fleetName].LaunchSpecifications.forEach((specification: any) => {
          if (specification.InstanceType && typeof specification.InstanceType === 'string') {
            
            const instanceTypes = specification.InstanceType.split(' ').map((type: string) => type.trim());
            console.log(instanceTypes)
            delete specification.InstanceType;
            instanceTypes.forEach((instanceType: string) => {
              const newSpecification = { ...specification, InstanceType: instanceType };
              updatedValues[fleetName].LaunchSpecifications.push(newSpecification);
            });
            updatedValues[fleetName].LaunchSpecifications = updatedValues[fleetName].LaunchSpecifications.filter(
              (spec: any) => spec.InstanceType !== undefined
            );
          }
        });
      }
    });
    onDataUpdate(updatedValues);
    setSubmittedValues(updatedValues);
    
};
const handleExport = () => {
  if (submittedValues) {
    const json = JSON.stringify(submittedValues, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'form_data.json';
    document.body.appendChild(link);
    link.click();
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } else {
    notification.error({
      message: 'No form data submitted',
      description: 'Please submit the form data before exporting.',
    });
  }
};

  return (
    <>
      {Object.entries(formData).map(([fleetName, fleet]) => (
        <div key={fleetName} style={{ marginBottom: '20px' }}>
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
           <div key={fleetName} style={{ height: '300px', overflow: 'auto' }}>
          <Form key={fleetName} onFinish={onFinish} initialValues={formData}>
            <InputField
                    title="Setup your fleet"
                    sentence="Edit your fleet name"
                    placeholder="Fleet name" 
                    name={[fleetName, 'FleetName']}

                    />
            {fleet.LaunchSpecifications?.length > 0 ? (
              <>
                {fleet.LaunchSpecifications.map((specification, index) => (
              <div key={index}>
                <FormItem fieldValue={specification} fieldPath={[fleetName, 'LaunchSpecifications', index]}  />
               
              </div>
            ))}
              </>
            ) : fleet.LaunchTemplateConfigs?.length > 0 ? (
              <>
              <Switch />
                {fleet.LaunchTemplateConfigs.map((config, index) => (
                  <div key={index}>
                    <FormItem fieldValue={config} fieldPath={[fleetName, 'LaunchTemplateConfigs', index]}  />
                  </div>
                ))}
              </>
            ) : null}
            <BooleanSelector label="TerminateInstancesWithExpiration" name={[fleetName, 'TerminateInstancesWithExpiration']} />
            <BooleanSelector label="ReplaceUnhealthyInstances" name={[fleetName, 'ReplaceUnhealthyInstances']} />
            <DropDownSelector label="AllocationStrategy" name={[fleetName, 'AllocationStrategy']} items={AllocationStrategyValue} />
            <DropDownSelector label="Type" name={[fleetName, 'Type']} items={TypeValue} />
            <Typography.Title level={5}>Worker maximum capacity</Typography.Title>
            <Form.Item  name={[fleetName, 'TargetCapacity']} initialValue={fleet.TargetCapacity}>
               <InputNumber min={1} max={10} />
            </Form.Item>
            <Form.Item >
                  <Button type="primary" htmlType="submit" >
                    Submit
                  </Button>
                  <Button  onClick={handleExport}>
                    Export
                  </Button>
                </Form.Item>
          </Form>
          </div>
          )}
        </Card>
        </div>
      ))}
    </>
  );
};
export default DynamicForm;