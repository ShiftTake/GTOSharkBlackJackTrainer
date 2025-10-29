// === GTO Shark Paywall Integration & Verification ===
// This module connects frontend IAP logic with your Render backend.

const PAYWALL_API_URL = 'https://gtoshark-render.onrender.com'; // <-- Replace with your Render backend URL

window.paywall = window.paywall || {};

window.paywall.verifySubscription = async function(receiptData) {
  try {
    const response = await fetch(`${PAYWALL_API_URL}/verifyPurchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receipt: receiptData,
        userId: getUserId(),
        environment: window.Capacitor ? 'ios' : 'web'
      })
    });

    const result = await response.json();

    if (result?.valid) {
      localStorage.setItem('gtoSharkSubscribed', 'true');
      localStorage.removeItem('gtoSharkFreeHands');
      console.log('[GTO SHARK] Subscription verified ✅');
      document.getElementById('subscription-modal')?.classList.add('hidden');
      return true;
    } else {
      console.warn('[GTO SHARK] Invalid or expired subscription');
      return false;
    }
  } catch (err) {
    console.error('[GTO SHARK] Verification error:', err);
    return false;
  }
};

// === Purchase Handler (called after successful IAP) ===
window.paywall.handlePurchase = async function(purchaseInfo) {
  if (!purchaseInfo?.receipt) {
    alert('Invalid purchase receipt.');
    return;
  }

  const verified = await window.paywall.verifySubscription(purchaseInfo.receipt);
  if (verified) {
    alert('Subscription activated successfully!');
  } else {
    alert('Verification failed. Please contact support.');
  }
};

// === Helper Functions ===

// Generates or retrieves a local user ID for receipt linking
function getUserId() {
  let id = localStorage.getItem('gtoSharkUID');
  if (!id) {
    id = 'uid_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('gtoSharkUID', id);
  }
  return id;
}

// === Environment Detection ===
window.paywall.environment = window.Capacitor
  ? (Capacitor.isNativePlatform() ? 'ios' : 'web')
  : 'web';

// === Debugging Utilities ===
window.paywall.debugStatus = function() {
  console.table({
    subscribed: localStorage.getItem('gtoSharkSubscribed'),
    freeHands: localStorage.getItem('gtoSharkFreeHands'),
    uid: localStorage.getItem('gtoSharkUID'),
    env: window.paywall.environment
  });
};

// === Subscription Modal Listener ===
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('subscription-modal');
  const closeOnOutsideClick = (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  };
  modal?.addEventListener('click', closeOnOutsideClick);
});

console.log('[GTO SHARK] Paywall.js initialized');

