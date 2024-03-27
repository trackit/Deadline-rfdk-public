import React, { useState } from 'react';
import { Typography, Row, Col, Space } from 'antd';
import JsonPreviewCard from './JsonPreviewCard';
import logo from '../assets/trackit_logo.png';
import DynamicForm from './DynamicForm';
import { Fleet } from '../interface';
const { Title } = Typography;

interface StructureProps {
    data: Record<string, any>;
}

const Structure: React.FC<StructureProps> = ({ data }) => {
    const [jsonData, setData] = useState(data);

    const updateData = (updatedData: Record<string, any>) => {
        setData(updatedData);
    };
    const getDefaultFleet = (): Fleet[string] => ({
        AllocationStrategy: '',
        IamFleetRole: '',
        LaunchSpecifications: [],
        LaunchTemplateConfigs: [],
        ReplaceUnhealthyInstances: false,
        TargetCapacity: 1,
        TerminateInstancesWithExpiration: false,
        Type: '',
        TagSpecifications: [],
        InstanceInterruptionBehavior: ''
    });
    const handleAddFleet = () => {
        const newFleetName = `fleet_${Object.keys(jsonData).length + 1}`;
        setData(prevFormValues => ({
            ...prevFormValues,
            [newFleetName]: getDefaultFleet(),
        }));
    };
    return (
        <div style={{ height: '96%', padding: '16px' }}>
            <Space style={{ marginBottom: '20px' }}>
                <img
                    className="logo"
                    src={logo}
                />
                <Title level={3} style={{ margin: 0 }}>SFMT</Title>
            </Space>
            <Row gutter={16} style={{ height: '94%' }}>
                <Col lg={10} sm={24} style={{ height: '93vh' }}>
                    <DynamicForm formData={jsonData} onDataUpdate={updateData} />
                </Col>
                <Col lg={14} sm={24}>
                    <JsonPreviewCard data={jsonData} onDataUpdate={updateData} />
                </Col>
            </Row>
        </div>
    );
};

export default Structure;