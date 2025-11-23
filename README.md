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

Project ini bisa dideploy ke Vercel. Untuk mengirim email dari form pada deployment Vercel kita menggunakan serverless function di `api/send-email.js` (nodemailer).

Langkah singkat:

- Push repository ke GitHub.
- Buat project baru di Vercel dan hubungkan ke repo tersebut.
- Di Vercel dashboard -> Project -> Settings -> Environment Variables tambahkan:
	- `EMAIL_USER` = `lubyaska.lietamenta@gmail.com`
	- `EMAIL_PASSWORD` = `<app password dari Google>`

Catatan:
- Gunakan **App Password** dari Google (https://myaccount.google.com/apppasswords). App Password diperlukan jika akun menggunakan 2FA.
- Vercel menjalankan fungsi sebagai serverless — tidak ada server Express yang selalu hidup. Form di frontend melakukan POST ke `/api/send-email` yang dijalankan sebagai function.
- Untuk beban produksi atau pengiriman email skala besar, pertimbangkan provider email transactional (SendGrid, Mailgun, Postmark) karena batas dan deliverability.

## 📝 Deskripsi

Proyek ini mendemonstrasikan implementasi blockchain dengan tampilan web interaktif.

## 👨‍💻 Author

Workshop Teknologi Blockchain

## 📄 License

MIT
