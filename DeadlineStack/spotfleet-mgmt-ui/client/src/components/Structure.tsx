import React, { useState } from 'react';
import { Typography, Switch, Row, Col } from 'antd';

const { Title, Text } = Typography;

interface StructureProps {
    data: Record<string, any>;
}

const Structure: React.FC<StructureProps> = ({ data }) => {
    const [isSwitchOn, setIsSwitchOn] = useState(true);

    const onChange = (checked: boolean) => {
        setIsSwitchOn(checked);
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
                    {isSwitchOn && (
                        <div style={{ marginBottom: '16px' }}>
                            {/* Add Deadline info here */}
                        </div>
                    )}
                    <div>
                        {/* Add JsonPreview here */}
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Structure;