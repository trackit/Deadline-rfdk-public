import React from 'react';
import FormItem from './FormItem';
import { LaunchTemplateConfig } from '../interface';
import { Button, Form, Input } from 'antd';
import FormList from './FormList';
import Overrides from './Overrides';



interface Props {
  configs: LaunchTemplateConfig[];
  fleetName: string;
}

const LaunchTemplateConfigs: React.FC<Props> = ({ configs, fleetName }) => {
  if (!configs || configs.length === 0) {
    return null; 
  }
    
    const launchTemplateId = configs[0]?.LaunchTemplateSpecification?.LaunchTemplateId;
    console.log(launchTemplateId)

  
  const sameLaunchTemplateId = configs.every(config => config.LaunchTemplateSpecification?.LaunchTemplateId === launchTemplateId);

  const groupSubnetsByInstanceType = (configs: LaunchTemplateConfig[]) => {
    const subnetsByInstanceType: { [instanceType: string]: string[] } = {};
    for (const config of configs) {
      if (config.Overrides && config.Overrides.length > 0) {
        for (const override of config.Overrides) {
          const instanceType = override.InstanceType;
          const subnetId = override.SubnetId;
          if (!subnetsByInstanceType[instanceType]) {
            subnetsByInstanceType[instanceType] = [];
          }
          subnetsByInstanceType[instanceType].push(subnetId);
        }
      }
    }
    return subnetsByInstanceType;
  };


  const subnetsByInstanceType = groupSubnetsByInstanceType(configs);
  console.log(subnetsByInstanceType);



  return (
    <>
      {sameLaunchTemplateId && (
        <FormItem fieldValue={configs[0].LaunchTemplateSpecification} fieldPath={[fleetName, 'LaunchTemplateConfigs', 0, 'LaunchTemplateSpecification']} />
      )}
      <Overrides path={[fleetName, 'LaunchTemplateConfigs', 0, 'Overrides']} subnetsByInstanceType={subnetsByInstanceType} />

    </>
  );
  };

export default LaunchTemplateConfigs;
