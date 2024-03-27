import React from "react";
import { Button, Form, Input, Space, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface FormListProps {
  name: any[];
  subItems: any[];
}

const FormList: React.FC<FormListProps> = ({ name, subItems }) => {
  return (
    <>
      <Typography.Title level={5}>{name[name.length - 1]}</Typography.Title>
      <Form.List name={name}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                {subItems.map(subItem => (
                  <Form.Item
                    {...restField}
                    key={`${name}-${subItem}`}
                    name={[name, subItem]}
                  >
                    <Input variant='filled' placeholder={`Enter a ${subItem.toString()}`}/>

                  </Form.Item>
                ))}
                <Button danger onClick={() => remove(name)}>Remove</Button>
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  );
};

export default FormList;