import crypto from "crypto";

export const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY || "";
export const PAYU_SALT = process.env.PAYU_SALT || "";
export const PAYU_URL = process.env.PAYU_URL || "https://test.payu.in/_payment";

export function generateHash(params: Record<string, string>) {
  // Hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
  const hashString = `${PAYU_MERCHANT_KEY}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|||||||||||${PAYU_SALT}`;
  
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");
  return hash;
}

export function verifyHash(params: Record<string, string>, receivedHash: string) {
  // Reverse Hash sequence for success: SALT|status|||||||||||email|firstname|productinfo|amount|txnid|key
  const hashString = `${PAYU_SALT}|${params.status}|||||||||||${params.email}|${params.firstname}|${params.productinfo}|${params.amount}|${params.txnid}|${PAYU_MERCHANT_KEY}`;
  
  const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");
  return calculatedHash === receivedHash;
}
