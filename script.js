// Reads configuration from config.json so phone number and brand can be changed easily.
let CONFIG = { WA_PHONE: '919608018417', BRAND: 'Hebe LivingSpace' };

async function loadConfig(){
  try{
    const res = await fetch('config.json');
    const data = await res.json();
    CONFIG = {...CONFIG, ...data};
  }catch(e){
    console.warn('Could not load config.json, using defaults.', e);
  }
}

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

let PRODUCTS = [];
let cart = [];
function fmt(x){ return "₹" + x.toLocaleString('en-IN') }

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
  list.forEach(p=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div class="title">${p.title}</div>
      <div class="price">${fmt(p.price)}</div>
      <div style="margin-top:auto;display:flex;gap:8px">
        <button class="btn" data-id="${p.id}" onclick="openModal(${p.id})">Quick view</button>
        <button class="btn primary" onclick="addToCartId(${p.id})">Add</button>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

function openModal(id){
  const p = PRODUCTS.find(x=>x.id===id);
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

function addToCartId(id){
  const p = PRODUCTS.find(x=>x.id===id);
  cart.push({...p, qty:1});
  updateCartUI();
}
document.getElementById('addToCart').onclick = function(){
  if(window.currentProduct) { cart.push({...window.currentProduct, qty:1}); updateCartUI(); closeModal(); }
}

function updateCartUI(){
  cartCount.textContent = cart.length;
  cartItemsEl.innerHTML = '';
  let total = 0;
  cart.forEach((it, i)=>{
    total += it.price * it.qty;
    const row = document.createElement('div');
    row.style.display='flex'; row.style.justifyContent='space-between'; row.style.gap='8px'; row.style.padding='8px 0';
    row.innerHTML = `<div>${it.title} × ${it.qty}</div><div>${fmt(it.price*it.qty)}</div>`;
    cartItemsEl.appendChild(row);
  });
  cartTotalEl.textContent = fmt(total);
}

cartToggle.addEventListener('click', ()=>{ cartSidebar.classList.toggle('visible'); });

document.getElementById('closeCart').onclick = ()=> cartSidebar.classList.remove('visible');

// Filters & search
document.getElementById('categoryFilter').onchange = function(){
  const val = this.value;
  const list = val === 'all' ? PRODUCTS : PRODUCTS.filter(x=>x.category===val);
  renderProducts(list);
};
document.getElementById('searchInput').oninput = function(){
  const q = this.value.toLowerCase();
  renderProducts(PRODUCTS.filter(p=> p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)));
};

// WhatsApp click-to-chat builder (uses CONFIG.WA_PHONE)
function buildWhatsAppMessage(){
  if(cart.length===0) return encodeURIComponent('Hi, I am interested in your products. Please share details.');
  let msg = 'New order%0A';
  cart.forEach((it, i)=> msg += `${i+1}. ${it.title} x${it.qty} - ₹${it.price}%0A`);
  const total = cart.reduce((s,i)=> s + i.price * i.qty, 0);
  msg += `%0ATotal: ₹${total}%0AName:%0AAddress:%0AContact:`;
  return msg;
}
checkoutWA.addEventListener('click', ()=>{
  const msg = buildWhatsAppMessage();
  const url = `https://wa.me/${CONFIG.WA_PHONE}?text=${msg}`;
  window.open(url, '_blank');
});
whatsappQuick.addEventListener('click', (e)=>{
  e.preventDefault();
  const url = `https://wa.me/${CONFIG.WA_PHONE}?text=Hi%2C%20I%20want%20to%20know%20more%20about%20your%20products.`;
  window.open(url, '_blank');
});
secondaryCTA.addEventListener('click', (e)=>{
  e.preventDefault();
  window.open(`https://wa.me/${CONFIG.WA_PHONE}?text=Hello%2C%20I%20have%20a%20question%20about%20your%20products.`, '_blank');
});
shopCollections.addEventListener('click', ()=>{ document.getElementById('categoryFilter').value='all'; window.location='#products'; });
primaryCTA.addEventListener('click', ()=>{ document.getElementById('categoryFilter').value='all'; window.location='#products'; });

// Init: load config then content
(async function init(){
  await loadConfig();
  document.title = (CONFIG.BRAND || document.title);
  document.querySelectorAll('.brand').forEach(el=> el.textContent = CONFIG.BRAND || el.textContent);
  await loadProducts();
})();
