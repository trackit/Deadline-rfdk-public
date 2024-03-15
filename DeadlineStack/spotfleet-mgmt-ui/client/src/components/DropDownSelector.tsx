import React from 'react';
import { Form, Select } from 'antd';

interface GeneralInfosProps {
    label: string;
    name: string[];
    items: string[];
}

const DropDownSelector: React.FC<GeneralInfosProps> = ({ label, name, items }) => {
    return (
        <Form.Item label={label} name={name}>
            <Select
                style={{ width: "40%" }}
                options={items.map((item) => ({ label: item, value: item }))}
            />
        </Form.Item >
    );
}

export default DropDownSelector;