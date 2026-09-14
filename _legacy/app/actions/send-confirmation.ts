"use server";

import { resend, generateReservationEmailHtml, ReservationEmailDetails } from "@/lib/resend";

export async function sendReservationConfirmation(details: ReservationEmailDetails) {
  try {
    const htmlContent = generateReservationEmailHtml(details);

    if (!process.env.RESEND_API_KEY) {
      console.log("=== [RESEND EMAIL SIMULATION] ===");
      console.log(`To: ${details.email}`);
      console.log(`Subject: Reservation Confirmed - The Obsidian XPub (${details.date} @ ${details.timeSlot})`);
      console.log(`Reservation ID: ${details.reservationId}`);
      console.log("==================================");
      return { success: true, simulated: true };
    }

    const response = await resend.emails.send({
      from: "The Obsidian XPub <reservations@xpub-gastropub.com>",
      to: [details.email],
      subject: `Reservation Confirmed - The Obsidian XPub (${details.date} @ ${details.timeSlot})`,
      html: htmlContent,
    });

    return { success: true, data: response };
  } catch (error: any) {
    console.error("Error sending reservation confirmation email via Resend:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}
