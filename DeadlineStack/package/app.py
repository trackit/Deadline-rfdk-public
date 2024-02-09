#!/usr/bin/env python3

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import os

from aws_cdk import (
    App,
    Environment,
)

from aws_cdk.aws_ec2 import (
    MachineImage,
)

from .lib import (
    deadline_stack,
)

from .config import config

def main():
    # ------------------------------
    # Validate Config Values
    # ------------------------------

    if 'region' in config.deadline_client_linux_ami_map:
        raise ValueError('Deadline Client Linux AMI map is required but was not specified.')

    # ------------------------------
    # Application
    # ------------------------------
    app = App()

    if 'CDK_DEPLOY_ACCOUNT' not in os.environ and 'CDK_DEFAULT_ACCOUNT' not in os.environ:
        raise ValueError('You must define either CDK_DEPLOY_ACCOUNT or CDK_DEFAULT_ACCOUNT in the environment.')
    if 'CDK_DEPLOY_REGION' not in os.environ and 'CDK_DEFAULT_REGION' not in os.environ:
        raise ValueError('You must define either CDK_DEPLOY_REGION or CDK_DEFAULT_REGION in the environment.')
    env = Environment(
        account=os.environ.get('CDK_DEPLOY_ACCOUNT', os.environ.get('CDK_DEFAULT_ACCOUNT')),
        region=os.environ.get('CDK_DEPLOY_REGION', os.environ.get('CDK_DEFAULT_REGION'))
    )

    sep_props = deadline_stack.DeadlineStackProps(
        aws_region=config.aws_region,
        docker_recipes_stage_path=os.path.join(os.path.dirname(os.path.realpath(__file__)), os.pardir, 'stage'),
        worker_machine_image=MachineImage.generic_linux(config.deadline_client_linux_ami_map),
        create_resource_tracker_role=config.create_resource_tracker_role,
        vpc_cidr=config.vpc_cidr,
        s3_bucket_workers=config.s3_bucket_workers,
        s3_bucket_workers_region=config.s3_bucket_workers_region,
        fleet_config=config.fleet_config,
        secret_domain_arn=config.secret_domain_arn,
        custom_ami_id=config.custom_ami_id,
        ec2_key_pair_name=config.ec2_key_pair_name
    )
    service = deadline_stack.DeadlineStack(app, 'DeadlineStack', props=sep_props, env=env)

    app.synth()


if __name__ == '__main__':
    main()
