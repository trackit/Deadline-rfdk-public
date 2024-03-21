import React, { useState } from "react";
import { Input, Button, Space, Select, InputNumber } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Override } from '../interface';

interface OverridesProps {
    overrides: Override[];
    prioritize: boolean;
    onChange: (overrides: Override[]) => void;
}

const Overrides: React.FC<OverridesProps> = ({ overrides, prioritize, onChange }) => {
    const [localOverrides, setLocalOverrides] = useState<Override[]>(overrides);

    const handleAddOverride = () => {
        const newOverrides = [...localOverrides, { SubnetId: [], InstanceType: '', Priority: 0 }];
        setLocalOverrides(newOverrides);
        onChange(newOverrides);
    };

    const handleRemoveOverride = (index: number) => {
        const newOverrides = localOverrides.filter((_, i) => i !== index);
        setLocalOverrides(newOverrides);
        onChange(newOverrides);
    };

    const handleChange = (index: number, field: keyof Override, value: string | number | string[] | null) => {
        const newOverrides = localOverrides.map((override, i) => i === index ? { ...override, [field]: value } : override);
        setLocalOverrides(newOverrides);
        onChange(newOverrides);

    };

    const renderPriority = (doPriority: boolean, index: number) => {
        if (!doPriority)
            return null;
        return (
            <InputNumber
                min={1}
                value={localOverrides[index].Priority}
                onChange={value => handleChange(index, 'Priority', value)}
                placeholder="Priority"
            />
        );
    };

    return (
        <div style={{ paddingBottom: '24px' }}>
            {localOverrides.map((override, index) => (
                <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Input
                        variant='filled'
                        value={override.InstanceType}
                        onChange={e => handleChange(index, 'InstanceType', e.target.value)}
                        placeholder="Instance Type"
                    />
                    <Select
                        mode="tags"
                        allowClear
                        style={{ width: '100%' }}
                        value={override.SubnetId}
                        onChange={value => handleChange(index, 'SubnetId', value)}
                        placeholder="Subnet Id"
                    />
                    {renderPriority(prioritize, index)}
                    <Button onClick={() => handleRemoveOverride(index)}>Remove</Button>
                </Space>
            ))}
            <Button type="dashed" onClick={handleAddOverride} block icon={<PlusOutlined />}>
                Add Override
            </Button>
        </div>
    );
}

export default Overrides;
