import React from "react";
import { Form, Input, Typography, InputNumber, Button } from "antd";
import BooleanSelector from "./BooleanSelector";
import { PlusOutlined } from "@ant-design/icons";

interface BlockDeviceMappingsProps {
    path: (string | number)[];
    subItems: string[];
}

const BlockDeviceMappings: React.FC<BlockDeviceMappingsProps> = ({ path, subItems }) => {
    const EbsItems = ['DeleteOnTermination', 'Encrypted', 'SnapshotId', 'VolumeSize', 'VolumeType'];

    return (
        <>
            <Typography.Title level={5}>{path[path.length - 1]}</Typography.Title>
            <Form.List name={path}>
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <>
                                <Form.Item label={subItems[0]} name={[name, subItems[0]]} >
                                    <Input />
                                </Form.Item>
                                <BooleanSelector label={EbsItems[0]} name={[name, subItems[1], EbsItems[0]]} />
                                <BooleanSelector label={EbsItems[1]} name={[name, subItems[1], EbsItems[1]]} />
                                <Form.Item label={EbsItems[2]} name={[name, subItems[1], EbsItems[2]]} >
                                    <Input />
                                </Form.Item>
                                <Form.Item label={EbsItems[3]} name={[name, subItems[1], EbsItems[3]]} >
                                    <InputNumber min={1} />
                                </Form.Item>
                                <Form.Item label={EbsItems[4]} name={[name, subItems[1], EbsItems[4]]} >
                                    <Input />
                                </Form.Item>
                                <Button onClick={() => remove(name)}>Remove</Button>
                            </>
                        ))}
                        <Form.Item>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                Add BlockDeviceMappings
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
        </>
    );
}

export default BlockDeviceMappings;