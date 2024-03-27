import React from 'react';
import { Form, Select } from 'antd';

interface GeneralInfosProps {
    label: string;
    name: string[];
    items: string[];
    onChange?: (value: string) => void;
}

const DropDownSelector: React.FC<GeneralInfosProps> = ({ label, name, items, onChange }) => {
    return (
        <Form.Item label={label} name={name}>
            <Select
                style={{ width: "40%" }}
                options={items.map((item) => ({ label: item, value: item }))}
                onChange={onChange}
            />
        </Form.Item >
    );
}

export default DropDownSelector;