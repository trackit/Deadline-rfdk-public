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
        <div style={{ height: '96%', padding: '16px' }}>
            <Title level={3} style={{ margin: 0 }}>SFMT</Title>
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