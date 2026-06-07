/* Gráficos locales sin conexión externa. Sustituye Chart.js para evitar llamadas a cdnjs.cloudflare.com. */
class Chart {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config || {};
    this.draw();
  }
  destroy() {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  resize() {
    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(280, rect.width || 320);
    const height = Math.max(180, rect.height || 240);
    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width, height };
  }
  draw() {
    if (!this.ctx) return;
    const size = this.resize();
    this.ctx.clearRect(0, 0, size.width, size.height);
    const type = this.config.type || 'bar';
    if (type === 'doughnut') return this.drawDoughnut(size);
    if (type === 'line') return this.drawLine(size);
    return this.drawBar(size);
  }
  datasets() { return (this.config.data && this.config.data.datasets) || []; }
  labels() { return (this.config.data && this.config.data.labels) || []; }
  colors(n, dsIndex = 0) {
    const palette = ['#4a9eff','#2ecc71','#e74c3c','#f39c12','#9b59b6','#1abc9c','#e67e22','#16a085'];
    const ds = this.datasets()[dsIndex] || {};
    const bg = ds.backgroundColor || ds.borderColor || palette;
    if (Array.isArray(bg)) return bg[n % bg.length] || palette[n % palette.length];
    return bg || palette[n % palette.length];
  }
  text(color = '#a0a0c0', size = 11) {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px Segoe UI, system-ui, sans-serif`;
  }
  maxVal() {
    const vals = [];
    this.datasets().forEach(ds => (ds.data || []).forEach(v => vals.push(Number(v) || 0)));
    return Math.max(1, ...vals);
  }
  drawGrid(left, top, width, height, max) {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    this.text('#6060a0', 10);
    for (let i = 0; i <= 4; i++) {
      const y = top + height - (height * i / 4);
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + width, y); ctx.stroke();
      const val = Math.round(max * i / 4);
      ctx.fillText(val + '€', 8, y + 3);
    }
  }
  drawBar({width, height}) {
    const ctx = this.ctx, labels = this.labels(), datasets = this.datasets();
    const left = 54, right = 14, top = 18, bottom = 36;
    const w = width - left - right, h = height - top - bottom;
    const max = this.maxVal() * 1.15;
    this.drawGrid(left, top, w, h, max);
    const groupCount = Math.max(1, labels.length);
    const groupW = w / groupCount;
    const dsCount = Math.max(1, datasets.length);
    datasets.forEach((ds, di) => {
      (ds.data || []).forEach((raw, i) => {
        const v = Math.max(0, Number(raw) || 0);
        const barW = Math.max(8, groupW * 0.65 / dsCount);
        const x = left + i * groupW + groupW * 0.18 + di * barW;
        const bh = h * (v / max);
        const y = top + h - bh;
        ctx.fillStyle = this.colors(i, di);
        this.roundRect(x, y, barW * 0.88, bh, 5);
        ctx.fill();
      });
    });
    this.text('#a0a0c0', 10);
    labels.forEach((lab, i) => {
      const x = left + i * groupW + groupW / 2;
      ctx.save(); ctx.textAlign = 'center';
      ctx.fillText(String(lab).slice(0, 12), x, height - 12);
      ctx.restore();
    });
  }
  drawLine({width, height}) {
    const ctx = this.ctx, labels = this.labels(), ds = this.datasets()[0] || {data:[]};
    const data = (ds.data || []).map(v => Number(v) || 0);
    const left = 54, right = 16, top = 18, bottom = 36;
    const w = width - left - right, h = height - top - bottom;
    const max = Math.max(1, ...data) * 1.15;
    this.drawGrid(left, top, w, h, max);
    const step = data.length > 1 ? w / (data.length - 1) : w;
    const pts = data.map((v, i) => [left + i * step, top + h - h * (v / max)]);
    if (!pts.length) return;
    ctx.strokeStyle = ds.borderColor || '#4a9eff'; ctx.lineWidth = 2;
    ctx.beginPath(); pts.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.stroke();
    const grad = ctx.createLinearGradient(0, top, 0, top+h);
    grad.addColorStop(0, 'rgba(74,158,255,0.24)'); grad.addColorStop(1, 'rgba(74,158,255,0.02)');
    ctx.lineTo(left + w, top+h); ctx.lineTo(left, top+h); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
    pts.forEach(([x,y]) => { ctx.beginPath(); ctx.fillStyle = ds.borderColor || '#4a9eff'; ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill(); });
    this.text('#a0a0c0', 10); ctx.textAlign = 'center';
    labels.forEach((lab, i) => ctx.fillText(String(lab).slice(0, 8), left + i * step, height - 12));
    ctx.textAlign = 'left';
  }
  drawDoughnut({width, height}) {
    const ctx = this.ctx, labels = this.labels(), ds = this.datasets()[0] || {data:[]};
    const data = (ds.data || []).map(v => Math.max(0, Number(v) || 0));
    const total = data.reduce((a,b)=>a+b,0) || 1;
    const cx = width * 0.35, cy = height * 0.50, r = Math.min(width * 0.24, height * 0.34), inner = r * 0.58;
    let angle = -Math.PI / 2;
    data.forEach((v, i) => {
      const a2 = angle + (v / total) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, angle, a2); ctx.closePath(); ctx.fillStyle = this.colors(i, 0); ctx.fill();
      angle = a2;
    });
    ctx.beginPath(); ctx.fillStyle = '#16162a'; ctx.arc(cx, cy, inner, 0, Math.PI*2); ctx.fill();
    this.text('#a0a0c0', 11);
    const lx = width * 0.62; let ly = Math.max(26, cy - Math.min(70, labels.length*11));
    labels.forEach((lab, i) => {
      ctx.fillStyle = this.colors(i,0); ctx.fillRect(lx, ly-9, 10, 10);
      ctx.fillStyle = '#a0a0c0'; ctx.fillText(String(lab).slice(0, 28), lx + 16, ly);
      ly += 20;
    });
  }
  roundRect(x, y, w, h, r) {
    const ctx = this.ctx; r = Math.min(r, w/2, h/2);
    ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
  }
}
window.addEventListener('resize', () => { if (window.charts) Object.values(window.charts).forEach(c => c && c.draw && c.draw()); });
