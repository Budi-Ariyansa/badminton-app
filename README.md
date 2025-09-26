# Badminton Calculator App

Aplikasi perhitungan biaya badminton per orang dengan fitur lengkap sesuai spesifikasi.

## Fitur

- ✅ Input tanggal dan jam bermain
- ✅ Dropdown pilihan lapangan dengan lokasi dan harga
- ✅ Dropdown pilihan shuttlecock dengan harga
- ✅ Card selection untuk jumlah pemain (1-8 orang)
- ✅ Card selection untuk rekening bank
- ✅ Perhitungan otomatis biaya per orang
- ✅ Export invoice ke JSON
- ✅ Import invoice dari JSON
- ✅ Share langsung ke WhatsApp
- ✅ Responsive design untuk desktop dan mobile
- ✅ SQLite database untuk penyimpanan data

## Cara Menjalankan

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize database:
   ```bash
   npm run init-db
   ```

3. Jalankan development server:
   ```bash
   npm run dev
   ```

4. Buka [http://localhost:3000](http://localhost:3000)

## Deploy ke Vercel

1. Push ke GitHub repository
2. Connect repository ke Vercel
3. Deploy otomatis akan berjalan

Atau gunakan Vercel CLI:
```bash
npm install -g vercel
vercel
```

## Database

Aplikasi menggunakan SQLite database untuk menyimpan:
- Data lapangan (courts)
- Data shuttlecock (shuttlecocks)
- Data bank (banks)
- Riwayat booking (bookings)

Database akan dibuat otomatis di `/data/badminton.db` saat pertama kali dijalankan.

## Struktur Aplikasi

- Responsive design menggunakan Tailwind CSS
- Next.js 14 dengan App Router
- TypeScript untuk type safety
- SQLite database untuk penyimpanan data
- Export static untuk compatibility dengan Vercel

## Cara Penggunaan

1. Pilih tanggal dan jam bermain
2. Pilih lapangan dari dropdown
3. Tentukan durasi bermain (jam)
4. Pilih jenis shuttlecock dan jumlahnya
5. Pilih jumlah pemain dengan card selection
6. Pilih rekening untuk transfer
7. Lihat perhitungan biaya per orang
8. Export, import, atau share invoice sesuai kebutuhan

## Admin Panel

Akses admin panel di `/admin` dengan kredensial:
- Username: `adminpbkm`
- Password: `adminpbkm1010`

Fitur admin:
- Kelola data lapangan
- Kelola data shuttlecock
- Kelola data bank
