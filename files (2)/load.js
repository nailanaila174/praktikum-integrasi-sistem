import http from 'k6/http';
import { check } from 'k6';
export const options = {
  vus: Number(__ENV.VUS), duration: '60s',
  thresholds: { http_req_duration: ['p(95)<500'], http_req_failed: ['rate<0.01'] },
};
export default function () {
  const r = http.post('http://127.0.0.1:4000/orders', JSON.stringify({ product_id: 'P002', quantity: 1 }), { headers: { 'Content-Type': 'application/json' } });
  check(r, { 'status 201': (x) => x.status === 201 });
}
export function handleSummary(d) {
  const m = d.metrics;
  const out = { vus: __ENV.VUS, total: m.http_reqs.values.count, failed_rate: m.http_req_failed.values.rate,
    avg: m.http_req_duration.values.avg, p95: m.http_req_duration.values['p(95)'], rps: m.http_reqs.values.rate,
    checks_passes: m.checks.values.passes, checks_fails: m.checks.values.fails };
  return { [`result_${__ENV.VUS}.json`]: JSON.stringify(out, null, 1) };
}
