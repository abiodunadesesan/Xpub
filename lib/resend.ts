import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY || "re_mock_key_for_development";
export const resend = new Resend(apiKey);

export interface ReservationEmailDetails {
  fullName: string;
  email: string;
  date: string;
  timeSlot: string;
  partySize: number;
  reservationId: string;
}

export function generateReservationEmailHtml(details: ReservationEmailDetails): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #09090b; color: #fafafa; margin: 0; padding: 40px 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #141417; border: 1px solid #f59e0b33; border-radius: 12px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .header { text-align: center; border-bottom: 1px solid #27272a; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: 800; color: #facc15; letter-spacing: 2px; text-transform: uppercase; }
          .title { font-size: 20px; color: #ffffff; margin-top: 12px; }
          .detail-box { background: #1c1c21; border-left: 4px solid #f59e0b; padding: 16px 20px; margin: 24px 0; border-radius: 4px; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; }
          .label { color: #a1a1aa; }
          .value { color: #facc15; font-weight: 600; }
          .footer { text-align: center; color: #71717a; font-size: 13px; margin-top: 32px; border-top: 1px solid #27272a; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚡ THE OBSIDIAN XPUB</div>
            <div class="title">Table Reservation Confirmed</div>
          </div>
          <p>Dear ${details.fullName},</p>
          <p>Your table reservation at <strong>The Obsidian XPub</strong> has been successfully booked. We look forward to hosting your party!</p>
          
          <div class="detail-box">
            <div class="detail-row"><span class="label">Booking Ref:</span> <span class="value">${details.reservationId.toUpperCase()}</span></div>
            <div class="detail-row"><span class="label">Date:</span> <span class="value">${details.date}</span></div>
            <div class="detail-row"><span class="label">Arrival Time:</span> <span class="value">${details.timeSlot}</span></div>
            <div class="detail-row"><span class="label">Party Size:</span> <span class="value">${details.partySize} Guests</span></div>
          </div>

          <p style="color: #a1a1aa; font-size: 14px;">Need to adjust your booking? Simply present this email or call our host stand directly.</p>
          
          <div class="footer">
            &copy; ${new Date().getFullYear()} The Obsidian XPub • 404 Amber Way, Downtown • Craft Taps & Gastropub Dining
          </div>
        </div>
      </body>
    </html>
  `;
}
