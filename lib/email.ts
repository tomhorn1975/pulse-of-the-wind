import { Resend } from 'resend'

export async function sendTicketConfirmation({
  to,
  buyerName,
  itemName,
  ticketNumbers,
  raffleDate,
}: {
  to: string
  buyerName: string
  itemName: string
  ticketNumbers: string[]
  raffleDate: string
}) {
  const ticketList = ticketNumbers.map(t => `• ${t}`).join('\n')
  const eventName = process.env.NEXT_PUBLIC_EVENT_NAME || 'Pulse of the Wind Raffle'
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL || 'https://tjsrace.com'
  const resend   = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `🎟️ Your ${eventName} Tickets`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1e293b;">
  <div style="background:linear-gradient(135deg,#0d9488,#0ea5e9);border-radius:12px;padding:28px;text-align:center;color:white;margin-bottom:24px;">
    <div style="font-size:36px;margin-bottom:8px;">🌬️</div>
    <h1 style="margin:0;font-size:22px;">${eventName}</h1>
    <p style="margin:8px 0 0;opacity:.85;">Thank you for your support!</p>
  </div>
  <p>Hi <strong>${buyerName}</strong>,</p>
  <p>You're entered in the raffle for:</p>
  <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;padding:16px;margin:16px 0;">
    <strong style="font-size:16px;">${itemName}</strong>
  </div>
  <p>Your ticket number${ticketNumbers.length > 1 ? 's' : ''}:</p>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;font-family:monospace;font-size:14px;line-height:2;">
    ${ticketNumbers.map(t => `<div>🎟️ <strong>${t}</strong></div>`).join('')}
  </div>
  <p style="color:#64748b;font-size:13px;margin-top:16px;">
    Drawing date: <strong>${raffleDate}</strong><br/>
    Tickets will be printed and added to the drawing bucket along with event-day tickets.<br/>
    No need to be present to win — we'll contact you if you win!
  </p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
  <p style="text-align:center;font-size:12px;color:#94a3b8;">
    <a href="${appUrl}" style="color:#0d9488;">${appUrl}</a>
  </p>
</body>
</html>`,
  })
}
