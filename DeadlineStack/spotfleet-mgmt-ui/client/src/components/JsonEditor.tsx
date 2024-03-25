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
            height='80vh'
            language="json"
            value={initialValue}
            options={{ selectOnLineNumbers: true, automaticLayout: true, scrollBeyondLastLine: false }}
            onChange={handleEditorChange}
        />
    );
};

export default JsonEditor;
