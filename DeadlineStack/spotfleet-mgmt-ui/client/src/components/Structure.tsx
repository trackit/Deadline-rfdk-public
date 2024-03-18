import React, { useState } from 'react';
import { Typography, Row, Col } from 'antd';
import JsonPreviewCard from './JsonPreviewCard';
import DynamicForm from './DynamicForm';

const { Title } = Typography;

interface StructureProps {
    data: Record<string, any>;
}

const Structure: React.FC<StructureProps> = ({ data }) => {
    const [jsonData, setData] = useState(data);

    const updateData = (updatedData: Record<string, any>) => {
        setData(updatedData);
    };
    return (
        <div style={{ padding: '16px' }}>
            <Title level={3}>SFMT</Title>
            <Row gutter={16} justify={"space-between"}>
                <Col sm={24} lg={10}>
                <DynamicForm formData={jsonData} onDataUpdate={updateData} />
                </Col>
                <Col sm={24} lg={14}>
                    <JsonPreviewCard data={jsonData} onDataUpdate={updateData}/>
                </Col>
            </Row>
        </div>
    );
};

export default Structure;