# Website Blockchain

Proyek Website Blockchain - Implementasi blockchain dengan antarmuka web.

## 📁 Struktur Folder

```
Website-Blockchain/
├── index.html
├── app.js
├── style.css
└── README.md
```

## 🚀 Cara Menjalankan

1. Buka file `index.html` di browser Anda
2. Atau gunakan Live Server extension di VS Code

## 🚀 Deploy ke Vercel (mengirim email)

Project ini bisa dideploy ke Vercel. Untuk mengirim email dari form pada deployment Vercel kita menggunakan serverless function di `api/send-email.js` (Nodemailer / Gmail SMTP).

Langkah singkat:

- Push repository ke GitHub.
- Buat project baru di Vercel dan hubungkan ke repo tersebut.
- Di Vercel dashboard -> Project -> Settings -> Environment Variables tambahkan:
  - `EMAIL_USER` = `lubyaska.lietamenta@gmail.com`
  - `EMAIL_PASSWORD` = `<app password dari Google>`

Catatan penting tentang Gmail:
- Gmail memblokir akses aplikasi yang tidak aman. Jika akun Anda menggunakan 2-Step Verification (2FA), buat **App Password** di https://myaccount.google.com/apppasswords dan pakai nilai itu sebagai `EMAIL_PASSWORD`.
- Jika akun tidak menggunakan 2FA, Google telah menonaktifkan opsi "Less secure apps" untuk banyak akun — rekomendasi aman adalah mengaktifkan 2FA dan membuat App Password.
- Karena Anda memakai SMTP, pastikan `EMAIL_USER` dan `EMAIL_PASSWORD` diset di Environment Variables Vercel, lalu redeploy project.

Alternatif:
- Jika Anda ingin solusi yang lebih stabil dan khusus untuk deployment serverless, saya bisa bantu beralih ke provider transactional (SendGrid, Mailgun). Namun Anda meminta `nodemailer`, jadi default sekarang menggunakan Nodemailer/Gmail.

## 📝 Deskripsi

Proyek ini mendemonstrasikan implementasi blockchain dengan tampilan web interaktif.

## 👨‍💻 Author

Workshop Teknologi Blockchain

## 📄 License

MIT
