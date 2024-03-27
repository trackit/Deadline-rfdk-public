import React, { useState } from "react";
import { Input, Button, Space, Select, InputNumber, Tag, type SelectProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Override } from '../interface';
type TagRender = SelectProps['tagRender'];

interface OverridesProps {
    overrides: Override[];
    prioritize: boolean;
    onChange: (overrides: Override[]) => void;
}

const tagRender: TagRender = (props) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };
    return (
        <Tag
            color='blue'
            onMouseDown={onPreventMouseDown}
            closable={closable}
            onClose={onClose}
            style={{ marginInlineEnd: 4 }}
        >
            {label}
        </Tag>
    );
};

const Overrides: React.FC<OverridesProps> = ({ overrides, prioritize, onChange }) => {
    const [localOverrides, setLocalOverrides] = useState<Override[]>(overrides);

    const handleAddOverride = () => {
        const newOverrides = [...localOverrides, { SubnetId: [], InstanceType: '', Priority: 1 }];
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
                variant='filled'
                value={localOverrides[index].Priority}
                onChange={value => handleChange(index, 'Priority', value)}
                placeholder="Set Priority"
                style={{ width: 'auto' }}
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
                        placeholder="Enter an Instance Type"
                    />
                    <Select
                        mode="tags"
                        variant='filled'
                        tagRender={tagRender}
                        allowClear
                        style={{ minWidth: '15vw' }}
                        value={override.SubnetId}
                        onChange={value => handleChange(index, 'SubnetId', value)}
                        placeholder="Enter Subnets Id"
                    />
                    {renderPriority(prioritize, index)}
                    <Button danger onClick={() => handleRemoveOverride(index)}>Remove</Button>
                </Space>
            ))}
            <Button type="dashed" onClick={handleAddOverride} block icon={<PlusOutlined />}>
                Add Override
            </Button>
        </div>
    );
}

export default Overrides;
