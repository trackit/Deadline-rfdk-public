import React from "react";
import { Button, Form, Input, Space, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface FormListProps {
  name: (string | number)[];
  subItems: string[]; // Array of subitem names
}

const FormList: React.FC<FormListProps> = ({ name, subItems }) => (
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
                  <Input placeholder={subItem} />
                </Form.Item>
              ))}
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
  </>
);

export default FormList;