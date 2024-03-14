import React from 'react';
import { Space, Typography, Switch } from 'antd';

const { Title } = Typography;

interface BooleanSelectorProps {
    title: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const BooleanSelector: React.FC<BooleanSelectorProps> = ({ title, checked, onChange }) => {
    return (
        <Space direction="horizontal" style={{ marginBottom: '8px' }}>
            <Title level={5} style={{ paddingRight: "40px" }}>{title}</Title>
            <Switch checkedChildren="True" unCheckedChildren="False" checked={checked} onChange={onChange} />
        </Space>
    );
}

export default BooleanSelector;
