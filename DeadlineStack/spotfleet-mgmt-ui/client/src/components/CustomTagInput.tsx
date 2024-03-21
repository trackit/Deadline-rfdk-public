import React, { useEffect, useState } from 'react';
import { Form, Input, Tag, Typography } from 'antd';

interface CustomTagInputProps {
    title?: string;
    name: any[];
    initialValue:any;
  }
const CustomTagInput: React.FC<CustomTagInputProps> = ({name, title, initialValue}) => {
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<{ type: string; color: string }[]>([]);

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newType = inputValue.trim();
      if (newType) {
        const color = 'blue';
        setTags([...tags, { type: newType, color }]);
        setInputValue('');
      }
    }
  };

  const handleTagClose = (type: string) => {
    const updatedTags = tags.filter(tag => tag.type !== type);
    setTags(updatedTags);
  };
  return (
    <>
    <Typography.Title level={5}>{title}</Typography.Title>
    <Form.Item name={name} initialValue={initialValue}>
          <Input
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              addonBefore={<div>
                  {tags.map(tag => (
                         <Tag
                          key={tag.type}
                          closable
                          onClose={() => handleTagClose(tag.type)}
                          style={{ marginRight: 4, marginBottom: 4 }}
                          color={tag.color}
                      >
                          {tag.type}
                      </Tag>
                  ))}
              </div>} />
      </Form.Item></>
  );
};

export default CustomTagInput;
