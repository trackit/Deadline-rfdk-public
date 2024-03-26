import React, { useState, useEffect } from 'react';
import { Card, Button, Flex, notification } from 'antd';
import JsonEditor from './JsonEditor';
import '../index.css'
import { syntaxHighlight } from '../utils/syntaxHighlight';

interface JsonPreviewCardProps {
    data: Record<string, any>;
    onDataUpdate: (updatedData: Record<string, any>) => void;
}

const JsonPreviewCard: React.FC<JsonPreviewCardProps> = ({ data, onDataUpdate }) => {
    const [formattedJson, setFormattedJson] = useState(() => JSON.stringify(data, null, 2));
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setFormattedJson(JSON.stringify(data, null, 2));
    }, [data]);

    const handleEditClick = (state: boolean) => {
        if (!state) {
            setIsEditing(!state);
            return;
        }
        try {
            const updatedData = JSON.parse(formattedJson);
            onDataUpdate(updatedData);
            setIsEditing(!state);
        } catch (error) {
            notification.open({
                message: 'Invalid JSON format',
                description: 'Please make sure the JSON is correctly formatted.',
            });
        }
    };

    useEffect(() => {
        if (!selectedFile)
            return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result)
                setFormattedJson(event.target.result as string);
        };
        reader.readAsText(selectedFile);
    }, [selectedFile]);

    const handleJsonEditorChange = (newValue: string) => {
        setFormattedJson(newValue);
    };

    const getRenderedContent = (state: boolean) => {
        if (state)
            return <JsonEditor initialValue={formattedJson} onChange={handleJsonEditorChange} />;
        return (
            <div className="scrollable-content">
                <pre
                dangerouslySetInnerHTML={{
                    __html: syntaxHighlight(formattedJson)
               }}
               />
            </div >
        );

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

    const handleFileSelection = (file: File) => {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target?.result)
                return;
            try {
                const uploadedDAta = JSON.parse(event.target.result as string);
                onDataUpdate(uploadedDAta);
            } catch (error) {
                notification.open({
                    message: 'Invalid JSON format',
                    description: 'Please make sure the JSON is correctly formatted.',
                });
                setIsEditing(true);
            }
        };
        reader.readAsText(file);
    };

    const uploadJson = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file)
                handleFileSelection(file);
        };
        input.click();
    };

    return (
        <div className='card'>
            <Card title="JSON Code preview" extra={
            <Flex gap="small" wrap="wrap">
                <Button type="default" onClick={() => handleEditClick(isEditing)}>{isEditing ? 'Save' : 'Edit'}</Button>
                <Button type="default" onClick={uploadJson}>Upload</Button>
                <Button type="primary" onClick={downloadJson}>Download</Button>
            </Flex>
        } style={{ height : '100%'}}>
            {getRenderedContent(isEditing)}
        </Card>
        </div>
    );
};
export default JsonPreviewCard;