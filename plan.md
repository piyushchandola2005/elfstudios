# Elf Jampad — Booking Flow Specification

**Client:** Elf Studios — Elf Jampad rehearsal space, New Delhi
**Marketing page (unchanged):** https://www.elfstudios.in/elf-jampad — Squarespace
**Booking app (this build):** https://booking.elfstudios.in
**Tech stack (carried over from existing production spec):** Next.js 14, MongoDB — flag if this has changed
**Prepared for:** Antigravity implementation handoff
**Date:** August 1, 2026

---

## Revision notes — what changed in this pass

1. **Pricing logic corrected.** It is *not* ₹400/hr flat + ₹100/hr per member above 5. See §3 below for the exact rule — this is the one that was previously implemented wrong.
2. **Community Calendar dropped from this phase.** Not being built now — may revisit later.
3. **Payment gateway is PayU, not Razorpay.** Client does not have a Razorpay account.
4. **Returning-user pre-population clarified.** Logged-in users get all saved details auto-filled except attendee count, which is always entered fresh.

Everything below folds these corrections into the full flow, alongside everything already agreed in the original brief.

---

## 1. Scope & site integration

- **The Squarespace page (elfstudios.in/elf-jampad) stays as-is.** It's the client's existing marketing page — the gear/equipment info ("The Gear @ Elf Jampad") stays there, and the client edits that content directly in Squarespace. Not part of this build.
- **This build is the booking app only**, hosted at `booking.elfstudios.in`.
- **Integration point:** the in-page "Book Now!" CTA buttons on the elf-jampad Squarespace page currently link to `/contact` — repoint these to `https://booking.elfstudios.in`.
  - Note: the site-wide header nav "BOOK NOW" button (appears on every page across the whole site, links to `tel:+918383055502`) is a separate, global element. Leaving that as-is unless told otherwise, since repointing it would affect every page, not just Jampad — flagging this assumption in §6.
- **Jampad is the only bookable service** — no service picker needed; the app goes straight into the Jampad flow.
- **Add-ons page: not needed right now** — skip entirely for this phase.
- **Community Calendar: deferred** — not part of this build, may be added later.

## 2. Booking flow

### Step 1 — Attendee count (first screen)
- The very first thing the user enters is **number of attendees**.
- Price should be shown live based on this count (see §3) — the user should see the cost before going any further.

### Step 2 — Date & Time
- Carries over from the current design as-is.
- Calendar/slot view: booked slots are labeled with the **band name** that booked them (reference UX: [mgmh.net/soundstation](https://mgmh.net/soundstation/) — Delhi's Soundstation rehearsal space, whose studio calendar labels slots by band and reveals timing details on click. Elf Jampad's slot view can follow a similar convention).

### Step 3 — Login (required)
- Customer **must be logged in** to complete a booking, so details are captured in the database.
- **Returning/logged-in users:** all saved profile details (name, contact, band name, etc.) auto-populate.
- **Exception:** attendee count is *never* pre-filled — it's re-entered every booking, since headcount changes jam to jam.

### Step 4 — Details
- **Band Name:** required field.
- **Full/complete address: not required.**
- All other existing detail fields carry over unchanged from the current draft.

### Step 5 — Summary
- Review screen — carries over from the current design.
- **Add a "Cancel" button here** (new requirement).
- Payment amount shown = **100% advance** (full amount, no partial deposit option).

### Step 6 — Payment
- **Gateway: PayU.** Not Razorpay — client doesn't have a Razorpay account.
- Amount charged = 100% of the booking total, upfront.

### Step 7 — Confirmation
- Booking confirmed, subject to the cancellation/reschedule policy in §4.

## 3. Pricing logic

This is the part that needs to be exact — it's the one correction in this pass.

**Not this** (incorrect — incremental per-head add-on):
```
❌ price_per_hour = 400 + 100 × (attendees − 5)   // wrong for 6+ people
```

**Actual rule:**
```
if attendees <= 5:
    price_per_hour = 400          # flat rate for the whole group, not per-person
else:
    price_per_hour = 100 × attendees   # full recalculation, not incremental on top of 400
```

So: 5 people or fewer = ₹400/hr flat, regardless of exact headcount. 6 people = ₹600/hr. 7 people = ₹700/hr. It's ₹100 × headcount once you cross 5 — not ₹400 plus a per-head surcharge.

**Context on the ₹400 figure:** the underlying rate is ₹500 for up to 5 people; ₹400 is a *current introductory discount* (₹100 off). Recommendation: store the ₹500 base rate and ₹100 discount as separate configurable values rather than hardcoding ₹400 — the discount is introductory and the "real" price may need to revert later without a code change. (This is a build suggestion, not a client requirement.)

**Volume discount:** booking a 10-hour session earns a 10% discount on the total price. (10% off a 10-hour block works out to exactly 1 free hour, which is consistent with the original "1 hour free" framing.) Implementing as "10 hours or more qualifies" rather than exactly-10-only, unless told otherwise — flag if that's wrong.

## 4. Cancellation & rescheduling

- **No refunds.**
- **Rescheduling is allowed**, within 7 days of the initial booking. (Exact reference point needs confirming — see §6.)

## 5. Explicitly out of scope for this phase

- Community Calendar
- Add-ons page
- Any changes to the Squarespace marketing page content (client manages "What's included"/gear info directly, on Squarespace)

## 6. Open questions — confirm before/during implementation

1. **7-day reschedule window** — is this 7 days *from the booking transaction date* (a change-your-mind window right after booking), or *before the session date*? Worth pinning down since it's a scheduling/billing rule.
2. **Nav-level "BOOK NOW" button** (site-wide, `tel:` link) — confirming this is out of scope and only the in-page Jampad CTA(s) get repointed to `booking.elfstudios.in`. Flagging in case that's not the intent.