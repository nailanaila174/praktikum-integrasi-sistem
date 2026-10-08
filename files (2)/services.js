// Layanan tiruan: Inventory Service (4001) dan Order Service (4000). Data uji sintetis.
const http = require('http');
const DB_DELAY_MS = 15; // simulasi latensi query basis data
const stock = { P001: 10, P002: 10000000 };
const orders = []; const idem = new Map();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const send = (res, code, obj) => { res.writeHead(code, {'Content-Type':'application/json'}); res.end(JSON.stringify(obj)); };
const body = req => new Promise(r => { let d=''; req.on('data',c=>d+=c); req.on('end',()=>{ try{r(JSON.parse(d||'{}'))}catch{r(null)} }); });

http.createServer(async (req, res) => { // Inventory
  const m = req.url.match(/^\/inventory\/([^/]+)(\/reduce)?$/);
  if (!m) return send(res, 404, {error:'not found'});
  await sleep(DB_DELAY_MS);
  const id = m[1];
  if (!(id in stock)) return send(res, 404, {error:'produk tidak ditemukan'});
  if (req.method === 'GET') return send(res, 200, {product_id:id, stock:stock[id]});
  if (req.method === 'POST' && m[2]) { const b = await body(req);
    if (stock[id] < b.quantity) return send(res, 409, {error:'stok tidak cukup'});
    stock[id] -= b.quantity; return send(res, 200, {product_id:id, stock:stock[id]}); }
  send(res, 405, {error:'method not allowed'});
}).listen(4001);

const inv = (method, path, data) => new Promise((resolve, reject) => {
  const r = http.request({host:'127.0.0.1', port:4001, path, method, headers:{'Content-Type':'application/json'}, timeout:2000, agent: new http.Agent({keepAlive:true})}, res => {
    let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode, data:JSON.parse(d)})); });
  r.on('timeout',()=>{r.destroy(new Error('timeout'))}); r.on('error',reject);
  if (data) r.write(JSON.stringify(data)); r.end();
});

http.createServer(async (req, res) => { // Order
  if (req.url === '/_state') return send(res, 200, {orders:orders.length, stock});
  if (req.method !== 'POST' || req.url !== '/orders') return send(res, 404, {error:'not found'});
  const b = await body(req);
  if (!b || typeof b.product_id !== 'string' || b.quantity === undefined) return send(res, 422, {error:'product_id dan quantity wajib diisi'});
  if (!Number.isInteger(b.quantity) || b.quantity <= 0) return send(res, 422, {error:'quantity harus bilangan bulat positif'});
  const key = req.headers['idempotency-key'];
  if (key && idem.has(key)) return send(res, 200, idem.get(key));
  try {
    const chk = await inv('GET', `/inventory/${b.product_id}`);
    if (chk.status === 404) return send(res, 404, {error:'produk tidak ditemukan'});
    if (chk.data.stock < b.quantity) return send(res, 409, {error:'stok tidak cukup'});
    const red = await inv('POST', `/inventory/${b.product_id}/reduce`, {quantity:b.quantity});
    if (red.status !== 200) return send(res, 409, {error:'stok tidak cukup'});
    const o = {order_id: orders.length+1, product_id:b.product_id, quantity:b.quantity, status:'CREATED'};
    orders.push(o); if (key) idem.set(key, o);
    send(res, 201, o);
  } catch (e) { send(res, 504, {error:'inventory timeout'}); }
}).listen(4000, () => console.log('ready'));
