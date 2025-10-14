# Email Notification Setup Guide

This guide explains how to set up email notifications for your contact form using AWS SES (Simple Email Service).

## Overview

When someone submits the contact form on your website, you'll receive an email notification with their details and message. This uses AWS SES to send emails from your Lambda function.

## Prerequisites

- AWS account with SES access
- Email address you want to receive notifications at
- AWS credentials configured (same as your Amplify setup)

## Setup Steps

### 1. Verify Your Email Address

AWS SES requires you to verify email addresses before you can send emails to them. This is a security measure to prevent spam.

**Option A: Use the Setup Script (Recommended)**

```bash
npm run setup:ses
```

This script will:
- Check if your email is already verified
- Send a verification email if needed
- Provide next steps

**Option B: Manual Setup via AWS Console**

1. Go to the [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Navigate to "Verified identities"
3. Click "Create identity"
4. Choose "Email address"
5. Enter your email address (e.g., `marko@marko.dev`)
6. Click "Create identity"
7. Check your email and click the verification link

### 2. Configure Your Email Address

Update your email address in the configuration files:

**For Local Development (.env.local):**
```bash
NOTIFICATION_EMAIL=your-email@example.com
```

**For Production (amplify.yml):**
```yaml
- export NOTIFICATION_EMAIL="your-email@example.com"
```

**For Lambda Function (amplify/functions/lead/resource.ts):**
```typescript
environment: {
  NOTIFICATION_EMAIL: 'your-email@example.com',
},
```

### 3. Deploy the Changes

After setting up SES and configuring your email:

```bash
# Deploy to sandbox for testing
npx ampx sandbox

# Or deploy to production
git add .
git commit -m "feat: add email notifications for contact form"
git push
```

### 4. Test the Email Notifications

1. Fill out the contact form on your website
2. Submit the form
3. Check your email inbox for a notification

## Email Template

The notification email includes:

- **Subject**: "New Contact Form Submission from [Name]"
- **Sender Details**: Name and email address
- **Message**: Full message content
- **Timestamp**: When the form was submitted
- **Formatting**: Clean HTML layout with fallback text version

## Troubleshooting

### Common Issues

**1. Email Not Verified**
```
Error: Email address not verified
```
- Run `npm run setup:ses` to verify your email
- Check your email inbox for the verification email
- Click the verification link

**2. SES Not Available in Region**
```
Error: SES is not available in this region
```
- SES is not available in all AWS regions
- Common SES regions: `us-east-1`, `us-west-2`, `eu-west-1`
- Update your AWS region in the configuration

**3. Permission Denied**
```
Error: User is not authorized to perform: ses:SendEmail
```
- The Lambda function needs SES permissions
- This is automatically configured in `amplify/backend.ts`
- Redeploy your backend if you're still getting this error

**4. Email Goes to Spam**
- This is common with new SES accounts
- Consider setting up SPF/DKIM records for your domain
- For personal use, check your spam folder initially

### Testing Email Delivery

You can test email delivery locally:

```bash
# Test the lead API endpoint
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "message": "This is a test message"
  }'
```

Check the Lambda logs to see if the email was sent successfully.

## SES Limits and Considerations

### Sandbox Mode
- New AWS accounts start in SES sandbox mode
- You can only send emails to verified addresses
- Limited to 200 emails per day, 1 email per second

### Production Mode
- Request production access through AWS Support
- Can send emails to any address
- Higher sending limits
- Required for public websites

### Cost
- SES is very affordable for contact forms
- First 62,000 emails per month are free (when sent from EC2/Lambda)
- After that: $0.10 per 1,000 emails

## Security Best Practices

1. **Email Validation**: The Lambda function validates and sanitizes all input
2. **Rate Limiting**: Contact form has built-in rate limiting
3. **Spam Protection**: Basic spam detection patterns are checked
4. **Restricted Permissions**: SES permissions are scoped to sending only

## Advanced Configuration

### Custom Email Templates

You can customize the email template by editing the `sendNotificationEmail` function in `amplify/functions/lead/handler.ts`.

### Multiple Recipients

To send notifications to multiple email addresses:

```typescript
Destination: {
  ToAddresses: ['marko@marko.dev', 'team@marko.dev'],
},
```

### Email Attachments

For more complex email needs (attachments, etc.), consider using `SendRawEmail` instead of `SendEmail`.

## Monitoring

### CloudWatch Logs
- Lambda function logs show email sending status
- Check CloudWatch for any email delivery errors

### SES Metrics
- AWS SES Console shows delivery statistics
- Monitor bounce and complaint rates

### Contact Form Analytics
- Form submissions are logged in Lambda
- Consider adding metrics to track conversion rates

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review CloudWatch logs for detailed error messages
3. Verify your SES setup in the AWS Console
4. Test with the provided scripts and curl commands

The email notification system is designed to be reliable and fail gracefully - if email sending fails, the contact form submission will still succeed, and the failure will be logged for debugging.