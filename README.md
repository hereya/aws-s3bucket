# AWS S3 Bucket - Hereya Package

A secure AWS S3 bucket provisioned through AWS CDK with enterprise-grade security settings, designed for use with the Hereya platform.

## 🚀 Quick Start with Hereya

```bash
# Add this package to your Hereya project
hereya add aws/s3bucket
```

## 📦 What This Package Does

This Hereya package provisions a production-ready AWS S3 bucket with:

- **🔐 Security First**: All public access blocked, server-side encryption (AES256)
- **📚 Versioning**: Built-in object versioning for data protection
- **🏷️ Stable Naming**: Consistent bucket names across deployments using CDK's `Names.uniqueResourceName()`
- **🧹 Auto-cleanup**: Configurable auto-delete objects on stack removal (defaults to false for safety)
- **📋 IAM Policy Export**: Ready-to-use IAM policy document for bucket access

## 📥 Inputs

When using with Hereya, the platform automatically provides all required configuration. You only need to specify optional parameters.

### Optional Parameters

| Parameter | Default | Description | Example |
|-----------|---------|-------------|---------|
| `namePrefix` | `hereya` | Prefix for the bucket name | `hereya add aws/s3bucket -p "namePrefix=myapp"` |
| `autoDeleteObjects` | `false` | Auto-delete objects when stack is destroyed (⚠️ use with caution) | `hereya add aws/s3bucket -p "autoDeleteObjects=true"` |

> **Note**: `STACK_NAME` is automatically managed by Hereya and should not be set manually.
>
> **⚠️ Warning**: Setting `autoDeleteObjects=true` will delete all objects in the bucket when the stack is destroyed. Use this only for development/testing environments.

## 📤 Outputs

After deployment, the stack exports three CloudFormation outputs:

| Output | Type | Description | Usage |
|--------|------|-------------|-------|
| `bucketName` | string | The name of the created S3 bucket | Use this to reference the bucket in other resources |
| `awsRegion` | string | The AWS region where the bucket is deployed | Useful for constructing ARNs and URLs |
| `iamPolicyAwsS3Bucket` | JSON | IAM policy document for bucket object permissions | Attach to IAM roles/users for bucket access |

### IAM Policy Permissions

The exported IAM policy grants the following permissions on bucket objects:
- `s3:GetObject` - Read objects from the bucket
- `s3:PutObject` - Write objects to the bucket
- `s3:DeleteObject` - Delete objects from the bucket

## 🎯 Usage Examples

### Basic Deployment with Hereya

```bash
# Deploy with default settings (production-safe)
hereya add aws/s3bucket

# Deploy with custom prefix
hereya add aws/s3bucket -p "namePrefix=myapp"

# Deploy for development with auto-delete (⚠️ careful!)
hereya add aws/s3bucket -p "namePrefix=dev autoDeleteObjects=true"

# Deploy with multiple parameters
hereya add aws/s3bucket -p "namePrefix=staging autoDeleteObjects=false"
```

### Using Outputs in Other Stacks

Once deployed, you can reference the outputs in other CDK stacks or applications:

```typescript
// Example: Using the bucket name in another stack
const bucketName = Fn.importValue('my-s3-stack:bucketName');

// Example: Using the IAM policy for a Lambda function
const policyDocument = Fn.importValue('my-s3-stack:iamPolicyAwsS3Bucket');
```

### Terraform Integration

If you're using Terraform alongside Hereya, you can reference the outputs:

```hcl
data "aws_cloudformation_export" "bucket_name" {
  name = "my-s3-stack:bucketName"
}

data "aws_cloudformation_export" "bucket_policy" {
  name = "my-s3-stack:iamPolicyAwsS3Bucket"
}
```

## 🏗️ Architecture

The bucket is configured with:

- **Encryption**: S3-managed keys (SSE-S3) with AES256
- **Versioning**: Enabled by default for data recovery
- **Public Access**: All public access is blocked
- **Removal Policy**: RETAIN by default (DESTROY when `autoDeleteObjects=true`)

## 🔧 Development

### Prerequisites

- Node.js 18+
- AWS CDK CLI (`npm install -g aws-cdk`)
- AWS credentials configured

### Manual Deployment (Without Hereya)

If you need to deploy manually for development or testing:

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm run test

# Synthesize CloudFormation template
STACK_NAME=my-stack npx cdk synth

# Deploy to AWS
STACK_NAME=my-stack npx cdk deploy

# Deploy with custom prefix
STACK_NAME=my-stack namePrefix=myapp npx cdk deploy

# Compare with deployed stack
STACK_NAME=my-stack npx cdk diff

# Destroy stack
STACK_NAME=my-stack npx cdk destroy
```

## 🧪 Testing

The package includes comprehensive Jest tests that verify:

- S3 bucket security configuration
- CloudFormation outputs generation
- Environment variable prefix handling
- Bucket naming stability

Run tests with:

```bash
npm run test
```

## 📝 Notes

- The bucket name is generated as: `${namePrefix}-${stackname-hash}`
- The hash suffix ensures global uniqueness while maintaining stability across deployments
- Bucket names will only change if you modify the `namePrefix` or stack name
- The `autoDeleteObjects` parameter defaults to `false` for production safety
- Only set `autoDeleteObjects=true` for development/testing environments where data loss is acceptable

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue in the GitHub repository.
