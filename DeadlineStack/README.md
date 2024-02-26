# RFDK Sample Application - Deadline Spot Event Plugin - Python

## Overview
[Back to overview](../README.md)

## Instructions

---
**NOTE**

These instructions assume that your working directory is `examples/deadline/SIC-deployment/python/` relative to the root of the AWS-RFDK package.

---

1.  This sample app on the `mainline` branch may contain features that have not yet been officially released, and may not be available in the `aws-rfdk` package installed through pip from PyPI. To work from an example of the latest release, please switch to the `release` branch. If you would like to try out unreleased features, you can stay on `mainline` and follow the instructions for building, packing, and installing the `aws-rfdk` from your local repository.

2.  Install the dependencies of the sample app:

    ```bash
    pip install -r requirements.txt
    ```

3.  Change the values in variable in `package/config.py` according to the customers need.

4. Stage the Docker recipes for `RenderQueue`:

    ```bash
    # Set this value to the version of RFDK your application targets
    RFDK_VERSION=<version_of_RFDK>

    # Set this value to the version of AWS Thinkbox Deadline you'd like to deploy to your farm. Deadline 10.1.12 and up are supported.
    RFDK_DEADLINE_VERSION=<version_of_deadline>

    npx --package=aws-rfdk@${RFDK_VERSION} stage-deadline --output stage ${RFDK_DEADLINE_VERSION}
    ```

5. Deploy ECR repository and push Spotfleet Mgmt UI related Docker image to it. Run the script like this:

    ```bash
    ./deploy_spotfleet_mgmt_ui.sh -a YOUR_AWS_ACCOUNT_ID -r YOUR_AWS_REGION -p YOUR_AWS_PROFILE
    ```

6. Deploy all the stacks:

    ```bash
    cdk deploy "*"
    ```

7. Once you are finished with the sample app, you can tear it down by running:

    **Note:** Any resources created by the Spot Event Plugin will not be deleted with `cdk destroy`. Make sure that all such resources (e.g. Spot Fleet Request or Fleet Instances) are cleaned up, before destroying the stacks. Disable the Spot Event Plugin by setting 'state' property to 'SpotEventPluginState.DISABLED' or via Deadline Monitor, ensure you shutdown all Pulse instances and then terminate any Spot Fleet Requests in the AWS EC2 Instance Console.

    ```bash
    cdk destroy "*"
    ```
