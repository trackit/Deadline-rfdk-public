import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Flex, notification, Input } from 'antd';
import JsonEditor from './JsonEditor';

interface JsonPreviewCardProps {
    data: Record<string, any>;
    onDataUpdate: (updatedData: Record<string, any>) => void;
}

const JsonPreviewCard: React.FC<JsonPreviewCardProps> = ({ data, onDataUpdate }) => {
    const [formattedJson, setFormattedJson] = useState(() => JSON.stringify(data, null, 2));
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setFormattedJson(JSON.stringify(data, null, 2));
    }, [data]);

    const handleEditClick = () => {
        if (isEditing) {
            try {
                const updatedData = JSON.parse(formattedJson);
                onDataUpdate(updatedData);
                setIsEditing(!isEditing);
            } catch (error) {
                notification.open({
                    message: 'Invalid JSON format',
                    description: 'Please make sure the JSON is correctly formatted.',
                });
            }
        } else {
            setIsEditing(!isEditing);
        }
    };

    const handleJsonEditorChange = (newValue: string) => {
        setFormattedJson(newValue);
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
                <JsonEditor initialValue={formattedJson} onChange={handleJsonEditorChange} />
            ) : (
                <pre>{formattedJson}</pre>
            )}
        </Card>
    );
};
export default JsonPreviewCard;
