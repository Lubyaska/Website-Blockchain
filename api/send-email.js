// Nodemailer implementation for sending email via SMTP (Gmail).
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  try {
    const { nama, email, pesan } = req.body || {};
    if (!nama || !email || !pesan) {
      return res.status(400).json({ success: false, message: 'Semua field harus diisi' });
    }

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;
    if (!user || !pass) {
      return res.status(500).json({ success: false, message: 'Email credentials are not configured (EMAIL_USER or EMAIL_PASSWORD missing)' });
    }

    // Create transporter using Gmail SMTP. For accounts with 2FA, use an App Password.
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    const mailOptions = {
      from: `${nama} <${user}>`,
      to: user, // send to owner's email
      subject: `Pesan dari ${nama} (Website Blockchain)`,
      html: `
        <h3>Pesan Baru dari Website Blockchain</h3>
        <p><strong>Nama:</strong> ${nama}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Pesan:</strong></p>
        <p>${(pesan || '').replace(/\n/g, '<br>')}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Pesan terkirim' });
  } catch (err) {
    console.error('send-email (nodemailer) error:', err);
    const message = (err && err.message) || 'Internal error';
    return res.status(500).json({ success: false, message });
  }
};
