import React, { useState } from 'react';
import { Input, Space, Typography, Tag, Button } from 'antd';

const { Title, Text } = Typography;

interface TagInputProps {
    tags: { key: string, value: string }[];
    handleAddTag: (tag: { key: string, value: string }) => void;
    handleRemoveTag: (key: string) => void;
}

const TagInput: React.FC<TagInputProps> = ({ tags, handleAddTag, handleRemoveTag }) => {
    const [tagKey, setTagKey] = useState('');
    const [tagValue, setTagValue] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
        setter(event.target.value);
    };

    const handleAddButtonClick = () => {
        if (tagKey.trim() !== '' && tagValue.trim() !== '') {
            handleAddTag({ key: tagKey, value: tagValue });
            setTagKey('');
            setTagValue('');
        }
    };

    return (
        <Space direction="vertical" style={{ marginBottom: '8px' }}>
            <Title level={5} style={{ marginBottom: 0 }}>Tag specifications</Title>
            <Text type="secondary">Enter your tags:</Text>
            <Space direction="horizontal">
                {tags.map((tag) => (
                    <Tag key={tag.key} closable onClose={() => handleRemoveTag(tag.key)}>
                        {tag.key}: {tag.value}
                    </Tag>
                ))}
            </Space>
            <Space direction="horizontal">
                <Input placeholder="Key" value={tagKey} onChange={(e) => handleInputChange(e, setTagKey)} style={{ width: 120 }} />
                <Input placeholder="Value" value={tagValue} onChange={(e) => handleInputChange(e, setTagValue)} style={{ width: 120 }} />
                <Button onClick={handleAddButtonClick}>Add</Button>
            </Space>
        </Space>
    );
}

export default TagInput;