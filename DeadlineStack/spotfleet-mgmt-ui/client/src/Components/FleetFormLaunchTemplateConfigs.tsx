import React, { useState, useEffect } from 'react';
import Layout, { Content, Header } from 'antd/es/layout/layout';
import Switch from 'antd/es/switch';
import Button from 'antd/es/button';
import { DownCircleOutlined, UpCircleOutlined } from '@ant-design/icons';
import { Flex, InputNumber} from 'antd';
import { saveAs } from 'file-saver';
import { FleetFormProps } from '../interface';
import InputField from './InputField';
import Card from 'antd/es/card/Card';



const FleetFormLaunchTemplateConfigs: React.FC<FleetFormProps> = ({ fleetData, fleetTitle }) => {
    const [fleetName, setFleetName] = useState('');
    const [instanceType, setInstanceType] = useState('');
    const [osInstance, setOsInstance] = useState('Linux');
    const [showFleetSetup, setShowFleetSetup] = useState(false);
    const [isArrowUp, setIsArrowUp] = useState(false);
    const [targetCapacity, setTargetCapacity] = useState<number>(1); 

    const onChangeTargetCapacity = (value: number | null) => {
        if (value !== null) {
            setTargetCapacity(value);
        }
    };
    const handleOsChange = () => {
        setOsInstance(osInstance === 'Linux' ? 'Windows' : 'Linux');
    };
    const handleFleetSetup = () => {
        setShowFleetSetup(!showFleetSetup);
        setIsArrowUp(!showFleetSetup);
    };
    const handleFleetSave = () => {
        console.log("Fleet saved:", { fleetName, osInstance });
        setShowFleetSetup(false);
        setIsArrowUp(false);
    };
    const handleExport = () => {
        generateNewConfigFile();
    };
    const generateNewConfigFile = () => {
        const updatedFleetData = { ...fleetData };
        const fleetDataWithUpdatedKey = { ...updatedFleetData, [fleetName]: updatedFleetData[fleetTitle] };
        delete fleetDataWithUpdatedKey[fleetTitle];
        fleetDataWithUpdatedKey[fleetTitle].TargetCapacity = targetCapacity
        const jsonData = JSON.stringify(fleetDataWithUpdatedKey, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        saveAs(blob, 'new_config.json');
    };
    return (
        <div >
            <Card hoverable title={fleetTitle} 
            extra = { <Button onClick={handleFleetSetup} icon={showFleetSetup ? <UpCircleOutlined /> : <DownCircleOutlined />} />} 
            
            styles={{ body: { padding: 0, overflow: 'hidden' } }}
            >
                
            {showFleetSetup && (
                <Flex vertical >
                    <p style={{ fontSize: '16px', marginBottom: '8px' }}>Edit your fleet</p>
                    <p style={{ fontSize: '12px', marginBottom: '8px' }}>Edit fleet name and instance os</p>

                    <Flex gap="middle">
                        <InputField
                            placeholder='Fleet name'
                            value={fleetName}
                            onChange={(e) => setFleetName(e.target.value)}
                        />
                        <Flex gap="small">
                            <p>Linux</p>
                            <Switch
                                defaultChecked
                                onChange={handleOsChange}
                            />
                            <p>super</p>
                        </Flex>
                    </Flex>
                    <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '16px', marginBottom: '8px' }}>Instance Types</p>
                    <p style={{ fontSize: '12px', marginBottom: '8px' }}>Select desired instance types</p>
                    <InputField
                        value={instanceType}
                        onChange={(e) => setInstanceType(e.target.value)}
                    />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '16px', marginBottom: '8px' }}>Worker maximum capacity</p>
                    <p style={{ fontSize: '12px', marginBottom: '8px' }}>A quota can be applied</p>
                    <InputNumber min={1} max={10} defaultValue={targetCapacity} onChange={onChangeTargetCapacity} />
                    </div>
                    <Flex justify='space-around' >
                    <Button type="primary" htmlType="submit" onClick={handleFleetSave}>Save</Button>
                    <Button type="primary" onClick={handleExport} >Export</Button>
                    </Flex>
                    
                    </Flex>
            )}
            </Card>
        </div>
    );
};

export default FleetFormLaunchTemplateConfigs;