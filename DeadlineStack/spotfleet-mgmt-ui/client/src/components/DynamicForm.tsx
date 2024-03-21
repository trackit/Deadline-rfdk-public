import React, { useState, useEffect } from 'react';
import { Form, Button, notification, InputNumber, Typography, Collapse, Space } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import { FleetFormProps, Fleet } from '../interface';

const DynamicForm = ({ formData, onDataUpdate }: FleetFormProps) => {
    const [submittedValues, setSubmittedValues] = useState<any>(null);
    const [formValues, setFormValues] = useState<Fleet>(formData);

    useEffect(() => {
        setFormValues(formData);
        setSubmittedValues(formData);
    }, [formData]);

    const updateFleetName = (fleetName: string, newFleetName: string, updatedValues: any) => {
        const fleetValues: any = {};

        for (const key in updatedValues) {
            if (!Object.prototype.hasOwnProperty.call(updatedValues, key))
                continue;
            if (key !== fleetName) {
                fleetValues[key] = updatedValues[key];
                continue;
            }
            fleetValues[newFleetName] = updatedValues[key];
        }
        delete fleetValues[newFleetName].FleetName;
        return fleetValues;
    };


    const onFinish = (values: any) => {
        let updatedValues = { ...formValues, ...values };
        Object.keys(updatedValues).forEach((fleetName) => {
            let updatedFleetName = fleetName;

            if (updatedValues[fleetName].FleetName) {
                updatedFleetName = updatedValues[updatedFleetName].FleetName;
                updatedValues = updateFleetName(fleetName, updatedValues[fleetName].FleetName, updatedValues);
            }

            if (!updatedValues[updatedFleetName].LaunchSpecifications)
                return;
            updatedValues[updatedFleetName].LaunchSpecifications.forEach((specification: any) => {
                if (!specification.InstanceType && typeof specification.InstanceType === 'string')
                    return;
                const instanceTypes = specification.InstanceType.split(' ').map((type: string) => type.trim());
                delete specification.InstanceType;
                instanceTypes.forEach((instanceType: string) => {
                    const newSpecification = { ...specification, InstanceType: instanceType };
                    updatedValues[updatedFleetName].LaunchSpecifications.push(newSpecification);
                });
                updatedValues[updatedFleetName].LaunchSpecifications = updatedValues[updatedFleetName].LaunchSpecifications.filter(
                    (spec: any) => spec.InstanceType !== undefined
                );
            });
        });
        onDataUpdate(updatedValues);
        setSubmittedValues(updatedValues);
    };

    const handleExport = () => {
        if (!submittedValues) {
            notification.error({
                message: 'No form data submitted',
                description: 'Please submit the form data before exporting.',
            });
            return;
        }
        const json = JSON.stringify(submittedValues, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'form_data.json';
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
    };

    const collapseItems = Object.entries(formValues).map(([fleetName, fleet], index_collapse) => {

        return {
            key: fleetName,
            label: fleetName,
            children: (
                <Form onFinish={onFinish} initialValues={formValues}>
                    <Typography.Title level={5}>Worker maximum capacity</Typography.Title>
                    <Form.Item name={[fleetName, 'TargetCapacity']} >
                        <InputNumber min={1} max={10} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Submit</Button>
                        <Button onClick={handleExport}>Export</Button>
                    </Form.Item>
                </Form>
            ),
        };
    });

    return (
        <Space direction="vertical" size="small" style={{ display: 'flex' }}>
            {collapseItems.map(({ key, label, children }) => (
                <Collapse
                    key={key}
                    accordion
                    expandIconPosition='end'
                    expandIcon={({ isActive }) => <ArrowUpOutlined rotate={isActive ? 180 : 0} />}
                    collapsible="header"
                    items={[{ key, label, children }]}
                />
            ))}
        </Space>
    );
};
export default DynamicForm;
