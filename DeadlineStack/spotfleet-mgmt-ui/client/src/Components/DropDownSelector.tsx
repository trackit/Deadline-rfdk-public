import React from 'react';
import { Select, Space, Typography } from 'antd';

const { Title, Text } = Typography;

interface GeneralInfosProps {
    name: string;
    data: string[];
    handleChange: (value: string) => void;
}

const DropDownSelector: React.FC<GeneralInfosProps> = ({ name, data, handleChange }) => {

    return (
        <Space direction="vertical" style={{ marginBottom: '8px' }}>
            <Title level={5} style={{ marginBottom: 0 }}>{name}</Title>
            <Text type="secondary">Pick an {name} from the list below</Text>
            <Select
                defaultValue={data[0]}
                style={{ width: 250 }}
                onChange={handleChange}
                options={data.map((item) => ({ label: item, value: item }))}
            />
        </Space>
    );
}

export default DropDownSelector;
