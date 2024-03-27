import React from "react";
import { Form, Input, Typography } from "antd";
import FormList from "./FormList";

interface TagSpecificationsProps {
    name: (string | number)[];
    subItems: string[];
} 

const TagSpecifications: React.FC<TagSpecificationsProps> = ({ name, subItems }) => {
    return (
        <>
            <Typography.Title level={5}>{name[name.length - 1]}</Typography.Title>
            <Form.Item label={subItems[0]} name={[name[0], 'TagSpecifications', 0, subItems[0]]} >
                <Input placeholder="spot-fleet-request"  variant="filled"/>
            </Form.Item>
            <FormList name={[name[0], 'TagSpecifications', 0, subItems[1]]} subItems={['Key', 'Value']} />
        </>
    );
}

export default TagSpecifications;