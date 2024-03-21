import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Switch, notification, InputNumber, Typography, Collapse, Space, Affix } from 'antd';
import { ArrowUpOutlined} from '@ant-design/icons';
import { Fleet, FleetFormProps } from '../interface'
import FormItem from './FormItem';
import InputField from './InputField';
import BooleanSelector from './BooleanSelector';
import DropDownSelector from './DropDownSelector';
import { AllocationStrategyValue, TypeValue } from '../data/ItemsValues';
import TagSpecifications from './TagSpecifications';
import { handleExport } from '../utils/fleet';
import LaunchTemplateConfigs from './LaunchTemplateConfigs';



const DynamicForm = ({ formData, onDataUpdate }: FleetFormProps) => {
  const [submittedValues, setSubmittedValues] = useState<any>(null);
  const [activeKey, setActiveKey] = useState<string | string[]>([]);

  const [formValues, setFormValues] = useState<Fleet>(formData);

  useEffect(() => {
    setFormValues(formData);
    setSubmittedValues(formData);
  }, [formData]);
  interface InstanceTypeMap {
    [key: string]: {
        InstanceType: string;
        SubnetIds: string[];
    };
}



  const handlePanelChange = (key: string | string[]) => {
    setActiveKey(key);
  };

  const updateFleetName = (fleetName: string, newFleetName: string, updatedValues: any) => {
    const fleetValues: any = {};

    for (const key in updatedValues) {
      if (!Object.prototype.hasOwnProperty.call(updatedValues, key))
        continue;
      if (key !== fleetName) {
        fleetValues[key] = updatedValues[key];
        continue;
      }
      fleetValues[newFleetName] = updatedValues[key];
    }
    delete fleetValues[newFleetName].FleetName;
    return fleetValues;
  };
  const onFinish = (values: any) => {
    
    let updatedValues = { ...formValues, ...values };
    Object.keys(updatedValues).forEach((fleetName) => {
      let updatedFleetName = fleetName;

      if (updatedValues[fleetName].FleetName) {
        updatedFleetName = updatedValues[updatedFleetName].FleetName;
        updatedValues = updateFleetName(fleetName, updatedValues[fleetName].FleetName, updatedValues);
      }

    });
    
    onDataUpdate(updatedValues);
    setSubmittedValues(updatedValues);
  };
  

const collapseItems = Object.entries(formValues).map(([fleetName, fleet], index_collapse) => ({
    key: fleetName,
    label: fleetName,
    children: (
        <div style={{ maxHeight: '500px', overflow: 'auto' }}>
        <Form onFinish={onFinish} initialValues={formValues}>
        <InputField
          title="Setup your fleet"
          sentence="Edit your fleet name"
          placeholder="Fleet name"
          initialValue={fleetName}
          name={[fleetName, 'FleetName']}
          
        />
        {fleet.LaunchTemplateConfigs?.length > 0 ? (
          <>
           <LaunchTemplateConfigs configs={fleet.LaunchTemplateConfigs} fleetName={fleetName}/>
          </>
        ) : null}
        <BooleanSelector label="TerminateInstancesWithExpiration" name={[fleetName, 'TerminateInstancesWithExpiration']} />
        <BooleanSelector label="ReplaceUnhealthyInstances" name={[fleetName, 'ReplaceUnhealthyInstances']} />
        <DropDownSelector label="AllocationStrategy" name={[fleetName, 'AllocationStrategy']} items={AllocationStrategyValue} />
        <DropDownSelector label="Type" name={[fleetName, 'Type']} items={TypeValue} />
        <Typography.Title level={5}>Worker maximum capacity</Typography.Title>
        <Form.Item name={[fleetName, 'TargetCapacity']} >
          <InputNumber min={0} variant="filled" style={{ width: 120 }}/>
        </Form.Item>
        <Form.Item >
        <TagSpecifications name={[fleetName, 'TagSpecifications']} subItems={['ResourceType', 'Tags']} />
        </Form.Item>
       
       <Space>
        <Form.Item>
            <Button type="primary" htmlType="submit"  >Submit</Button>
        </Form.Item>
        <Form.Item>
            <Button onClick={() => handleExport(submittedValues)} >Export</Button>
        </Form.Item>
       </Space>
      </Form>
      </div>
    ),
  }));

  return (
   
    <Space direction="vertical" size="small" style={{ display: 'flex' }}>
    {collapseItems.map(({ key, label, children }) => (

      <Collapse
        key={key}
        accordion
        activeKey={activeKey}
        onChange={handlePanelChange}
        expandIconPosition='end'
        expandIcon={({ isActive }) => <ArrowUpOutlined rotate={isActive ? 180 : 0} />}
        collapsible="header"
        items={[{ key, label, children }]}
      />
      
    ))}
  </Space>
  );
};
export default DynamicForm;