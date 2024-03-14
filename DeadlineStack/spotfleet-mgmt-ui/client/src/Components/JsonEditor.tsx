import React from 'react';
import MonacoEditor from 'react-monaco-editor';

interface JsonEditorProps {
    initialValue: string;
    onChange: (newValue: string) => void;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ initialValue, onChange }) => {
    const handleEditorChange = (newValue: string, e: any) => {
        onChange(newValue);
    };

    return (
        <MonacoEditor
            height={700}
            language="json"
            value={initialValue}
            options={{ selectOnLineNumbers: true, }}
            onChange={handleEditorChange}
        />
    );
};

export default JsonEditor;
