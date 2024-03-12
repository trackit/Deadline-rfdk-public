import React, { useState } from 'react';
import { Typography, Switch, Row, Col } from 'antd';

const { Title, Text } = Typography;

interface StructureProps {
    data: Record<string, any>;
}

const Structure: React.FC<StructureProps> = ({ data }) => {
    const [isSwitchOn, setIsSwitchOn] = useState(true);
    const [jsonData, setData] = useState(data);

    const onChange = (checked: boolean) => {
        setIsSwitchOn(checked);
    };

    // use to update json preview
    const updateData = (updatedData: Record<string, any>) => {
        setData(updatedData);
    };

    const renderDeadlineInfo = () => {
        if (isSwitchOn) {
            return (
                <div style={{ marginBottom: '16px' }}>
                    {/* Add Deadline info here */}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ padding: '16px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: '16px', alignItems: 'flex-start' }}>
                <Title level={3}>SFMT</Title>
                <Row>
                    <Text type="secondary" style={{ marginRight: '8px' }}>General infos</Text>
                    <Switch defaultChecked={isSwitchOn} onChange={onChange} />
                </Row>
            </Row>
            <Row gutter={16}>
                <Col span={10}>
                    {/* Add fleet configuration here */}
                </Col>
                <Col span={14}>
                    {renderDeadlineInfo()}
                    <div>
                        {/* Add JsonPreview here */}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Structure;