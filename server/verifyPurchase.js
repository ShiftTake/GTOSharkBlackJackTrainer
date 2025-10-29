// === GTO Shark Server Verification API ===
// Secure backend verification for App Store purchases
// Author: GTO Shark (gtoshark.com)

import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// === Apple API Endpoints ===
const APPLE_PROD_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

// === Environment Config ===
const SHARED_SECRET = process.env.APPLE_SHARED_SECRET || 'YOUR_APPLE_SHARED_SECRET';
const PORT = process.env.PORT || 8080;

// === Main Verification Endpoint ===
app.post('/verifyPurchase', async (req, res) => {
  try {
    const { receipt, userId } = req.body;

    if (!receipt) {
      return res.status(400).json({ valid: false, error: 'Missing receipt data' });
    }

    // Construct verification payload
    const payload = {
      'receipt-data': receipt,
      password: SHARED_SECRET,
      'exclude-old-transactions': true
    };

    // Step 1: Try production
    let response = await fetch(APPLE_PROD_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });

    let data = await response.json();

    // Step 2: If in sandbox, retry
    if (data.status === 21007) {
      response = await fetch(APPLE_SANDBOX_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });
      data = await response.json();
    }

    // === Process Response ===
    if (data.status !== 0) {
      console.warn('Apple receipt validation failed:', data.status);
      return res.status(200).json({ valid: false, status: data.status });
    }

    // Validate subscription
    const latestReceipt = data.latest_receipt_info?.[0];
    const expiration = new Date(latestReceipt?.expires_date_ms * 1);
    const now = new Date();

    const isActive = expiration > now;

    if (isActive) {
      console.log(`[GTO SHARK] Active sub verified for user ${userId} ✅`);
      return res.status(200).json({ valid: true, expires: expiration });
    } else {
      console.warn(`[GTO SHARK] Subscription expired for user ${userId}`);
      return res.status(200).json({ valid: false, expires: expiration });
    }

  } catch (err) {
    console.error('[GTO SHARK] Verification error:', err);
    return res.status(500).json({ valid: false, error: err.message });
  }
});

// === Health Check Endpoint ===
app.get('/', (req, res) => {
  res.send('🦈 GTO Shark Verification Server is Running');
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`✅ GTO Shark Server running on port ${PORT}`);
});

