import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as HereyaAwsS3Bucket from '../lib/hereya-aws-s3bucket-stack';

describe('HereyaAwsS3BucketStack', () => {
  test('S3 Bucket Created with proper configuration', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new HereyaAwsS3Bucket.HereyaAwsS3BucketStack(app, 'MyTestStack');
    // THEN
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::S3::Bucket', {
      VersioningConfiguration: {
        Status: 'Enabled'
      },
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true
      },
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [{
          ServerSideEncryptionByDefault: {
            SSEAlgorithm: 'AES256'
          }
        }]
      }
    });
  });

  test('Stack creates CloudFormation outputs', () => {
    const app = new cdk.App();
    const stack = new HereyaAwsS3Bucket.HereyaAwsS3BucketStack(app, 'MyTestStack');
    const template = Template.fromStack(stack);

    // Check outputs exist using hasOutput method (outputs become available after synthesis)
    const json = template.toJSON();

    // Check if outputs exist
    expect(json.Outputs).toBeDefined();

    // Check bucketName output exists
    expect(json.Outputs).toHaveProperty('bucketName');
    expect(json.Outputs.bucketName.Description).toBe('The name of the S3 bucket');

    // Check awsRegion output exists
    expect(json.Outputs).toHaveProperty('awsRegion');
    expect(json.Outputs.awsRegion.Description).toBe('The AWS region');

    // Check iamPolicyAwsS3Bucket output exists
    expect(json.Outputs).toHaveProperty('iamPolicyAwsS3Bucket');
    expect(json.Outputs.iamPolicyAwsS3Bucket.Description).toBe('IAM policy document for S3 bucket permissions');

    // Verify the policy output contains the expected structure (using Fn::Join)
    const policyOutput = json.Outputs.iamPolicyAwsS3Bucket.Value;
    expect(policyOutput).toHaveProperty('Fn::Join');

    // The policy should contain the expected actions in the serialized JSON
    const policyParts = policyOutput['Fn::Join'][1];
    const policyString = policyParts.join('');
    expect(policyString).toContain('s3:GetObject');
    expect(policyString).toContain('s3:PutObject');
    expect(policyString).toContain('s3:DeleteObject');
    expect(policyString).toContain('"Effect":"Allow"');
  });

  test('S3 Bucket uses environment variable prefix when set', () => {
    const originalEnv = process.env.namePrefix;
    process.env.namePrefix = 'test-prefix';

    const app = new cdk.App();
    const stack = new HereyaAwsS3Bucket.HereyaAwsS3BucketStack(app, 'MyTestStack');
    const template = Template.fromStack(stack);

    // Check that bucket name starts with the test prefix
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketName: Match.stringLikeRegexp('^test-prefix-.*')
    });

    process.env.namePrefix = originalEnv;
  });

  test('S3 Bucket uses default prefix when environment variable not set', () => {
    delete process.env.namePrefix;

    const app = new cdk.App();
    const stack = new HereyaAwsS3Bucket.HereyaAwsS3BucketStack(app, 'MyTestStack');
    const template = Template.fromStack(stack);

    // Check that bucket name starts with the default prefix
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketName: Match.stringLikeRegexp('^hereya-.*')
    });
  });

  test('S3 Bucket name is stable across multiple stack instances', () => {
    const app1 = new cdk.App();
    const stack1 = new HereyaAwsS3Bucket.HereyaAwsS3BucketStack(app1, 'TestStack');
    const template1 = Template.fromStack(stack1);

    const app2 = new cdk.App();
    const stack2 = new HereyaAwsS3Bucket.HereyaAwsS3BucketStack(app2, 'TestStack');
    const template2 = Template.fromStack(stack2);

    // Get bucket names from both templates
    const json1 = template1.toJSON();
    const json2 = template2.toJSON();

    // Find the bucket resource in both templates
    const bucket1 = Object.values(json1.Resources).find(
      (r: any) => r.Type === 'AWS::S3::Bucket'
    ) as any;
    const bucket2 = Object.values(json2.Resources).find(
      (r: any) => r.Type === 'AWS::S3::Bucket'
    ) as any;

    // Verify that bucket names are identical (stable)
    expect(bucket1.Properties.BucketName).toEqual(bucket2.Properties.BucketName);
  });

  test('S3 Bucket respects autoDeleteObjects parameter', () => {
    // Test with autoDeleteObjects = true
    process.env.autoDeleteObjects = 'true';
    const app1 = new cdk.App();
    const stack1 = new HereyaAwsS3Bucket.HereyaAwsS3BucketStack(app1, 'TestStack');
    const template1 = Template.fromStack(stack1);

    // Should have DESTROY policy and CustomResource for auto-delete
    const json1 = template1.toJSON();
    const bucket1 = Object.values(json1.Resources).find(
      (r: any) => r.Type === 'AWS::S3::Bucket'
    ) as any;
    expect(bucket1.DeletionPolicy).toBe('Delete');
    expect(bucket1.UpdateReplacePolicy).toBe('Delete');

    // Should have CustomResource for auto-delete
    const hasAutoDeleteResource = Object.values(json1.Resources).some(
      (r: any) => r.Type === 'Custom::S3AutoDeleteObjects'
    );
    expect(hasAutoDeleteResource).toBe(true);

    // Test with autoDeleteObjects = false (default)
    delete process.env.autoDeleteObjects;
    const app2 = new cdk.App();
    const stack2 = new HereyaAwsS3Bucket.HereyaAwsS3BucketStack(app2, 'TestStack');
    const template2 = Template.fromStack(stack2);

    // Should have RETAIN policy and no CustomResource for auto-delete
    const json2 = template2.toJSON();
    const bucket2 = Object.values(json2.Resources).find(
      (r: any) => r.Type === 'AWS::S3::Bucket'
    ) as any;
    expect(bucket2.DeletionPolicy).toBe('Retain');
    expect(bucket2.UpdateReplacePolicy).toBe('Retain');

    // Should NOT have CustomResource for auto-delete
    const hasAutoDeleteResource2 = Object.values(json2.Resources).some(
      (r: any) => r.Type === 'Custom::S3AutoDeleteObjects'
    );
    expect(hasAutoDeleteResource2).toBe(false);
  });
});
