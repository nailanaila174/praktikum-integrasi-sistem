Cara mengulang pengujian (Node.js >= 18 dan k6 terpasang):
1. node services.js            # menjalankan Inventory (4001) dan Order (4000)
2. ./functional.sh             # uji fungsional FT-01 s.d. FT-06
3. VUS=1  k6 run load.js       # uji beban 60 detik; ulangi dengan VUS=5 dan VUS=10
Catatan: restart services.js sebelum mengulang uji fungsional agar stok P001 kembali 10.
