const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    // CORS preflight handling
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    // Only accept POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body || '{}');
        const { name, email, phone, service_type, requirements_url, payment_url } = data;

        if (!name || !email) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Name and Email are required' })
            };
        }

        // Gmail SMTP credentials
        const gmailUser = process.env.GMAIL_USER || 'ubaidabbasi291@gmail.com';
        const gmailPass = (process.env.GMAIL_APP_PASS || 'bxkl stjp ttjp ccwn').replace(/\s+/g, '');

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: gmailUser,
                pass: gmailPass
            },
            tls: { rejectUnauthorized: false }
        });

        const now = new Date().toLocaleString('en-PK', {
            timeZone: 'Asia/Karachi',
            dateStyle: 'full',
            timeStyle: 'short'
        });

        const reqLink = requirements_url
            ? `<a href="${requirements_url}" target="_blank" style="color:#00e676;">View Requirements File</a>`
            : '<span style="color:#888;">Not Attached</span>';

        const payLink = payment_url
            ? `<a href="${payment_url}" target="_blank" style="color:#00e676;">View Payment Slip</a>`
            : '<span style="color:#888;">Not Attached</span>';

        const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0d14;font-family:Arial,sans-serif;">
  <div style="max-width:620px;margin:30px auto;background:#07090e;border-radius:14px;border:1px solid rgba(0,242,254,0.3);overflow:hidden;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#00f2fe22,#4facfe11);padding:28px 30px;border-bottom:1px solid rgba(0,242,254,0.2);text-align:center;">
      <h1 style="margin:0;color:#00f2fe;font-size:22px;letter-spacing:1px;">&#128640; New Commission Inquiry!</h1>
      <p style="margin:6px 0 0;color:#b3bac5;font-size:13px;">UBAIDDEV Portfolio — Direct Lead Alert</p>
      <p style="margin:4px 0 0;color:#666;font-size:12px;">${now}</p>
    </div>

    <!-- Client Details -->
    <div style="padding:24px 30px;">
      <h3 style="color:#00f2fe;margin:0 0 16px;font-size:15px;text-transform:uppercase;letter-spacing:1px;">Client Information</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:6px;color:#b3bac5;font-size:13px;width:38%;border-bottom:1px solid rgba(255,255,255,0.05);">Full Name</td>
          <td style="padding:10px 14px;background:rgba(255,255,255,0.03);color:#00f2fe;font-size:14px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.05);">${name}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;color:#b3bac5;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05);">Email</td>
          <td style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);"><a href="mailto:${email}" style="color:#4facfe;text-decoration:none;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding:10px 14px;background:rgba(255,255,255,0.03);color:#b3bac5;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05);">Phone / WhatsApp</td>
          <td style="padding:10px 14px;background:rgba(255,255,255,0.03);color:#00e676;font-size:14px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.05);">${phone || 'Not Provided'}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;color:#b3bac5;font-size:13px;">Service Requested</td>
          <td style="padding:10px 14px;color:#ff007a;font-size:14px;font-weight:bold;">${service_type || 'Custom Solution'}</td>
        </tr>
      </table>
    </div>

    <!-- Attached Files -->
    <div style="padding:0 30px 24px;">
      <h3 style="color:#00f2fe;margin:0 0 14px;font-size:15px;text-transform:uppercase;letter-spacing:1px;">Attached Files</h3>
      <div style="background:rgba(0,242,254,0.04);border:1px dashed rgba(0,242,254,0.25);border-radius:10px;padding:16px 18px;">
        <p style="margin:0 0 10px;color:#b3bac5;font-size:13px;"><strong style="color:#fff;">Requirements Document:</strong><br>${reqLink}</p>
        <p style="margin:0;color:#b3bac5;font-size:13px;"><strong style="color:#fff;">Payment / Advance Slip:</strong><br>${payLink}</p>
      </div>
    </div>

    <!-- WhatsApp CTA -->
    <div style="padding:0 30px 28px;text-align:center;">
      <a href="https://wa.me/${(phone || '').replace(/[^0-9]/g, '')}" style="display:inline-block;background:#25d366;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">&#128172; Chat with ${name} on WhatsApp</a>
    </div>

    <!-- Footer -->
    <div style="background:rgba(255,255,255,0.02);padding:16px 30px;text-align:center;border-top:1px solid rgba(255,255,255,0.07);">
      <p style="margin:0;color:#555;font-size:12px;">UBAIDDEV Portfolio Auto-Mailer &mdash; <a href="https://ubaiddeve.netlify.app" style="color:#00f2fe;text-decoration:none;">ubaiddeve.netlify.app</a></p>
    </div>

  </div>
</body>
</html>`;

        await transporter.sendMail({
            from: `"UBAIDDEV Inquiries" <${gmailUser}>`,
            to: 'ubaidabbasi291@gmail.com',
            replyTo: email,
            subject: `[New Order] ${name} - ${service_type || 'Project Inquiry'}`,
            html: htmlContent
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ success: true, message: 'Email sent successfully via Gmail SMTP!' })
        };

    } catch (err) {
        console.error('Nodemailer error:', err);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: err.message })
        };
    }
};
