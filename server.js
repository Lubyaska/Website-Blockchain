const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Konfigurasi Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Route untuk mengirim email
app.post('/send-email', async (req, res) => {
    const { nama, email, pesan } = req.body;

    // Validasi input
    if (!nama || !email || !pesan) {
        return res.status(400).json({ success: false, message: 'Semua field harus diisi' });
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'lubyaska.lietamenta@gmail.com',
            subject: `Pesan dari ${nama}`,
            html: `
                <h2>Pesan Baru dari Website Blockchain</h2>
                <p><strong>Nama:</strong> ${nama}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Pesan:</strong></p>
                <p>${pesan.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><em>Pesan ini dikirim dari Website Blockchain</em></p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            success: true, 
            message: 'Pesan berhasil dikirim!' 
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Gagal mengirim pesan: ' + error.message 
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
