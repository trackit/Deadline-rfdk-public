/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CloudFormation } from '@aws-sdk/client-cloudformation';
import { ssmCommand } from '../../common/functions/awaitSsmCommand';

// Name of testing stack is derived from env variable to ensure uniqueness
const testingStackName = 'RFDKInteg-RQ-TestingTier' + process.env.INTEG_STACK_TAG?.toString();

const cloudformation = new CloudFormation({});

const bastionRegex = /bastionId/;
const rqRegex = /renderQueueEndpointRQ(\d)/;
const certRegex = /CertSecretARNRQ(\d)/;

const testCases: Array<Array<any>> = [
  [ 'HTTP mode', 1 ],
  [ 'HTTPS mode (TLS)', 2],
];
let bastionId: any;
let renderQueueEndpoints: Array<string> = [];
let secretARNs: Array<string> = [];

beforeAll( async () => {
  // Query the TestingStack and await its outputs to use as test inputs
  var params = {
    StackName: testingStackName,
  };
  var data = await cloudformation.describeStacks(params);
  var stackOutput = data.Stacks![0].Outputs!;
  stackOutput.forEach( output => {
    var outputKey = output.OutputKey!;
    var outputValue = output.OutputValue!;
    switch(true){
      case bastionRegex.test(outputKey):
        bastionId = outputValue;
        break;
      case rqRegex.test(outputKey):
        var testId = rqRegex.exec(outputKey)![1];
        renderQueueEndpoints[+testId] = outputValue;
        break;
      case certRegex.test(outputKey):
        var testId = certRegex.exec(outputKey)![1];
        secretARNs[+testId] = outputValue;
        break;
      default:
        break;
    }
  });
});

describe.each(testCases)('Deadline RenderQueue tests (%s)', (_, id) => {

  beforeAll( async () => {
    if(secretARNs[id]) {
      //If the secretARN has been provided for the auth certificate, this command will fetch it to the instance before continuing the tests
      const region = await cloudformation.config.region();
      var params = {
        DocumentName: 'AWS-RunShellScript',
        Comment: 'Execute Test Script fetch-cert.sh',
        InstanceIds: [bastionId],
        Parameters: {
          commands: [
            'sudo -i',
            'su - ec2-user >/dev/null',
            'cd ~ec2-user',
            './utilScripts/fetch-cert.sh \'' + region + '\' \'' + secretARNs[id] + '\'',
          ],
        },
      };
      return await ssmCommand(bastionId, params);
    }
    else {
      return;
    }
  });

  // This removes the certification file used to authenticate to the render queue
  afterAll( async () => {
    var params = {
      DocumentName: 'AWS-RunShellScript',
      Comment: 'Execute Test Script cleanup-cert.sh',
      InstanceIds: [bastionId],
      Parameters: {
        commands: [
          'sudo -i',
          'su - ec2-user >/dev/null',
          'cd ~ec2-user',
          './utilScripts/cleanup-cert.sh',
        ],
      },
    };
    return await ssmCommand(bastionId, params);
  });

  describe('Connection tests', () => {

    test(`RQ-${id}-1: Farm render queue endpoint can be queried`, async () => {
      /**********************************************************************************************************
       * TestID:          RQ-1
       * Description:     Confirm that render queue endpoint is routing traffic properly
       * Input:           Response code from curl command run on endpoint output by render queue delivered via SSM command
       * Expected result: Response code 0, i.e. the script execution was successful and the endpoint can be queried
      **********************************************************************************************************/
      var params = {
        DocumentName: 'AWS-RunShellScript',
        Comment: 'Execute Test Script RQ-query-endpoint.sh',
        InstanceIds: [bastionId],
        Parameters: {
          commands: [
            'sudo -i',
            'su - ec2-user >/dev/null',
            'cd ~ec2-user',
            './testScripts/RQ-query-endpoint.sh \'' + renderQueueEndpoints[id] + '\'',
          ],
        },
      };
      var response = await ssmCommand(bastionId, params);
      var responseCode = response.responseCode;
      expect(responseCode).toEqual(0);
    });
  });

  describe('deadlinecommand tests', () => {

    // Before testing the render queue, send a command to configure the Deadline client to use that endpoint
    beforeAll( async () => {
      var params = {
        DocumentName: 'AWS-RunShellScript',
        Comment: 'Execute Test Script configure-deadline.sh',
        InstanceIds: [bastionId],
        Parameters: {
          commands: [
            'sudo -i',
            'su - ec2-user >/dev/null',
            'cd ~ec2-user',
            './utilScripts/configure-deadline.sh \'' + renderQueueEndpoints[id] + '\'',
          ],
        },
      };
      return await ssmCommand(bastionId, params);
    });

    test(`RQ-${id}-2: Farm can accept Deadline commands`, async () => {
      /**********************************************************************************************************
       * TestID:          RQ-2
       * Description:     Confirm that Deadline can connect to the render queue
       * Input:           Response code from deadlinecommand command delivered via SSM command
       * Expected result: Response code 0, i.e. the script execution was successful and Deadline recognized the command
      **********************************************************************************************************/
      var params = {
        DocumentName: 'AWS-RunShellScript',
        Comment: 'Execute Test Script RQ-test-deadlinecommand.sh',
        InstanceIds: [bastionId],
        Parameters: {
          commands: [
            'sudo -i',
            'su - ec2-user >/dev/null',
            'cd ~ec2-user',
            './testScripts/RQ-test-deadlinecommand.sh',
          ],
        },
      };
      var response = await ssmCommand(bastionId, params);
      var responseCode = response.responseCode;
      expect(responseCode).toEqual(0);
    });

    test(`RQ-${id}-3: Farm can fetch settings file from repository`, async () => {
      /**********************************************************************************************************
       * TestID:          RQ-3
       * Description:     Confirm that render queue endpoint can fetch a file from the farm repository
       * Input:           Response code from deadlinecommand to fetch repository settings file delivered via SSM command
       * Expected result: Response code 0, i.e. the script execution was successful and the file was fetched
      **********************************************************************************************************/
      var params = {
        DocumentName: 'AWS-RunShellScript',
        Comment: 'Execute Test Script RQ-fetch-repository-file.sh',
        InstanceIds: [bastionId],
        Parameters: {
          commands: [
            'sudo -i',
            'su - ec2-user >/dev/null',
            'cd ~ec2-user',
            './testScripts/RQ-fetch-repository-file.sh',
          ],
        },
      };
      var response = await ssmCommand(bastionId, params);
      var responseCode = response.responseCode;
      expect(responseCode).toEqual(0);
    });

    test(`RQ-${id}-4: Farm can accept sample Deadline job`, async () => {
      /**********************************************************************************************************
       * TestID:          RQ-4
       * Description:     Confirm that render queue endpoint is routing traffic properly
       * Input:           Response code from deadlinecommand with job files delivered via SSM command
       * Expected result: Response code 0, i.e. the script execution was successful and Deadline accepted the job
      **********************************************************************************************************/
      var params = {
        DocumentName: 'AWS-RunShellScript',
        Comment: 'Execute Test Script RQ-submit-job.sh',
        InstanceIds: [bastionId],
        Parameters: {
          commands: [
            'sudo -i',
            'su - ec2-user >/dev/null',
            'cd ~ec2-user',
            './testScripts/RQ-submit-job.sh',
          ],
        },
      };
      var response = await ssmCommand(bastionId, params);
      var responseCode = response.responseCode;
      expect(responseCode).toEqual(0);
    });

    test(`RQ-${id}-5: RCS not running as root`, async () => {
      /**********************************************************************************************************
       * TestID:          RQ-5
       * Description:     Confirm that RCS process is not running as the root user
       * Input:           The user owning the RCS process as reported by deadlinecommand
       * Expected result: Response code 0, i.e. the script execution was successful and Deadline accepted the job
      **********************************************************************************************************/
      var params = {
        DocumentName: 'AWS-RunShellScript',
        Comment: 'Execute Test Script RQ-query-rcs-user.sh',
        InstanceIds: [bastionId],
        Parameters: {
          commands: [
            'sudo -i',
            'su - ec2-user >/dev/null',
            'cd ~ec2-user',
            './testScripts/RQ-query-rcs-user.sh',
          ],
        },
      };
      var response = await ssmCommand(bastionId, params);
      const user = response.output;
      expect(user).not.toHaveLength(0);
      expect(user).not.toEqual('root');
    });
  });
});
