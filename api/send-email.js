const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  try {
    const { nama, email, pesan } = req.body || {};
    if (!nama || !email || !pesan) {
      return res.status(400).json({ success: false, message: 'Semua field harus diisi' });
    }

    // transporter menggunakan environment variables yang disetel di Vercel
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // kirim ke email Anda sendiri
      subject: `Pesan dari ${nama}`,
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
    console.error('send-email error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal error' });
  }
};
