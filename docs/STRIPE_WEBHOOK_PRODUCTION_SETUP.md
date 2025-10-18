# Stripe Webhook Production Setup

This guide explains how to configure Stripe webhooks for a live production environment hosted on Vercel. This is the production equivalent of using `ngrok` or the Stripe CLI for local development.

## Prerequisites

- Your application has been successfully deployed to Vercel.
- You have access to your Stripe account dashboard.

## Step 1: Create a Production Webhook Endpoint

1.  Navigate to the **Webhooks** section in your Stripe Dashboard.
2.  Click **"Add an endpoint"**.
3.  In the **"Endpoint URL"** field, enter your production webhook URL. It will be your Vercel domain followed by the API route path:
    ```
    https://your-app-name.vercel.app/api/stripe/webhook
    ```
4.  Click **"+ Select events"** to choose which events to listen for. For this application, you must select:
    - `checkout.session.completed`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
5.  Click **"Add events"**, then click **"Add endpoint"** to save.

## Step 2: Get the Webhook Signing Secret

1.  After creating the endpoint, you will be taken to its details page.
2.  Under the **"Signing secret"** section, click **"Click to reveal"**.
3.  Copy this secret value (it will start with `whsec_...`).

## Step 3: Add the Secret to Vercel

1.  Go to your project's dashboard in Vercel.
2.  Navigate to the **Settings > Environment Variables** section.
3.  Create a new environment variable named `STRIPE_WEBHOOK_SECRET`.
4.  Paste the signing secret you copied from Stripe into the value field.
5.  Ensure the variable is available to the **Production** environment (and Preview/Development if needed).
6.  Save the variable. Vercel will automatically trigger a new deployment to apply the updated environment variable.

**Your production webhook is now configured.** Stripe will send live events to your Vercel deployment, and your webhook handler will be able to securely verify and process them.