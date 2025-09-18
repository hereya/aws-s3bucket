# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build and Development
- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and compile automatically
- `npm run test` - Run Jest unit tests

### AWS CDK Operations
- `cdk synth` - Synthesize CloudFormation template without deploying
- `cdk deploy` - Deploy stack to AWS account/region
- `cdk diff` - Compare deployed stack with current state
- `cdk destroy` - Destroy the deployed stack

### Testing
- `npm run test` - Run all Jest tests
- `npm run test -- --watch` - Run tests in watch mode
- `npm run test -- test/hereya-aws-s3bucket.test.ts` - Run a specific test file

## Architecture

This is an AWS CDK (Cloud Development Kit) TypeScript project that defines infrastructure as code. The project structure follows CDK conventions:

### Core Components

1. **Entry Point**: `bin/hereya-aws-s3bucket.ts`
   - Creates the CDK App instance
   - Instantiates the main stack (`HereyaAwsS3BucketStack`)

2. **Stack Definition**: `lib/hereya-aws-s3bucket-stack.ts`
   - Creates an S3 bucket with enterprise-grade security settings
   - Bucket naming uses optional prefix from `namePrefix` environment variable (default: 'hereya')
   - Uses CDK's `Names.uniqueResourceName()` to generate stable, unique suffix based on stack name
   - Bucket name format: `${prefix}-${stackname-hash}` (stable across deployments)
   - Features enabled:
     - Versioning for data protection
     - Block all public access
     - S3-managed encryption (AES256)
     - Auto-delete objects on stack removal (for development)

3. **Testing**: Uses Jest with CDK assertions library
   - Tests verify the S3 bucket is created with correct security properties
   - Tests verify CloudFormation outputs are created
   - Tests verify optional prefix functionality
   - Tests confirm bucket names are stable across deployments
   - Uses `Template` and `Match` from `aws-cdk-lib/assertions` for infrastructure testing

### Environment Variables

- `namePrefix`: Sets the prefix for the S3 bucket name (default: 'hereya')
  - Example: `namePrefix=myapp cdk deploy`
- `autoDeleteObjects`: Auto-delete objects when stack is destroyed (default: 'false')
  - Example: `autoDeleteObjects=true cdk deploy`
  - ⚠️ Use with caution - only for development/testing environments

### CDK Configuration

The project uses CDK v2 (aws-cdk-lib 2.190.0) with TypeScript. The `cdk.json` file configures:
- ts-node for TypeScript execution
- Extensive feature flags for CDK best practices and security defaults
- Watch configuration excluding non-source files

### Development Workflow

1. Make changes to stack definitions in `lib/`
2. Run `npm run build` to compile TypeScript
3. Use `cdk synth` to validate and view generated CloudFormation
4. Run `npm run test` to verify infrastructure assertions
5. Deploy with `cdk deploy` when ready