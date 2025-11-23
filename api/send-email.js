// Switched to SendGrid for reliable delivery in serverless environments.
const sendgrid = require('@sendgrid/mail');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  try {
    const { nama, email, pesan } = req.body || {};
    if (!nama || !email || !pesan) {
      return res.status(400).json({ success: false, message: 'Semua field harus diisi' });
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    const from = process.env.SENDGRID_FROM || process.env.EMAIL_USER;
    if (!apiKey || !from) {
      return res.status(500).json({ success: false, message: 'SendGrid not configured (SENDGRID_API_KEY or SENDGRID_FROM missing)' });
    }

    sendgrid.setApiKey(apiKey);

    const msg = {
      to: from,
      from: from,
      subject: `Pesan dari ${nama} (Website Blockchain)`,
      html: `
        <h3>Pesan Baru dari Website Blockchain</h3>
        <p><strong>Nama:</strong> ${nama}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Pesan:</strong></p>
        <p>${(pesan || '').replace(/\n/g, '<br>')}</p>
      `,
    };

    await sendgrid.send(msg);
    return res.status(200).json({ success: true, message: 'Pesan terkirim' });
  } catch (err) {
    console.error('send-email (sendgrid) error:', err);
    const message = (err && err.message) || 'Internal error';
    return res.status(500).json({ success: false, message });
  }
};
