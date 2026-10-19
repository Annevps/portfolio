// ===== COLE AQUI SEUS DADOS DO SUPABASE (os mesmos que você já usa) =====
const SUPABASE_URL = "https://khktnihmmjdnjosnqkls.supabase.co";
const SUPABASE_KEY = "sb_publishable_G7eu65EA3s8SrP633y1bDQ_0k-FOSJJ";
// =======================================================================

document.documentElement.classList.add("js");
const sb = window.supabase ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const $ = (s) => document.querySelector(s);
const esc = (s) => { const d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; };
const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");

// menu mobile
const burger = $(".burger");
if (burger) burger.onclick = () => $(".links").classList.toggle("open");

// animação ao rolar
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
const observe = () => document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
observe();

// ---------- projetos ----------
let projetos = [];

function tagsHtml(t) {
  return (t || "").split(",").map((x) => x.trim()).filter(Boolean).map((x) => `<span>${esc(x)}</span>`).join("");
}
function imgHtml(p) {
  return p.imagem ? `<img src="${esc(p.imagem)}" alt="${esc(p.titulo)}" loading="lazy">` : `<div class="ph">${esc((p.titulo || "?")[0])}</div>`;
}
function cardHtml(p, i) {
  return `<article class="pcard reveal" data-i="${i}" tabindex="0">
    <div class="im">${imgHtml(p)}</div>
    <div class="bd"><h3>${esc(p.titulo)}</h3><div class="tags">${tagsHtml(p.tecnologias)}</div></div></article>`;
}

async function carregarProjetos(alvo, limite) {
  const el = document.querySelector(alvo);
  if (!el) return;
  if (!sb) { el.innerHTML = '<p style="color:var(--mu)">Conexão com o banco indisponível.</p>'; return; }
  let q = sb.from("projetos").select("*").order("created_at", { ascending: false });
  if (limite) q = q.limit(limite);
  const { data, error } = await q;
  if (error) { el.innerHTML = '<p style="color:var(--mu)">Erro ao carregar projetos.</p>'; return; }
  projetos = data;
  el.innerHTML = data.length ? data.map(cardHtml).join("") : '<p style="color:var(--mu)">Nenhum projeto publicado ainda.</p>';
  observe();
  el.onclick = (e) => { const c = e.target.closest(".pcard"); if (c) abrirModal(projetos[c.dataset.i]); };
  el.onkeydown = (e) => { if (e.key === "Enter") { const c = e.target.closest(".pcard"); if (c) abrirModal(projetos[c.dataset.i]); } };
}

function abrirModal(p) {
  let m = $("#modal");
  if (!m) { m = document.createElement("div"); m.id = "modal"; document.body.appendChild(m); m.onclick = (e) => { if (e.target === m) m.classList.remove("open"); }; }
  const url = safeUrl(p.link);
  const titulo = url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(p.titulo)} ↗</a>` : esc(p.titulo);
  m.innerHTML = `<div class="mbox"><button class="x" aria-label="Fechar">✕</button>
    ${p.imagem ? `<div class="im">${imgHtml(p)}</div>` : ""}
    <div class="mbody"><h3>${titulo}</h3><p>${esc(p.descricao || "Sem descrição.")}</p><div class="tags">${tagsHtml(p.tecnologias)}</div></div></div>`;
  m.classList.add("open");
  m.querySelector(".x").onclick = () => m.classList.remove("open");
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("#modal")?.classList.remove("open"); });

carregarProjetos("#destaques", 3);
carregarProjetos("#todos", 0);

// ---------- contato ----------
const form = $("#contatoForm");
if (form) form.onsubmit = async (e) => {
  e.preventDefault();
  const msg = $("#msg");
  if (!sb) { msg.textContent = "Banco indisponível."; return; }
  msg.style.color = "var(--mu)"; msg.textContent = "Enviando…";
  const { error } = await sb.from("mensagens").insert({
    nome: form.nome.value.trim(), email: form.email.value.trim(), mensagem: form.mensagem.value.trim(),
  });
  if (error) { msg.style.color = "#ef7b7b"; msg.textContent = "Não foi possível enviar. Tente de novo."; return; }
  form.reset(); msg.style.color = "var(--c1)"; msg.textContent = "Mensagem enviada! Responderei em breve. ✓";
};

// ===== v2: animações =====
// barra de progresso
const prog = document.getElementById("prog");
addEventListener("scroll", () => { const h = document.documentElement; if (prog) prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100 + "%"; }, { passive: true });

// spotlight nos cards
document.addEventListener("mousemove", (e) => {
  const c = e.target.closest && e.target.closest(".card,.pcard");
  if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty("--mx", e.clientX - r.left + "px");
  c.style.setProperty("--my", e.clientY - r.top + "px");
});

// contadores
function contar(el) {
  const to = +el.dataset.to, sfx = el.dataset.sfx || "", t0 = performance.now();
  const f = (t) => { const p = Math.min((t - t0) / 1500, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + sfx; if (p < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}
const io2 = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { contar(e.target); io2.unobserve(e.target); } }), { threshold: 0.6 });
document.querySelectorAll("[data-to]").forEach((el) => io2.observe(el));

// texto digitando
const typed = document.getElementById("typed");
if (typed) {
  const frases = ["// olá, eu sou a Anne", "// desenvolvedora web", "// SEO + GEO + semântica", "// vamos criar algo incrível?"];
  let i = 0, j = 0, apagando = false;
  (function tick() {
    const f = frases[i];
    typed.textContent = f.slice(0, j);
    if (!apagando && j === f.length) { apagando = true; return setTimeout(tick, 1600); }
    if (apagando && j === 0) { apagando = false; i = (i + 1) % frases.length; }
    j += apagando ? -1 : 1;
    setTimeout(tick, apagando ? 35 : 75);
  })();
}

// rede de partículas no hero
const cv = document.getElementById("net");
if (cv && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
  const ctx = cv.getContext("2d"); let W, H, pts = [], mouse = { x: -999, y: -999 };
  const size = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; pts = Array.from({ length: Math.min(70, Math.floor(W / 18)) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45 })); };
  size(); addEventListener("resize", size);
  cv.parentElement.addEventListener("mousemove", (e) => { const r = cv.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.fillStyle = "rgba(34,211,238,.7)"; ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 7); ctx.fill();
      for (let k = i + 1; k < pts.length; k++) {
        const q = pts[k], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 120) { ctx.strokeStyle = `rgba(139,92,246,${.35 * (1 - d / 120)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 150) { ctx.strokeStyle = `rgba(34,211,238,${.5 * (1 - dm / 150)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    });
    requestAnimationFrame(draw);
  })();
}
