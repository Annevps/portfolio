/* =====================================================================
   app.js — um único script para o site inteiro
   A chave "sb_publishable" é pública por design. NUNCA coloque aqui
   uma chave "sb_secret" ou "service_role".
===================================================================== */
const SUPABASE_URL = "https://khktnihmmjdnjosnqkls.supabase.co";
const SUPABASE_KEY = "sb_publishable_G7eu65EA3s8SrP633y1bDQ_0k-FOSJJ";

const $ = (id) => document.getElementById(id);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = (u) => { try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch { return ""; } };
const db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Menu no celular ---------- */
const burger = $("burger"), nav = $("nav");
if (burger) burger.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});

/* ---------- Barra de progresso + sombra do cabeçalho ---------- */
const bar = document.createElement("div");
bar.className = "scroll-bar";
document.body.prepend(bar);
function onScroll() {
  const h = document.documentElement, max = h.scrollHeight - h.clientHeight;
  bar.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
  document.querySelector("header").classList.toggle("scrolled", h.scrollTop > 8);
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Aparecer ao rolar ---------- */
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.style.transitionDelay = (Number(e.target.dataset.i) || 0) * 70 + "ms";
  e.target.classList.add("visible");
  io.unobserve(e.target);
}), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

function watchReveal(root = document) {
  root.querySelectorAll(".reveal:not([data-w])").forEach((el, i) => {
    el.dataset.w = 1; el.dataset.i = Math.min(i, 8);
    reduce ? el.classList.add("visible") : io.observe(el);
  });
}
watchReveal();

/* ---------- Foto que não carrega vira "AV" ---------- */
const img = document.querySelector(".photo img");
if (img) {
  const fb = () => { img.parentElement.innerHTML = '<div class="fallback" role="img" aria-label="Foto indisponível">AV</div>'; };
  if (img.complete && img.naturalWidth === 0) fb(); else img.addEventListener("error", fb, { once: true });
}

/* ---------- PORTFÓLIO: lê a tabela "portfolio" e mostra na tela ---------- */
const grid = $("portfolioGrid");
if (grid) loadPortfolio();

async function loadPortfolio() {
  if (!db) { grid.innerHTML = '<p class="msg">Não foi possível conectar ao banco de dados.</p>'; return; }
  const { data, error } = await db.from("portfolio").select("*").order("created_at", { ascending: false });
  if (error) { console.error(error); grid.innerHTML = '<p class="msg">Não foi possível carregar os projetos agora.</p>'; return; }
  if (!data.length) { grid.innerHTML = '<p class="msg">Em breve, novos projetos por aqui.</p>'; return; }

  grid.innerHTML = data.map((p) => {
    const image = safeUrl(p.image_url), link = safeUrl(p.project_url);
    return `<article class="card reveal">
      <div class="thumb">${image ? `<img src="${esc(image)}" alt="Imagem do projeto ${esc(p.title)}" loading="lazy">` : "&lt;/&gt;"}</div>
      <div class="body">
        ${p.category ? `<span class="pill">${esc(p.category)}</span>` : ""}
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description)}</p>
        ${link ? `<a class="btn line" href="${esc(link)}" target="_blank" rel="noopener noreferrer">Ver projeto</a>` : ""}
      </div></article>`;
  }).join("");
  watchReveal(grid);
}

/* ---------- CONTATO: valida e faz INSERT na tabela "leads" ---------- */
const form = $("contactForm");
if (form) form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = (id) => $(id), val = (id) => f(id).value.trim();
  const status = $("status");
  status.className = "status"; status.textContent = "";

  const rules = [
    ["name", !val("name"), "Informe seu nome."],
    ["email", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email")), "Digite um e-mail válido."],
    ["subject", !val("subject"), "Informe o assunto."],
    ["message", val("message").length < 10, "Escreva pelo menos 10 caracteres."],
    ["privacy", !f("privacy").checked, "Aceite a política de privacidade para enviar."],
  ];
  let ok = true;
  rules.forEach(([id, bad, text]) => {
    f(id).setAttribute("aria-invalid", bad);
    $(id + "Error").textContent = bad ? text : "";
    if (bad) ok = false;
  });
  if (!ok) return;
  if (f("website").value) return; // campo-isca: robô preencheu, ignora

  const btn = form.querySelector("button[type=submit]"), label = btn.innerHTML;
  btn.disabled = true; btn.textContent = "Enviando...";
  const { error } = await db.from("leads").insert([{
    name: val("name"), email: val("email"), subject: val("subject"),
    message: val("message"), privacy_accepted: true,
  }]);
  btn.disabled = false; btn.innerHTML = label;

  if (error) { console.error(error); status.className = "status bad"; status.textContent = "Não foi possível enviar. Tente novamente em instantes."; return; }
  status.className = "status ok"; status.textContent = "Mensagem enviada! Obrigada pelo contato.";
  form.reset();
});
