# ZIMO: Microbe Defense

Game edukasi 3D hyper-casual runner / gate shooter bertema imunitas dan bakteri, dibuat sebagai modul pendukung ekosistem ZIMO (Gizi Mobile).

## Cara Menjalankan

1. Pastikan Node.js sudah terpasang, lalu jalankan `npm install` satu kali.
2. Klik dua kali `Jalankan ZIMO.bat`, atau
3. Buka terminal di folder ini lalu jalankan:

```powershell
npm run dev
```

Lalu buka `http://localhost:5173` di browser (Chrome / Edge / Safari).

Game juga bisa dibuka di HP dengan menghubungkan perangkat ke jaringan Wi-Fi yang sama, lalu jalankan `npm run dev -- --host` dan akses `http://IP-KOMPUTER:5173`.

## Kontrol

- Seret layar (drag) ke kiri / kanan untuk menggeser barisan leukosit.
- Tombol panah kiri / kanan atau `A` / `D` di desktop.
- Tembakan berjalan otomatis.
- `Esc` untuk menjeda permainan.

## Fitur

- 4 misi dengan bakteri berbeda: E. coli, S. mutans, S. enterica, H. pylori.
- Gerbang aritmatika nutrisi: tambah, kali, kurang, bagi.
- Formasi kerumunan leukosit dengan algoritma Fermat spiral.
- Pertempuran swarm dan bos ber-HP dengan fase kedua.
- Pickup probiotik: bonus leukosit dan shield.
- Kuis edukasi pasca-level dan kartu ensiklopedia mikroba.
- EXP ZIMO, rekor skor, dan penyimpanan progres lokal (localStorage).
- Efek suara sintetis (tanpa aset eksternal).

## Struktur

```text
index.html
styles.css
  src/
  main.jsx
  App.jsx
  core/       audio.js, storage.js
  data/       levels.js, trivia.js
  game/       game.js, crowd.js, track.js, enemies.js, projectiles.js, effects.js
  ui/         ui.js
```

## Teknologi

- Three.js (WebGL) untuk rendering 3D low-poly.
- React + Vite untuk entry point dan lifecycle aplikasi.
- HTML / CSS / JavaScript modular untuk UI dan gameplay.
- Data edukasi terpisah di `src/data/trivia.js`.
