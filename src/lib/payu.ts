import crypto from "crypto";

export const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY || "";
export const PAYU_SALT = process.env.PAYU_SALT || "";
export const PAYU_URL = process.env.PAYU_URL || "https://test.payu.in/_payment";

type PayUFields = Record<string, string | undefined>;

function sha512(value: string) {
  return crypto.createHash("sha512").update(value).digest("hex");
}

export function assertPayUConfigured() {
  if (!PAYU_MERCHANT_KEY || !PAYU_SALT) {
    throw new Error("PayU merchant credentials are not configured.");
  }
}

export function generateHash(params: PayUFields) {
  assertPayUConfigured();
  const sequence = [
    PAYU_MERCHANT_KEY,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 || "",
    params.udf2 || "",
    params.udf3 || "",
    params.udf4 || "",
    params.udf5 || "",
    "", "", "", "", "",
    PAYU_SALT,
  ];
  return sha512(sequence.join("|"));
}

export function verifyHash(params: PayUFields, receivedHash: string) {
  assertPayUConfigured();
  const base = [
    PAYU_SALT,
    params.status,
    "", "", "", "", "",
    params.udf5 || "",
    params.udf4 || "",
    params.udf3 || "",
    params.udf2 || "",
    params.udf1 || "",
    params.email,
    params.firstname,
    params.productinfo,
    params.amount,
    params.txnid,
    PAYU_MERCHANT_KEY,
  ].join("|");
  const hashString = params.additional_charges
    ? `${params.additional_charges}|${base}`
    : base;
  const calculated = sha512(hashString);
  const received = receivedHash.toLowerCase();
  return calculated.length === received.length && crypto.timingSafeEqual(
    Buffer.from(calculated),
    Buffer.from(received),
  );
}

export async function verifyPaymentWithPayU(txnid: string, expectedAmount: string) {
  if (process.env.PAYU_VERIFY_PAYMENTS === "false") return true;
  const command = "verify_payment";
  const hash = sha512(`${PAYU_MERCHANT_KEY}|${command}|${txnid}|${PAYU_SALT}`);
  const verifyUrl = PAYU_URL.includes("test.payu.in")
    ? "https://test.payu.in/merchant/postservice.php?form=2"
    : "https://info.payu.in/merchant/postservice.php?form=2";

  const body = new URLSearchParams({
    key: PAYU_MERCHANT_KEY,
    command,
    var1: txnid,
    hash,
  });
  const response = await fetch(verifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!response.ok) return false;
  const data = await response.json();
  const transaction = data?.transaction_details?.[txnid];
  if (!transaction) return false;
  return transaction.status === "success" && Number(transaction.amt) === Number(expectedAmount);
}
