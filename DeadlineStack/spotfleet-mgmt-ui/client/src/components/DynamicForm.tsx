import React, { useState, useEffect } from 'react';
import { Form, Button, notification, InputNumber, Typography, Collapse, Space } from 'antd';
import { FleetFormProps, Fleet, LaunchTemplateConfig, Override } from '../interface';
import { ArrowUpOutlined } from '@ant-design/icons';
import InputField from './InputField';
import BooleanSelector from './BooleanSelector';
import DropDownSelector from './DropDownSelector';
import { AllocationStrategyValue, TypeValue } from '../data/ItemsValues';
import TagSpecifications from './TagSpecifications';
import LaunchTemplateConfigs from './LaunchTemplateConfigs';


const DynamicForm = ({ formData, onDataUpdate }: FleetFormProps) => {
  const [submittedValues, setSubmittedValues] = useState<any>(null);
  const [activeKey, setActiveKey] = useState<string | string[]>([]);
  const [formValues, setFormValues] = useState<Fleet>(formData);
  const [launchTemplateConfig, setLaunchTemplateConfig] = useState<Map<string, LaunchTemplateConfig>>(new Map<string, LaunchTemplateConfig>());

  useEffect(() => {
    setFormValues(formData);
    setSubmittedValues(formData);
  }, [formData]);

  const handlePanelChange = (key: string | string[]) => {
    setActiveKey(key);
  };

  const handleLaunchTemplateConfigChange = (fleetName: string, updatedValue: LaunchTemplateConfig) => {
    setLaunchTemplateConfig(prevState => {
      const newState = new Map<string, LaunchTemplateConfig>(prevState);
      newState.set(fleetName, updatedValue);
      return newState;
    });
  };


  const getLaunchTemplateConfig = (fleetName: string, values: Fleet): LaunchTemplateConfig => {
    const overridesMap: { [key: string]: { InstanceType: string; SubnetIds: string[]; Priorities: number } } = {};
    const LaunchTemplateSpecification = { LaunchTemplateId: '', Version: '' };

    if (!values[fleetName].LaunchTemplateConfigs) return { LaunchTemplateSpecification: { LaunchTemplateId: '', Version: '' }, Overrides: [] };
    values[fleetName].LaunchTemplateConfigs.forEach((config: LaunchTemplateConfig) => {
      LaunchTemplateSpecification.LaunchTemplateId = config.LaunchTemplateSpecification.LaunchTemplateId;
      LaunchTemplateSpecification.Version = config.LaunchTemplateSpecification.Version;
      config.Overrides.forEach((override: Override) => {
        if (!overridesMap[override.InstanceType])
          overridesMap[override.InstanceType] = { InstanceType: override.InstanceType, SubnetIds: [], Priorities: override.Priority };
        if (Array.isArray(override.SubnetId)) {
          override.SubnetId.forEach(subnet => {
            overridesMap[override.InstanceType].SubnetIds.push(subnet);
          });
        } else {
          overridesMap[override.InstanceType].SubnetIds.push(override.SubnetId);
        }
      });
      return config;
    });

    const allOverrides: Override[] = [];
    for (const key in overridesMap) {
      if (!Object.prototype.hasOwnProperty.call(overridesMap, key))
        continue;
      const override = overridesMap[key];
      const newOverride: Override = { InstanceType: override.InstanceType, SubnetId: override.SubnetIds, Priority: override.Priorities };
      allOverrides.push(newOverride);
    }
    return ({ LaunchTemplateSpecification, Overrides: allOverrides });
  };

  const updateLaunchTemplateConfig = (fleetName: string, values: Fleet, updatedLaunchTemplateConfig: LaunchTemplateConfig) => {
    const allTemplateConfigs: LaunchTemplateConfig[] = [];

    updatedLaunchTemplateConfig.Overrides.forEach((override) => {
      if (Array.isArray(override.SubnetId)) {
        override.SubnetId.forEach((subnetId) => {
          const newLaunchTemplateConfig: LaunchTemplateConfig = {
            LaunchTemplateSpecification: updatedLaunchTemplateConfig.LaunchTemplateSpecification,
            Overrides: [{
              InstanceType: override.InstanceType,
              SubnetId: subnetId,
              Priority: override.Priority
            }]
          };
          allTemplateConfigs.push(newLaunchTemplateConfig);
        });
      }
    });
    values[fleetName].LaunchTemplateConfigs = allTemplateConfigs;
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

      const newLaunchTemplateConfig = launchTemplateConfig.get(updatedFleetName);
      if (newLaunchTemplateConfig)
        updateLaunchTemplateConfig(updatedFleetName, updatedValues, newLaunchTemplateConfig);
      if (!updatedValues[updatedFleetName].LaunchSpecifications)
        return;
      updatedValues[updatedFleetName].LaunchSpecifications.forEach((specification: any) => {
        if (!specification.InstanceType && typeof specification.InstanceType === 'string')
          return;
        const instanceTypes = specification.InstanceType.split(' ').map((type: string) => type.trim());
        delete specification.InstanceType;
        instanceTypes.forEach((instanceType: string) => {
          const newSpecification = { ...specification, InstanceType: instanceType };
          updatedValues[updatedFleetName].LaunchSpecifications.push(newSpecification);
        });
        updatedValues[updatedFleetName].LaunchSpecifications = updatedValues[updatedFleetName].LaunchSpecifications.filter(
          (spec: any) => spec.InstanceType !== undefined
        );
      });
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
      link.download = 'fleet_config.json';
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } else {
      notification.error({
        message: 'No form data submitted',
        description: 'Please submit the form data before exporting.',
      });
    }
  };

  const handleAllocationStrategyChange = (fleetName: string, allocationStrategy: string) => {
    setFormValues(prevFormValues => ({
      ...prevFormValues,
      [fleetName]: {
        ...prevFormValues[fleetName],
        AllocationStrategy: allocationStrategy,
      },
    }));
  };

  const renderLaunchTemplateConfig = (fleetName: string, values: Fleet) => {
    const isPrioritized = values[fleetName].AllocationStrategy === 'capacityOptimizedPrioritized';
    const fleetLaunchTemplateConfig = getLaunchTemplateConfig(fleetName, values);

    return (
      <LaunchTemplateConfigs prioritise={isPrioritized} launchTemplateConfig={fleetLaunchTemplateConfig} handleChanges={(value) => { handleLaunchTemplateConfigChange(fleetName, value) }} />
    );
  }

  const collapseItems = Object.entries(formValues).map(([fleetName, fleet], index_collapse) => ({
    key: fleetName,
    label: fleetName,
    children: (
     <div style={{ height: '60vh', overflow: 'scroll', whiteSpace: 'pre-wrap' }}>
       <Form onFinish={onFinish} initialValues={formValues}>
        <InputField
          title="Setup your fleet"
          sentence="Edit your fleet name"
          placeholder="Fleet name"
          initialValue={fleetName}
          name={[fleetName, 'FleetName']}
        />
        {renderLaunchTemplateConfig(fleetName, formValues)}
        <BooleanSelector label="TerminateInstancesWithExpiration" name={[fleetName, 'TerminateInstancesWithExpiration']} />
        <BooleanSelector label="ReplaceUnhealthyInstances" name={[fleetName, 'ReplaceUnhealthyInstances']} />
        <DropDownSelector label="AllocationStrategy" name={[fleetName, 'AllocationStrategy']} items={AllocationStrategyValue} onChange={(value) => handleAllocationStrategyChange(fleetName, value)} />
        <DropDownSelector label="Type" name={[fleetName, 'Type']} items={TypeValue} />
        <Typography.Title level={5}>Worker maximum capacity</Typography.Title>
        <Form.Item name={[fleetName, 'TargetCapacity']} >
          <InputNumber min={1} />
        </Form.Item>
        <TagSpecifications name={[fleetName, 'TagSpecifications']} subItems={['ResourceType', 'Tags']} />
       <Space>
       <Form.Item>
          <Button type="primary" htmlType="submit">Submit</Button>
        </Form.Item>
        <Form.Item>
        <Button  onClick={handleExport}>Export</Button>
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