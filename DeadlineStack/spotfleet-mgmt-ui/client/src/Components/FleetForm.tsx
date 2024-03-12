import React from "react";
import { FleetData, FleetFormProps } from "../interface";
import FleetFormLaunchTemplateConfigs from "./FleetFormLaunchTemplateConfigs";
import FleetFormLaunchSpecifications from "./FleetFormLaunchSpecifications";

const FleetForm: React.FC<FleetFormProps> = ({ fleetData, fleetTitle }) => {
    
    
    const fleetsWithSpecifications: FleetData = {};
    const fleetsWithoutSpecifications: FleetData = {};

    Object.keys(fleetData).forEach((fleetName) => {
        if (fleetData[fleetName].LaunchSpecifications && fleetData[fleetName].LaunchSpecifications.length > 0) {
            fleetsWithSpecifications[fleetName] = fleetData[fleetName];
        } else {
            fleetsWithoutSpecifications[fleetName] = fleetData[fleetName];
        }
    });
    console.log(fleetsWithSpecifications)
    console.log(fleetsWithoutSpecifications)
    return (
        <div>
            {Object.keys(fleetData).map((fleetName) => 
                <div key={fleetName}>

                    {fleetsWithSpecifications[fleetName] ? (
                        <FleetFormLaunchSpecifications fleetData={fleetsWithSpecifications} fleetTitle={fleetTitle} />
                    ) : (
                        <FleetFormLaunchTemplateConfigs fleetData={fleetsWithoutSpecifications} fleetTitle={fleetTitle} />
                    )}
                </div>
            )}
        </div>
    );
};

export default FleetForm;