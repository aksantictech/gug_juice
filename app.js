const PRODUCTS = {
  '1l': { name: 'GUG 1 L', price: 8 },
  '500ml': { name: 'GUG 500 ml', price: 4 },
  '250ml': { name: 'GUG 250 ml', price: 2 }
};

const state = { '1l': 0, '500ml': 0, '250ml': 0 };
const $ = (id) => document.getElementById(id);
const drawer = $('cartDrawer');
const backdrop = $('drawerBackdrop');
const orderForm = $('orderForm');
const cartTotalBlock = $('cartTotalBlock');
const cartEmpty = $('cartEmpty');
const floatingCart = $('floatingCart');

function totals() {
  const qty = Object.values(state).reduce((a,b) => a+b, 0);
  const total = Object.entries(state).reduce((sum,[id,q]) => sum + PRODUCTS[id].price*q, 0);
  return { qty, total };
}

function money(value){ return `${value.toFixed(0)} €`; }

function render(){
  Object.keys(state).forEach(id => { $(`qty-${id}`).textContent = state[id]; });
  const { qty, total } = totals();
  $('cartCount').textContent = qty;
  $('floatingQty').textContent = qty;
  $('floatingTotal').textContent = money(total);
  $('plural').textContent = qty > 1 ? 's' : '';
  floatingCart.hidden = qty === 0;

  const rows = Object.entries(state)
    .filter(([,q]) => q > 0)
    .map(([id,q]) => `<div class="cart-row"><div><b>${PRODUCTS[id].name}</b><small>${q} × ${money(PRODUCTS[id].price)}</small></div><strong>${money(q*PRODUCTS[id].price)}</strong></div>`)
    .join('');
  $('cartItems').innerHTML = rows;
  cartEmpty.hidden = qty > 0;
  cartTotalBlock.hidden = qty === 0;
  orderForm.hidden = qty === 0;
  $('drawerTotal').textContent = money(total);
}

function toast(message){
  const el = $('toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(window.__toast); window.__toast = setTimeout(()=>el.classList.remove('show'),1800);
}

function change(id, delta){
  state[id] = Math.max(0, state[id] + delta);
  render();
  if(delta > 0) toast(`${PRODUCTS[id].name} ajouté au panier`);
}

document.querySelectorAll('.plus').forEach(b => b.addEventListener('click',()=>change(b.dataset.id,1)));
document.querySelectorAll('.minus').forEach(b => b.addEventListener('click',()=>change(b.dataset.id,-1)));

function openDrawer(){
  drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); backdrop.hidden = false; document.body.classList.add('no-scroll');
}
function closeDrawer(){
  drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); backdrop.hidden = true; document.body.classList.remove('no-scroll');
}
$('cartMini').addEventListener('click',openDrawer);
floatingCart.addEventListener('click',openDrawer);
$('closeDrawer').addEventListener('click',closeDrawer);
backdrop.addEventListener('click',closeDrawer);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});

function syncDelivery(){
  const mode = document.querySelector('input[name="delivery"]:checked').value;
  const show = mode === 'Livraison';
  $('addressFields').style.display = show ? 'block' : 'none';
  $('address').required = show;
}
document.querySelectorAll('input[name="delivery"]').forEach(r=>r.addEventListener('change',syncDelivery));

const d = new Date();
d.setMinutes(d.getMinutes()-d.getTimezoneOffset());
$('deliveryDate').min = d.toISOString().split('T')[0];

orderForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  const { qty, total } = totals();
  if(!qty){ toast('Ajoutez au moins une bouteille.'); return; }
  if(!orderForm.reportValidity()) return;

  const mode = document.querySelector('input[name="delivery"]:checked').value;
  const orderNo = `GUG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random()*9000)}`;
  const items = Object.entries(state)
    .filter(([,q])=>q>0)
    .map(([id,q])=>`• ${q} × ${PRODUCTS[id].name} = ${money(q*PRODUCTS[id].price)}`)
    .join('\n');

  const parts = [
    `Bonjour GUG, je souhaite confirmer ma commande ${orderNo}.`,
    '',
    items,
    '',
    `Total produits : ${money(total)}`,
    `Nom : ${$('customerName').value.trim()}`,
    `Téléphone : ${$('customerPhone').value.trim()}`,
    `Réception : ${mode}`
  ];

  if(mode === 'Livraison'){
    const addr = [$('address').value.trim(), $('postalCode').value.trim(), $('city').value.trim()].filter(Boolean).join(', ');
    parts.push(`Adresse : ${addr}`);
  }
  if($('deliveryDate').value) parts.push(`Date souhaitée : ${$('deliveryDate').value}`);
  if($('note').value.trim()) parts.push(`Note : ${$('note').value.trim()}`);
  parts.push('', 'Merci de me confirmer la disponibilité et, si nécessaire, les frais de livraison.');

  const url = `https://wa.me/32470923114?text=${encodeURIComponent(parts.join('\n'))}`;
  window.open(url, '_blank', 'noopener');
  toast(`Commande ${orderNo} prête dans WhatsApp`);
});

render();
syncDelivery();
