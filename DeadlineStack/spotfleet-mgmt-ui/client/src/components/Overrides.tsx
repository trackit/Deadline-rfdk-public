import React from "react";
import { Form, Input, Typography, Button, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CustomTagInput from "./CustomTagInput";

interface OverridesProps {
    path: (string | number)[];
    subnetsByInstanceType: { [instanceType: string]: string[] };
}

const Overrides: React.FC<OverridesProps> = ({ path, subnetsByInstanceType }) => {
    return (
        <>
            {Object.entries(subnetsByInstanceType).map(([instanceType, subnets]) => (
                <div key={instanceType}>
                    <Form.List name={[...path, instanceType]}>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item label="Instance Type" name={[name, 'InstanceType']} initialValue={instanceType}>
                                            <Input />
                                        </Form.Item>
                                        <CustomTagInput name={[name, 'SubnetId']} initialValue={subnets}/>
                                          
                                        <Button onClick={() => remove(name)}>Remove</Button>
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Add Override
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </div>
            ))}
        </>
    );
}

export default Overrides;
