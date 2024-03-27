import React from 'react';
import { Form, Switch } from 'antd';

interface BooleanSelectorProps {
    label: string | number;
    name: (string | number)[];
}

const BooleanSelector: React.FC<BooleanSelectorProps> = ({ label, name }) => {
    return (
        <Form.Item label={label} name={name}>
            <Switch checkedChildren="True" unCheckedChildren="False" />
        </Form.Item>
    );
}

export default BooleanSelector;