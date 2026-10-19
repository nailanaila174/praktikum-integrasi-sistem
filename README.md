# Praktikum Integrasi Sistem: Uji Fungsional dan Uji Beban

Pengujian integrasi Client, Order Service, dan Inventory Service melalui REST API.
Data uji sintetis; semua layanan berjalan lokal.

## Isi folder `files (2)`
- `services.js`: Order Service (port 4000) dan Inventory Service (port 4001)
- `functional.sh`: uji fungsional FT-01 s.d. FT-06
- `functional_output.txt`: keluaran uji fungsional
- `load.js`: skrip uji beban k6
- `result_1.json`, `result_5.json`, `result_10.json`: hasil uji beban

## Prasyarat
Node.js 18 atau lebih baru, k6, curl, dan bash (Git Bash di Windows).

## Cara mengulang
1. Jalankan layanan di terminal pertama (biarkan terbuka):
```
   node services.js
```
2. Uji fungsional (terminal kedua, Git Bash). Restart `services.js` dulu agar stok P001 kembali 10:
```
   bash functional.sh > functional_output.txt
```
3. Uji beban 60 detik, satu per satu:
```
   k6 run -e VUS=1 load.js
   k6 run -e VUS=5 load.js
   k6 run -e VUS=10 load.js
```
   Hasil ditulis ke `result_1.json`, `result_5.json`, dan `result_10.json`.

## Catatan
Layanan Inventory mensimulasikan latensi 15 ms per panggilan.
