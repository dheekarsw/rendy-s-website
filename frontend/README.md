# Portfolio frontend (React + Vite)

Untuk dokumentasi yang sesuai dengan versi **JWT + FastAPI + MongoDB + Cloudinary** yang sudah diperbaiki, lihat **[`../README_FIXES.md`](../README_FIXES.md)**. Dokumentasi lama sebelum penambahan autentikasi tidak lagi berlaku.

## Quickstart

1. `npm ci`
2. `cp .env.example .env` (PowerShell: `Copy-Item .env.example .env`)
3. Atur `VITE_PORTFOLIO_API_MODE=fastapi` dan `VITE_API_BASE_URL=http://127.0.0.1:8000`.
4. Pastikan backend, database, dan Cloudinary sudah dikonfigurasi dan FastAPI berjalan.
5. `npm run dev`, lalu login di `/admin/login`.

Public pages tetap terbuka tanpa login. Route admin dan semua operasi modifikasi di FastAPI memerlukan JWT.
