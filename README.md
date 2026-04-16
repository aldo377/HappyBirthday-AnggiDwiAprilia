# 🎂 HappyBirthday-AnggiDwiAprilia

> **"A special birthday gift, built with love and code."**
> 
> Website ulang tahun interaktif dengan sistem game, AI assistant, dan kejutan NFC — dibuat sepenuh hati untuk orang yang paling spesial. ❤️

---

## 🌐 Live Demo

🔗 **[aldo377.github.io/HappyBirthday-AnggiDwiAprilia](https://aldo377.github.io/HappyBirthday-AnggiDwiAprilia)**

---

## ✨ Gambaran Umum

Website ini bukan website biasa. Ini adalah sebuah **pengalaman interaktif** yang dirancang seperti game, di mana penerimanya harus menyelesaikan misi-misi kecil untuk bisa membuka kado utama. Dibangun dengan HTML, CSS, dan JavaScript murni — tanpa framework — menggunakan desain **Neo-Brutalism** yang bold dan playful.

---

## 🗺️ Peta Halaman & Alur Website

```
suprise.html  ← (Tag NFC di baju / surprise tersembunyi)
      ↓
index.html    ← HALAMAN UTAMA (Login + AI Assistant)
      ↓
  [Butuh Username & Password — dapat dari game!]
      ↓
tutor.html    ← Baca Aturan Main
   ↙        ↘
flapy.html   200408.html
(Misi 1:     (Misi 2:
Flappy Bird) Game 2048)
      ↓           ↓
  Clue         Clue
 Username     Password
      ↓
happybirthday.html ← HALAMAN KADO UTAMA 🎁
      ↓
story1.html → story2.html → story3.html
(Chapter 1)   (Chapter 2)   (Chapter 3)
      ↓
igstory1.html → igstory1__2_.html
(Instagram Story Style)
```

---

## 📄 Deskripsi Setiap Halaman

### 🔐 `index.html` — Halaman Login Utama
Pintu gerbang utama website. Di sinilah semua keseruan dimulai.

**Fitur:**
- **Splash Screen** animasi kotak berputar yang muncul saat loading
- **Start Gate** — overlay "Hello Screen" yang harus diklik dulu sebelum masuk
- **🎵 Musik Background** — bisa dinyalakan/dimatikan lewat tombol kontrol
- **⚡ Lite Mode** — mode hemat baterai yang mematikan animasi partikel
- **🤖 AI Assistant (Gemini AI)** — chatbot yang berpura-pura jadi Aldo, bisa diajak ngobrol & minta clue (tapi nggak akan kasih password aslinya!)
- **Form Login** — wajib input Username + Password yang benar untuk masuk
- **Easter Egg / Cheat Code** — klik judul sebanyak 7x untuk VIP access 👑
- **Animasi Confetti** saat login berhasil
- **Efek Partikel Canvas** yang merespons klik layar
- **Efek Grain & Scanlines** untuk nuansa retro/zine
- **Tombol Ripple** — efek gelombang air di setiap tombol

---

### 📖 `tutor.html` — Halaman Tutorial & Aturan Main
Panduan lengkap cara bermain sebelum mulai misi.

**Fitur:**
- Kartu aturan berwarna-warni (Neo-Brutalism style)
- Tombol navigasi langsung ke Misi 1, Misi 2, dan halaman Login
- Layout otomatis berubah jadi **grid 2 kolom** di layar laptop/desktop
- Splash screen loading

---

### 🐦 `flapy.html` — Misi 1: Flappy Bird
Game Flappy Bird yang sudah dikustom. Capai skor tertentu untuk mendapatkan **Clue Username**.

**Fitur:**
- Gameplay Flappy Bird klasik
- Pop-up otomatis muncul berisi **clue username** saat skor tercapai

---

### 🧩 `200408.html` — Misi 2: Game 2048
Game puzzle 2048 yang sudah dikustom. Capai tile tertentu untuk mendapatkan **Clue Password**.

**Fitur:**
- Gameplay 2048 klasik (swipe/geser kotak angka)
- Clue password tersembunyi di dalam game

---

### 🎁 `happybirthday.html` — Halaman Kado Utama
Halaman paling spesial! Hanya bisa diakses setelah login berhasil.

**Fitur:**
- Ucapan ulang tahun penuh dengan kejutan visual
- Navigasi ke chapter-chapter cerita cinta

---

### 📖 `story1.html` — Chapter 1: Awal Ketemu
Halaman cerita bergaya artikel/blog tentang awal mula pertemuan.

**Fitur:**
- **Reading Progress Bar** di bagian atas layar
- **Dark Mode** toggle (terang/gelap)
- Splash screen loading
- Desain responsif penuh

---

### 📖 `story2.html` — Chapter 2
Lanjutan kisah — Chapter berikutnya dari cerita cinta.

---

### 📖 `story3.html` — Chapter 3
Penutup kisah — Chapter terakhir dari cerita yang mengharukan.

---

### 📸 `igstory1.html` & `igstory1__2_.html` — Instagram Story Style
Konten yang disajikan dalam format mirip Instagram Story — full-screen, portrait mode.

**Fitur:**
- Tampilan fullscreen seperti IG Story
- Animasi transisi antar slide

---

### 👕 `suprise.html` — Halaman Kejutan NFC
Halaman rahasia yang muncul saat tag NFC di baju dipindai oleh HP.

**Fitur:**
- Ilustrasi SVG baju + chip NFC animasi dengan gelombang sinyal
- Teks kejutan spesial
- Animasi floating emoji latar belakang
- Efek partikel ledakan saat layar diklik

---

## 🎨 Sistem Desain (Design System)

Website ini menggunakan tema **Neo-Brutalism** yang konsisten di semua halaman:

| Elemen | Detail |
|---|---|
| **Font** | Poppins (300, 400, 600, 800, 900) via Google Fonts |
| **Warna Utama** | `#f8f9fa` (background), `#111111` (teks & border) |
| **Aksen Pink** | `#ff6b8a` |
| **Aksen Biru** | `#4facfe` |
| **Aksen Hijau Neon** | `#ccff00` |
| **Aksen Kuning** | `#ffd166` |
| **Aksen Ungu** | `#c299fc` |
| **Border** | 4px solid hitam di semua elemen |
| **Shadow** | Hard drop shadow (bukan blur) — ciri khas Brutalism |

---

## 🛠️ Teknologi yang Digunakan

- **HTML5** — Struktur & konten
- **CSS3** — Animasi, variabel, flexbox, grid, `@keyframes`
- **Vanilla JavaScript** — Logika game, login, AI, partikel, dll
- **Canvas API** — Efek partikel & confetti
- **SVG** — Ilustrasi inline animasi
- **Google Fonts** — Tipografi Poppins
- **Gemini AI API** — AI Assistant di halaman login
- **NFC Web** — Tag NFC yang tertanam di baju fisik
- **GitHub Pages** — Hosting gratis & deployment otomatis

---

## 📁 Struktur File

```
HappyBirthday-AnggiDwiAprilia/
│
├── index.html          ← Halaman Login + AI
├── tutor.html          ← Tutorial & Aturan
├── flapy.html          ← Misi 1: Flappy Bird
├── 200408.html         ← Misi 2: Game 2048
├── happybirthday.html  ← Kado Utama 🎁
├── story1.html         ← Chapter 1
├── story2.html         ← Chapter 2
├── story3.html         ← Chapter 3
├── igstory1.html       ← IG Story 1
├── igstory1__2_.html   ← IG Story 2
└── suprise.html        ← Halaman NFC Tersembunyi
```

---

## 🔑 Cara Main (Untuk Penerima Kado)

1. **Buka link website** di HP kamu
2. Klik tombol di **Hello Screen** untuk masuk
3. Pergi ke halaman **Tutor** dan baca aturan mainnya
4. Mainkan **Misi 1 (Flappy Bird)** → Screenshot clue username-nya
5. Mainkan **Misi 2 (Game 2048)** → Screenshot clue password-nya
6. Kembali ke halaman **Login** dan masukkan username & password
7. Selamat! Kado utama sudah terbuka! 🎉

---

## 🚀 Cara Deploy (Untuk Developer)

### Menggunakan GitHub Pages (Cara Termudah)

1. **Fork** atau clone repo ini
2. Buka **Settings** → **Pages**
3. Pilih branch `main` → folder `/ (root)`
4. Klik **Save** — website langsung live!

### Modifikasi Konten

Untuk mengubah nama, password, atau konten cerita, edit file-file HTML langsung. Semua teks bisa dicari dengan `Ctrl+F` di code editor.

**Lokasi konfigurasi penting di `index.html`:**
```javascript
// Username yang diterima saat login
if (user === "Anggi Dwi Aprilia" || ...) {
    if (pass === "200408!") isSuccess = true;
}
```

---

## 💡 Fitur Masa Depan (Roadmap Tahunan)

Website ini dirancang untuk **diperbarui setiap tahun**. Berikut ide untuk versi berikutnya:
- [ ] Tambah galeri foto bersama dengan lightbox
- [ ] Countdown timer ke ulang tahun berikutnya
- [ ] Musik custom yang bisa dipilih
- [ ] Lebih banyak chapter cerita
- [ ] Halaman pesan suara / voice note

---

## 📞 Kontak & Lisensi Penggunaan

> **Website ini dibuat dengan tujuan personal sebagai kado ulang tahun.**
> 
> Kalau kamu ingin menggunakan konsep atau kode dari repo ini untuk membuat website serupa untuk orang yang kamu sayangi, silakan! Tapi tolong tetap cantumkan credit dan jangan dijual secara komersial.

**Kalau kamu mau pakai repo ini tapi bingung cara pakainya, langsung chat aja ya — siap bantu!**

📱 **WhatsApp:** [wa.me/6281252790018](https://wa.me/6281252790018)

---

## 👨‍💻 Dibuat Oleh

**Aldo Leo Saputra** — *"Dibuat dengan ❤️ oleh Orang Ganteng"*

🔗 GitHub: [@aldo377](https://github.com/aldo377)

---

<div align="center">

Made with ❤️ for **Anggi Dwi Aprilia** 

*Happy Birthday, Princess* 🎂✨

</div>
