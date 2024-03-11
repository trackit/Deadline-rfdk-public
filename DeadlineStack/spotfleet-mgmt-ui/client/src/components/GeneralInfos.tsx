import React, { useEffect, useState } from 'react';
import { Card } from 'antd';

interface GeneralInfosProps {
    data: Record<string, any>;
}

const GeneralInfos: React.FC<GeneralInfosProps> = ({ data }) => {
    const [maxQuota, setMaxQuota] = useState(0);
    const [maxCapacity, setMaxCapacity] = useState(0);
    const [maxVcpus, setMaxVcpus] = useState(0);

    useEffect(() => {
        setMaxQuota(data.maxQuota || 0);
        setMaxCapacity(data.maxCapacity || 0);
        setMaxVcpus(data.maxVcpus || 0);
    }, [data]);
    return (
        <Card title="Deadline farm informations">
            <p>Current maximum quota (Max vcpu): {maxQuota}</p>
            <p>Current Sum of each fleet max capacity value: {maxCapacity}</p>
            <p>Current sum of each fleet max vcpus value: {maxVcpus}</p>
        </Card>
    );
};

export default GeneralInfos;
