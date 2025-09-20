import { Stack, StackProps, RemovalPolicy, Names } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class HereyaAwsS3BucketStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Optional prefix from environment variable
    const bucketPrefix = process.env.namePrefix || 'hereya';

    // Optional auto-delete objects from environment variable (defaults to false for safety)
    const autoDeleteObjects = process.env.autoDeleteObjects === 'true';

    // Create a stable bucket name with prefix and CDK-generated suffix
    const bucketName = `${bucketPrefix}-${this.stackName}`.toLowerCase();

    const bucket = new s3.Bucket(this, 'HereyaS3Bucket', {
      bucketName,
      versioned: true,
      removalPolicy: autoDeleteObjects ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      autoDeleteObjects,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED
    });

    // Create IAM policy document for S3 bucket permissions
    const policyDocument = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            's3:GetObject',
            's3:PutObject',
            's3:DeleteObject'
          ],
          resources: [`${bucket.bucketArn}/*`]
        })
      ]
    });

    new cdk.CfnOutput(this, 'bucketName', {
      value: bucket.bucketName,
      description: 'The name of the S3 bucket'
    });

    new cdk.CfnOutput(this, 'awsRegion', {
      value: this.region,
      description: 'The AWS region'
    });

    new cdk.CfnOutput(this, 'iamPolicyAwsS3Bucket', {
      value: JSON.stringify(policyDocument.toJSON()),
      description: 'IAM policy document for S3 bucket permissions'
    });

    new cdk.CfnOutput(this, 'useAwsVpcEndpointS3', {
      value: 'true',
      description: 'Use AWS VPC endpoint for S3'
    });
  }
}
