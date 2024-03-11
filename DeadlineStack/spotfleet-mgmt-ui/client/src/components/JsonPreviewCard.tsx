import React, { useState } from 'react';
import { Card, Button, Flex } from 'antd';

interface JsonPreviewCardProps {
    data: Record<string, any>;
}

const JsonPreviewCard: React.FC<JsonPreviewCardProps> = ({ data }) => {
    const [formattedJson, setFormattedJson] = useState(() => JSON.stringify(data, null, 2));
    const [isEditing, setIsEditing] = useState(false);

    const handleEditClick = () => {
        setIsEditing(!isEditing);
    };

    const downloadJson = () => {
        const blob = new Blob([formattedJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fleets_config.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Card title="JSON Code preview" extra={
            <Flex gap="small" wrap="wrap">
                <Button type="default" onClick={handleEditClick}>{isEditing ? 'Save' : 'Edit'}</Button>
                <Button type="primary" onClick={downloadJson}>Download</Button>
            </Flex>
        } style={{ overflow: 'auto' }}>
            <pre contentEditable={isEditing}>
                {formattedJson}
            </pre>
        </Card>
    );
};
export default JsonPreviewCard;
