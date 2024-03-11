import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Flex, notification, Input } from 'antd';

interface JsonPreviewCardProps {
    data: Record<string, any>;
    onDataUpdate: (updatedData: Record<string, any>) => void;
}

const JsonPreviewCard: React.FC<JsonPreviewCardProps> = ({ data, onDataUpdate }) => {
    const [formattedJson, setFormattedJson] = useState(() => JSON.stringify(data, null, 2));
    const [isEditing, setIsEditing] = useState(false);
    const editableContentRef = useRef<HTMLPreElement>(null);

    useEffect(() => {
        setFormattedJson(JSON.stringify(data, null, 2));
    }, [data]);

    const handleEditClick = () => {
        if (isEditing) {
            try {
                const updatedData = JSON.parse(formattedJson);
                onDataUpdate(updatedData);
            } catch (error) {
                notification.open({
                    message: 'Invalid JSON format',
                    description: 'Please make sure the JSON is correctly formatted.',
                });
            }
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormattedJson(e.target.value);
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
            {isEditing ? (
                <Input.TextArea
                    value={formattedJson}
                    onChange={handleInputChange}
                    autoSize={{ minRows: 5, maxRows: 20 }}
                />
            ) : (
                <pre>{formattedJson}</pre>
            )}
        </Card>
    );
};
export default JsonPreviewCard;
