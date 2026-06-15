# 🚀 Complete Stripe Setup Guide

## ✅ What's Implemented:

1. **Subscription Schema** - Database tracks premium users
2. **Webhook Handler** - Syncs payment status automatically
3. **Premium Check** - Unlocks unlimited uploads for Pro users
4. **Visual Indicators** - Shows "PRO" badge in sidebar

---

## 📝 Setup Steps:

### 1. Get Your Stripe API Keys

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (pk_test_...)
3. Copy your **Secret key** (sk_test_...)
4. Add them to `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
```

### 2. Set Up Stripe Webhook (For Testing)

#### Option A: Using Stripe CLI (Recommended for Development)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook secret (starts with `whsec_...`) and add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
   ```

#### Option B: Skip Webhook Secret (Development Only)

For quick testing, you can skip the webhook secret. The webhook will still work but won't verify signatures.

Just leave it as:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Test the Complete Flow

1. **Restart your server**:
   ```bash
   npm run dev
   ```

2. **If using Stripe CLI**, keep it running in another terminal:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Go to upgrade page**: http://localhost:3000/dashboard/upgrade

4. **Click "Upgrade Now"**

5. **Use test card**:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

6. **Complete payment**

7. **Check your Stripe CLI terminal** - You should see:
   ```
   ✅ Webhook received: checkout.session.completed
   💳 Checkout completed for: user@example.com
   ✅ Subscription saved to database
   ```

8. **Go back to dashboard** - You should see:
   - ✅ "PRO" badge in sidebar (green)
   - ✅ "Unlimited uploads" message
   - ✅ Can upload more than 5 PDFs

---

## 🔍 How It Works:

### Payment Flow:
```
1. User clicks "Upgrade Now"
   ↓
2. Redirects to Stripe Checkout
   ↓
3. User enters payment info
   ↓
4. Stripe processes payment
   ↓
5. Stripe sends webhook to /api/webhooks/stripe
   ↓
6. Webhook saves subscription to Convex
   ↓
7. User sees success page
   ↓
8. Returns to dashboard (now shows PRO badge)
   ↓
9. Can upload unlimited PDFs
```

### Database Schema:
```javascript
subscriptions: {
  userEmail: "user@example.com",
  stripeSubscriptionId: "sub_xxx",
  stripeCustomerId: "cus_xxx",
  status: "active",
  planName: "NoteAG Pro",
  currentPeriodEnd: 1234567890,
  cancelAtPeriodEnd: false
}
```

### Upload Logic:
```javascript
// Before upload
const isPremium = await isPremiumUser(userEmail);
const canUpload = isPremium || fileCount < 5;

if (!canUpload) {
  alert("Upgrade to Pro!");
}
```

---

## 🎯 What Happens After Payment:

### ✅ Immediate:
- Subscription created in Stripe
- Webhook fired to your app
- Subscription saved to Convex database
- User redirected to success page

### ✅ On Dashboard:
- "PRO" badge appears in sidebar
- Upload limit removed
- Can upload unlimited PDFs
- No more "5 files max" restriction

### ✅ Monthly:
- Stripe automatically charges $4
- Subscription remains active
- User keeps premium features

### ✅ On Cancel:
- User can cancel in Stripe dashboard
- Webhook updates status to "canceled"
- Premium features disabled
- Back to 5 file limit

---

## 🐛 Troubleshooting:

### Issue: Webhook not working
**Solution**: Make sure Stripe CLI is running:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Issue: Still shows 5 file limit after payment
**Solution**: 
1. Check Convex dashboard: https://dashboard.convex.dev
2. Look in `subscriptions` table
3. Verify subscription was saved
4. Check `status` field is "active"

### Issue: "Upgrade Now" button does nothing
**Solution**: Check browser console for errors, make sure Stripe keys are set

---

## 📊 Testing Scenarios:

### Test Successful Payment:
1. Use card: `4242 4242 4242 4242`
2. Should see "PRO" badge
3. Can upload unlimited files

### Test Failed Payment:
1. Use card: `4000 0000 0000 0002`
2. Should see error message
3. Remains on free plan

### Test Cancel Subscription:
1. Go to Stripe Dashboard → Customers
2. Find your test customer
3. Cancel subscription
4. Webhook fires → "PRO" badge disappears
5. Back to 5 file limit

---

## 🚀 Ready for Production:

When deploying to production:

1. **Switch to live keys**:
   - Get live keys from Stripe dashboard
   - Update `.env.production` or Vercel env vars

2. **Set up production webhook**:
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy webhook secret

3. **Deploy** 🎉

---

## Need Help?

Check Stripe logs:
- https://dashboard.stripe.com/test/logs

Check Convex logs:
- https://dashboard.convex.dev

Check webhook events:
- https://dashboard.stripe.com/test/webhooks
