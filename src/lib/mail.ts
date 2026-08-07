import nodemailer from "nodemailer";
import { format } from "date-fns";

const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const ADMIN_EMAILS = process.env.ADMIN_EMAILS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD,
  },
});

export async function sendBookingConfirmation(booking: any, userEmail: string) {
  if (!SMTP_EMAIL || !SMTP_PASSWORD) {
    console.warn("SMTP credentials not configured. Skipping email.");
    return;
  }

  const { ticketNumber, bandName, date, slots, totalAmount, equipmentRequests, user } = booking;
  const formattedDate = format(new Date(date), "EEEE, MMMM d, yyyy");
  
  // Convert slot strings to readable times (e.g. "10" -> "10:00 AM - 11:00 AM")
  const formattedSlots = slots.map((s: string) => {
    const hr = parseInt(s);
    const ampm1 = hr >= 12 ? "PM" : "AM";
    const ampm2 = (hr + 1) >= 12 ? "PM" : "AM";
    const hr1 = hr > 12 ? hr - 12 : hr;
    const hr2 = (hr + 1) > 12 ? (hr + 1) - 12 : (hr + 1);
    return `${hr1}:00 ${ampm1} - ${hr2}:00 ${ampm2}`;
  }).join("<br/>");

  const userName = user?.name || "Musician";
  const userPhone = user?.phone || "Not provided";

  // Customer Email HTML
  const customerHtml = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111111; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #333;">
      <div style="background-color: #000000; padding: 30px; text-align: center; border-bottom: 2px solid #ff6600;">
        <h1 style="color: #ff6600; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">Elf Studios</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #4ade80; font-size: 24px; margin-top: 0;">Booking Confirmed!</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #cccccc;">
          Hey ${userName},<br/><br/>
          Your jam session for <strong>${bandName}</strong> is locked and loaded. We've received your payment and secured your slots.
        </p>
        
        <div style="background-color: #1a1a1a; border-left: 4px solid #ff6600; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Official Ticket No.</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: #ff6600; letter-spacing: 4px;">${ticketNumber}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #888; width: 40%;">Date</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #333; font-weight: bold; text-align: right;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #888;">Time Slots</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #333; font-weight: bold; text-align: right;">${formattedSlots}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #888;">Total Amount</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #333; font-weight: bold; text-align: right; color: #4ade80;">₹${totalAmount}</td>
          </tr>
        </table>
        
        ${equipmentRequests ? `
        <div style="margin-bottom: 30px;">
          <p style="color: #888; font-size: 14px; margin-bottom: 5px;">Equipment Requests:</p>
          <p style="background-color: #222; padding: 15px; border-radius: 6px; margin: 0; font-size: 14px; color: #ddd;">${equipmentRequests}</p>
        </div>` : ''}

        <p style="font-size: 14px; color: #888; text-align: center; margin-top: 40px;">
          See you at the pad!<br/>
          <strong>Elf Studios Team</strong>
        </p>
      </div>
    </div>
  `;

  // Admin Email HTML
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ff6600;">New Booking Alert: ${bandName}</h2>
      <p>A new jam session has been successfully booked and paid for.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;">Ticket No:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${ticketNumber}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Band Name:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${bandName}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Booked By:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${userName} (${userEmail})</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${userPhone}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Date:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formattedDate}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Slots:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${formattedSlots}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Amount Paid:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">₹${totalAmount}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Equipment:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${equipmentRequests || "None"}</td></tr>
      </table>
    </div>
  `;

  try {
    // 1. Send to Customer
    await transporter.sendMail({
      from: \`"Elf Studios" <\${SMTP_EMAIL}>\`,
      to: userEmail,
      subject: \`Booking Confirmed - Ticket \${ticketNumber}\`,
      html: customerHtml,
    });

    // 2. Send to Admins
    if (ADMIN_EMAILS) {
      const adminList = ADMIN_EMAILS.split(",").map(e => e.trim());
      await transporter.sendMail({
        from: \`"Elf Studios System" <\${SMTP_EMAIL}>\`,
        to: adminList,
        subject: \`NEW BOOKING: \${bandName} - \${formattedDate}\`,
        html: adminHtml,
      });
    }

    console.log("Booking emails sent successfully.");
  } catch (error) {
    console.error("Error sending booking emails:", error);
  }
}
