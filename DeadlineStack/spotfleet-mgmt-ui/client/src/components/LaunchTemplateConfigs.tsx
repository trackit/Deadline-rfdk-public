import React, { useState } from 'react';
import { LaunchTemplateConfig, LaunchTemplateSpecification, Override } from '../interface';
import { Input, Typography } from 'antd';
import Overrides from './Overrides';

interface Props {
  prioritise: boolean;
  launchTemplateConfig: LaunchTemplateConfig;
  handleChanges: (values: LaunchTemplateConfig) => void;
}

const LaunchTemplateConfigs: React.FC<Props> = ({ prioritise, launchTemplateConfig, handleChanges }) => {
  const [launchTemplateSpecification, setLaunchTemplateSpecification] = useState<LaunchTemplateSpecification>(launchTemplateConfig.LaunchTemplateSpecification);

  const handleLaunchTemplateIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLaunchTemplateSpecification = { ...launchTemplateSpecification, LaunchTemplateId: e.target.value };
    setLaunchTemplateSpecification(newLaunchTemplateSpecification);
    handleChanges({ ...launchTemplateConfig, LaunchTemplateSpecification: newLaunchTemplateSpecification });
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLaunchTemplateSpecification = { ...launchTemplateSpecification, Version: e.target.value };
    setLaunchTemplateSpecification(newLaunchTemplateSpecification);
    handleChanges({ ...launchTemplateConfig, LaunchTemplateSpecification: newLaunchTemplateSpecification });
  };

  const handleOverridesChange = (overrides: any) => {
    const newLaunchTemplateConfig: LaunchTemplateConfig = { ...launchTemplateConfig, Overrides: overrides };
    handleChanges(newLaunchTemplateConfig);
  };

  return (
    <>
      <Typography.Title level={4}>Launch Template Specification</Typography.Title>
      <Typography.Title level={5}>Launch Template Id</Typography.Title>
      <Input variant='filled' value={launchTemplateSpecification.LaunchTemplateId} onChange={handleLaunchTemplateIdChange} />
      <Typography.Title level={5}>Version</Typography.Title>
      <Input variant='filled' value={launchTemplateSpecification.Version} onChange={handleVersionChange} />
      <Typography.Title level={5}>Overrides</Typography.Title>
      <Overrides prioritize={prioritise} overrides={launchTemplateConfig.Overrides} onChange={handleOverridesChange} />
    </>
  );
};

export default LaunchTemplateConfigs;