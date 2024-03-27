import React, { useState } from 'react';
import { Typography, Row, Col, Button, Space } from 'antd';
import JsonPreviewCard from './JsonPreviewCard';
import DynamicForm from './DynamicForm';
import { Fleet } from '../interface';
import { PlusOutlined } from '@ant-design/icons';
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
            <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom:'10px' }}>
                <Title level={3} style={{ margin: 0 }}>SFMT</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddFleet}>Add Fleet</Button>
            </Space>
            <Row gutter={16} style={{ height: '94%' }}>
                <Col lg={10} sm={24}>
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