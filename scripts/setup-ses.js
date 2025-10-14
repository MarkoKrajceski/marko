#!/usr/bin/env node

/**
 * AWS SES Setup Script
 * 
 * This script helps you set up AWS SES for email notifications.
 * You need to verify your email address before you can send emails.
 * 
 * Usage:
 *   node scripts/setup-ses.js
 */

const { SESClient, VerifyEmailIdentityCommand, ListVerifiedEmailAddressesCommand } = require('@aws-sdk/client-ses');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

async function setupSES() {
    const email = process.env.NOTIFICATION_EMAIL || 'your-email@example.com';
    const region = process.env.AWS_REGION || 'eu-south-1';

    console.log('🔧 Setting up AWS SES for email notifications...');
    console.log(`   Email: ${email}`);
    console.log(`   Region: ${region}`);
    console.log('');

    const sesClient = new SESClient({ region });

    try {
        // Check if email is already verified
        console.log('📋 Checking verified email addresses...');
        const listCommand = new ListVerifiedEmailAddressesCommand({});
        const listResult = await sesClient.send(listCommand);

        if (listResult.VerifiedEmailAddresses?.includes(email)) {
            console.log('✅ Email address is already verified!');
            console.log('   You can now receive contact form notifications.');
            return;
        }

        // Send verification email
        console.log('📧 Sending verification email...');
        const verifyCommand = new VerifyEmailIdentityCommand({
            EmailAddress: email,
        });

        await sesClient.send(verifyCommand);

        console.log('✅ Verification email sent successfully!');
        console.log('');
        console.log('📬 Next steps:');
        console.log('   1. Check your email inbox for a verification email from AWS');
        console.log('   2. Click the verification link in the email');
        console.log('   3. Run this script again to confirm verification');
        console.log('');
        console.log('⚠️  Note: You must verify your email address before you can receive');
        console.log('   contact form notifications. This is an AWS security requirement.');

    } catch (error) {
        console.error('❌ Failed to set up SES:', error.message);
        console.log('');
        console.log('💡 Common issues:');
        console.log('   - Make sure you have AWS credentials configured');
        console.log('   - Check that your AWS region supports SES');
        console.log('   - Ensure you have SES permissions in your AWS account');
        console.log('');
        console.log('🔗 AWS SES regions: https://docs.aws.amazon.com/ses/latest/dg/regions.html');
    }
}

if (require.main === module) {
    setupSES();
}

module.exports = { setupSES };