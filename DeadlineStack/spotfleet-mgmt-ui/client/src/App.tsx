import React, { useEffect } from 'react';
import './App.css';
import Structure from './components/Structure';

function App() {
  useEffect(() => {
    document.title = 'DeadLine SFMT';
  }, []);

  return (
    <Structure data={
      {
        "AllocationStrategy": "capacityOptimized",
        "IamFleetRole": "",
        "LaunchSpecifications": [],
        "LaunchTemplateConfigs": [],
        "ReplaceUnhealthyInstances": true,
        "TargetCapacity": 1,
        "TerminateInstancesWithExpiration": true,
        "Type": "maintain",
        "TagSpecifications": [],
        "InstanceInterruptionBehavior": "terminate"
      }
    } />
  );
}
export default App;
