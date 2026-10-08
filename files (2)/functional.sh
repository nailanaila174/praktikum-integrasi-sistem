#!/bin/bash
H='Content-Type: application/json'; U=http://127.0.0.1:4000
t(){ echo "== $1"; shift; curl -s -w '\nHTTP %{http_code}\n' "$@"; }
echo "STOK AWAL:"; curl -s $U/_state; echo
t FT-01 -X POST $U/orders -H "$H" -d '{"product_id":"P001","quantity":2}'
echo "STOK:"; curl -s $U/_state; echo
t FT-02 -X POST $U/orders -H "$H" -d '{"product_id":"P001","quantity":50}'
echo "STOK:"; curl -s $U/_state; echo
t FT-03 -X POST $U/orders -H "$H" -d '{"product_id":"P999","quantity":1}'
t FT-04 -X POST $U/orders -H "$H" -d '{"product_id":"P001"}'
t FT-05 -X POST $U/orders -H "$H" -d '{"product_id":"P001","quantity":"dua"}'
echo "STOK sebelum FT-06:"; curl -s $U/_state; echo
t "FT-06 (kirim ke-1)" -X POST $U/orders -H "$H" -H 'Idempotency-Key: abc-123' -d '{"product_id":"P001","quantity":1}'
t "FT-06 (kirim ke-2)" -X POST $U/orders -H "$H" -H 'Idempotency-Key: abc-123' -d '{"product_id":"P001","quantity":1}'
echo "STOK akhir:"; curl -s $U/_state; echo
