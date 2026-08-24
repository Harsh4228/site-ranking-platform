import Razorpay from "razorpay";

let _razorpay;

export function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
  }
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
}

// Tier pricing in paise (INR)
export const TIER_CONFIG_INR = {
  1: { name: "Starter", pricePaise: 49900, priceDisplay: "₹499", boost: 15 },
  2: { name: "Growth", pricePaise: 99900, priceDisplay: "₹999", boost: 30 },
  3: { name: "Pro", pricePaise: 199900, priceDisplay: "₹1,999", boost: 45 },
  4: { name: "Leader", pricePaise: 399900, priceDisplay: "₹3,999", boost: 60 },
};
