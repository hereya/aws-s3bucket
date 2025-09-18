#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { HereyaAwsS3BucketStack } from '../lib/hereya-aws-s3bucket-stack';

const app = new cdk.App();
new HereyaAwsS3BucketStack(app, process.env.STACK_NAME!, {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  });
