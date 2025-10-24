// script.js - Hebe LivingSpace (logo above brand text version)
// Features:
// - loads config.json (WA_PHONE, BRAND)
// - loads products.json and renders product grid
// - cart with qty controls, remove, totals
// - cart persisted in localStorage
// - minimize / restore cart persisted
// - updates only .brand-text (keeps logo intact)

let CONFIG = { WA_PHONE: '919608018417', BRAND: 'Hebe LivingSpace' };
const STORAGE_KEY = 'hebe_cart_v1';
const MINIMIZED_KEY = 'hebe_cart_minimized';

// DOM refs
const productGrid = document.getElementById('productGrid');
const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartToggle = document.getElementById('cartToggle');
const checkoutWA = document.getElementById('checkoutWA');
const whatsappQuick = document.getElementById('whatsappQuick');
const primaryCTA = document.getElementById('primaryCTA');
const secondaryCTA = document.getElementById('secondaryCTA');
const shopCollections = document.getElementById('shopCollections');

const minimizeBtn = document.getElementById('minimizeCart');
const minimizedBar = document.getElementById('minimizedBar');
const minCount = document.getElementById('minCount');
const footerBrand = document.getElementById('footerBrand');

let PRODUCTS = [];
let cart = [];

// ---------- Config ----------
async function loadConfig(){
  try{
    const res = await fetch('config.json');
    const data = await res.json();
    CONFIG = {...CONFIG, ...data};
  }catch(e){
    console.warn('Could not load config.json, using defaults.', e);
  }
}

// ---------- Persistence ----------
function saveCart(){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch(e){ console.warn(e); } }
function loadCart(){ try { const raw = localStorage.getItem(STORAGE_KEY); cart = raw ? JSON.parse(raw) : []; } catch(e){ cart = []; } }
function saveMinimized(state){ try { localStorage.setItem(MINIMIZED_KEY, state ? '1' : '0'); } catch(e){ } }
function loadMinimized(){ try { return localStorage.getItem(MINIMIZED_KEY) === '1'; } catch(e){ return false; } }

// ---------- Utils ----------
function fmt(x){ return "₹" + Number(x).toLocaleString('en-IN'); }
function findProduct(id){ return PRODUCTS.find(p => Number(p.id) === Number(id)); }
function cartItemIndex(id){ return cart.findIndex(it => Number(it.id) === Number(id)); }
function cartTotal(){ return cart.reduce((s, it) => s + (Number(it.price) * Number(it.qty)), 0); }

// ---------- Products ----------
async function loadProducts(){
  try{
    const res = await fetch('products.json');
    PRODUCTS = await res.json();
    renderProducts(PRODUCTS);
  }catch(e){
    productGrid.innerHTML = '<div class="card">Unable to load products. Make sure products.json is present.</div>';
    console.error(e);
  }
}

function renderProducts(list){
  productGrid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}" class="product-img" data-full="${p.img}">
      <div class="title">${p.title}</div>
      <div class="price">${fmt(p.price)}</div>
      <div style="margin-top:auto;display:flex;gap:8px">
        <button class="btn" data-id="${p.id}" onclick="openModal(${p.id})">Quick view</button>
        <button class="btn primary" data-id="${p.id}" onclick="addToCartId(${p.id})">Add</button>
      </div>
    `;
    productGrid.appendChild(card);
  });

  // Attach image click handlers
  document.querySelectorAll('.product-img').forEach(img => {
    img.addEventListener('click', () => openImageViewer(img.dataset.full));
  });
}

// ---------- Modal ----------
function openModal(id){
  const p = findProduct(id);
  if(!p) return;
  document.getElementById('productModal').classList.remove('hidden');
  document.getElementById('modalBody').innerHTML = `
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <img src="${p.img}" style="width:200px;border-radius:8px" alt="${p.title}">
      <div>
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <p class="price">${fmt(p.price)}</p>
        <div style="margin-top:10px">Ships: ${p.lead_time}</div>
      </div>
    </div>
  `;
  window.currentProduct = p;
}
function closeModal(){ document.getElementById('productModal').classList.add('hidden'); window.currentProduct=null }
document.getElementById('closeModal').onclick = closeModal;
document.getElementById('addToCart').onclick = function(){ if(window.currentProduct){ addToCart(window.currentProduct,1); closeModal(); } };

// ---------- Cart operations ----------
function addToCartId(id){ const p = findProduct(id); if(!p) return; addToCart(p,1); }
function addToCart(product, qty){
  qty = Number(qty) || 1;
  const idx = cartItemIndex(product.id);
  if(idx > -1){ cart[idx].qty = Number(cart[idx].qty) + qty; }
  else { cart.push({ id: product.id, title: product.title, price: Number(product.price), qty: qty, img: product.img }); }
  saveCart(); updateCartUI();
}
function setCartItemQty(id, qty){
  qty = Number(qty);
  const idx = cartItemIndex(id);
  if(idx === -1) return;
  if(qty <= 0){ removeCartItem(id); return; }
  cart[idx].qty = qty; saveCart(); updateCartUI();
}
function removeCartItem(id){ cart = cart.filter(it => Number(it.id) !== Number(id)); saveCart(); updateCartUI(); }
function clearCart(){ cart = []; saveCart(); updateCartUI(); }

// ---------- Cart UI ----------
function updateCartUI(){
  const totalQty = cart.reduce((s, it) => s + Number(it.qty), 0);
  cartCount.textContent = totalQty;
  if(minCount) minCount.textContent = totalQty;

  cartItemsEl.innerHTML = '';
  if(cart.length === 0){
    cartItemsEl.innerHTML = '<div style="padding:12px;color:#666">Your cart is empty.</div>';
    cartTotalEl.textContent = fmt(0);
    return;
  }

  cart.forEach(it => {
    const row = document.createElement('div');
    row.style.display='flex'; row.style.justifyContent='space-between'; row.style.alignItems='center';
    row.style.gap='8px'; row.style.padding='8px 0'; row.dataset.id = it.id;

    row.innerHTML = `
      <div style="flex:1;min-width:0">
        <div style="font-weight:600">${it.title}</div>
        <div style="font-size:13px;color:#666;margin-top:6px">Unit: ${fmt(it.price)} • Subtotal: <strong>${fmt(it.price * it.qty)}</strong></div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
        <div style="display:flex;align-items:center;gap:6px">
          <button class="qty-btn" data-action="dec" data-id="${it.id}">−</button>
          <div style="min-width:30px;text-align:center">${it.qty}</div>
          <button class="qty-btn" data-action="inc" data-id="${it.id}">+</button>
        </div>
        <button class="remove-btn" data-id="${it.id}" style="font-size:12px;background:transparent;border:none;color:#d44;cursor:pointer">Remove</button>
      </div>
    `;
    cartItemsEl.appendChild(row);
  });

  cartTotalEl.textContent = fmt(cartTotal());
}

// event delegation (qty + remove)
cartItemsEl.addEventListener('click', function(e){
  const btn = e.target.closest('button');
  if(!btn) return;
  const id = btn.dataset.id;
  if(btn.classList.contains('remove-btn')){ removeCartItem(id); return; }
  if(btn.classList.contains('qty-btn')){
    const action = btn.dataset.action; const idx = cartItemIndex(id); if(idx === -1) return;
    if(action === 'inc') setCartItemQty(id, Number(cart[idx].qty) + 1);
    if(action === 'dec') setCartItemQty(id, Number(cart[idx].qty) - 1);
  }
});

// ---------- Cart toggle ----------
cartToggle.addEventListener('click', ()=>{ cartSidebar.classList.toggle('visible'); });
// close button
document.getElementById('closeCart').onclick = ()=> cartSidebar.classList.remove('visible');

// ---------- Minimize / Restore ----------
function minimizeCart(){ cartSidebar.classList.add('minimized'); saveMinimized(true); }
function restoreCart(){ cartSidebar.classList.remove('minimized'); saveMinimized(false); }
function toggleMinimize(){ if(cartSidebar.classList.contains('minimized')) restoreCart(); else minimizeCart(); }

if(minimizeBtn) minimizeBtn.addEventListener('click', (e)=>{ e.preventDefault(); toggleMinimize(); });
if(minimizedBar){
  minimizedBar.addEventListener('click', (e)=>{ e.preventDefault(); restoreCart(); cartSidebar.classList.add('visible'); });
  minimizedBar.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); restoreCart(); cartSidebar.classList.add('visible'); } });
}

// ---------- Filters & search ----------
document.getElementById('categoryFilter').onchange = function(){ const val = this.value; const list = val === 'all' ? PRODUCTS : PRODUCTS.filter(x=>x.category===val); renderProducts(list); };
document.getElementById('searchInput').oninput = function(){ const q = this.value.toLowerCase(); renderProducts(PRODUCTS.filter(p=> p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))); };

// ---------- WhatsApp checkout ----------
function buildWhatsAppMessage(){
  if(cart.length===0) return encodeURIComponent('Hi, I am interested in your products. Please share details.');
  let lines = [];
  lines.push('New order');
  cart.forEach((it, i)=> { lines.push(`${i+1}. ${it.title} x${it.qty} - ₹${it.price * it.qty}`); });
  lines.push(''); lines.push(`Total: ₹${cartTotal()}`); lines.push('Name:'); lines.push('Address:'); lines.push('Contact:');
  return encodeURIComponent(lines.join('\n'));
}

checkoutWA.addEventListener('click', ()=>{
  const msg = buildWhatsAppMessage();
  const url = `https://wa.me/${CONFIG.WA_PHONE}?text=${msg}`;
  window.open(url, '_blank');
  setTimeout(() => { clearCart(); }, 600);
});

// quick chat buttons
whatsappQuick.addEventListener('click', (e)=>{ e.preventDefault(); window.open(`https://wa.me/${CONFIG.WA_PHONE}?text=${encodeURIComponent('Hi, I want to know more about your products.')}`, '_blank'); });
secondaryCTA.addEventListener('click', (e)=>{ e.preventDefault(); window.open(`https://wa.me/${CONFIG.WA_PHONE}?text=${encodeURIComponent('Hello, I have a question about your products.')}`, '_blank'); });
shopCollections.addEventListener('click', ()=>{ document.getElementById('categoryFilter').value='all'; window.location='#products'; });
primaryCTA.addEventListener('click', ()=>{ document.getElementById('categoryFilter').value='all'; window.location='#products'; });

// ---------- Init ----------
(async function init(){
  await loadConfig();

  // Update brand text only (keep logo element untouched)
  document.title = (CONFIG.BRAND || document.title);
  document.querySelectorAll('.brand').forEach(el => {
    const textEl = el.querySelector('.brand-text');
    if (textEl) textEl.textContent = CONFIG.BRAND || textEl.textContent;
    else {
      const span = document.createElement('span');
      span.className = 'brand-text';
      span.textContent = CONFIG.BRAND || '';
      el.appendChild(span);
    }
  });
  if(footerBrand) footerBrand.textContent = CONFIG.BRAND || footerBrand.textContent;

  if(loadMinimized()) cartSidebar.classList.add('minimized');

  loadCart();
  await loadProducts();
  updateCartUI();
  // ====== Product Image Viewer ======
const imageViewer = document.getElementById('imageViewer');
const viewerImg = document.getElementById('viewerImg');
const closeViewer = document.getElementById('closeViewer');

function openImageViewer(src) {
  viewerImg.src = src;
  imageViewer.classList.remove('hidden');
}

function closeImageViewer() {
  imageViewer.classList.add('hidden');
  viewerImg.src = '';
}

if (closeViewer) closeViewer.addEventListener('click', closeImageViewer);

// Close on clicking outside image
if (imageViewer) {
  imageViewer.addEventListener('click', (e) => {
    if (e.target === imageViewer) closeImageViewer();
  });
}

// Close on Esc key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeImageViewer();
});

})();
