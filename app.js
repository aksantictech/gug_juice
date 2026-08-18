const PRODUCTS = {
  '1l': { name: 'GUG 1 L', price: 8 },
  '500ml': { name: 'GUG 500 ml', price: 4 },
  '250ml': { name: 'GUG 250 ml', price: 2 }
};

const FREE_DESTINATIONS = new Set([
  'Bruxelles-Midi',
  'Bruxelles-Central',
  'Liedekerke',
  'Station Denderleeuw'
]);

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

function deliveryStatus(){
  const { total } = totals();
  const modeEl = document.querySelector('input[name="delivery"]:checked');
  const mode = modeEl ? modeEl.value : 'Livraison';
  const destination = $('deliveryDestination') ? $('deliveryDestination').value : '';

  if(mode === 'Retrait à Liedekerke'){
    return {
      text: 'Retrait à Liedekerke : aucun frais de transport à ajouter.',
      css: 'success'
    };
  }

  if(!destination){
    return {
      text: 'Choisissez une destination. Livraison sans frais supplémentaires sur les points indiqués dès 20 € de commande.',
      css: ''
    };
  }

  if(FREE_DESTINATIONS.has(destination) && total >= 20){
    return {
      text: `Livraison sans frais supplémentaires à ${destination} : votre commande atteint le minimum de 20 €.`,
      css: 'success'
    };
  }

  if(FREE_DESTINATIONS.has(destination) && total < 20){
    return {
      text: `Pour ${destination}, la livraison sans frais supplémentaires est disponible à partir de 20 €. Votre panier est actuellement de ${money(total)} ; les frais éventuels seront communiqués avant confirmation.`,
      css: 'warning'
    };
  }

  return {
    text: 'Autre destination : des frais de transport sont obligatoires et seront communiqués avant confirmation.',
    css: 'warning'
  };
}

function updateDeliveryNotice(){
  const status = deliveryStatus();
  const notice = $('deliveryNotice');
  const rule = $('deliveryRule');
  if(notice){
    notice.textContent = status.text;
    notice.className = `delivery-notice ${status.css}`.trim();
  }
  if(rule) rule.textContent = status.text;
}

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
  updateDeliveryNotice();
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
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden','false');
  backdrop.hidden = false;
  document.body.classList.add('no-scroll');
}
function closeDrawer(){
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden','true');
  backdrop.hidden = true;
  document.body.classList.remove('no-scroll');
}
$('cartMini').addEventListener('click',openDrawer);
floatingCart.addEventListener('click',openDrawer);
$('closeDrawer').addEventListener('click',closeDrawer);
backdrop.addEventListener('click',closeDrawer);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});

function syncDelivery(){
  const mode = document.querySelector('input[name="delivery"]:checked').value;
  const isDelivery = mode === 'Livraison';

  $('deliveryFields').style.display = isDelivery ? 'block' : 'none';
  $('deliveryDestination').required = isDelivery;

  const destination = $('deliveryDestination').value;
  const needsAddress = isDelivery && destination === 'Autre destination';
  $('addressFields').hidden = !needsAddress;
  $('address').required = needsAddress;

  updateDeliveryNotice();
}

document.querySelectorAll('input[name="delivery"]').forEach(r=>r.addEventListener('change',syncDelivery));
$('deliveryDestination').addEventListener('change', syncDelivery);

function localISO(date){
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().split('T')[0];
}

// Toute commande doit être prévue au minimum 3 jours à l'avance.
const minDate = new Date();
minDate.setDate(minDate.getDate() + 3);
$('deliveryDate').min = localISO(minDate);

orderForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  const { qty, total } = totals();

  if(!qty){
    toast('Ajoutez au moins une bouteille.');
    return;
  }

  if(!orderForm.reportValidity()) return;

  const selectedDate = $('deliveryDate').value;
  if(selectedDate && selectedDate < $('deliveryDate').min){
    toast('Choisissez une date au minimum 3 jours à l’avance.');
    $('deliveryDate').focus();
    return;
  }

  const mode = document.querySelector('input[name="delivery"]:checked').value;
  const payment = document.querySelector('input[name="payment"]:checked').value;
  const destination = mode === 'Livraison' ? $('deliveryDestination').value : 'Retrait à Liedekerke';
  const orderNo = `GUG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random()*9000)}`;
  const items = Object.entries(state)
    .filter(([,q])=>q>0)
    .map(([id,q])=>`• ${q} × ${PRODUCTS[id].name} = ${money(q*PRODUCTS[id].price)}`)
    .join('\n');

  const status = deliveryStatus();

  const parts = [
    `Bonjour GUG, je souhaite confirmer ma commande ${orderNo}.`,
    '',
    items,
    '',
    `Total produits : ${money(total)}`,
    `Nom : ${$('customerName').value.trim()}`,
    `Téléphone : ${$('customerPhone').value.trim()}`,
    `Réception : ${mode}`,
    `Destination : ${destination}`,
    `Paiement : ${payment}`
  ];

  if(mode === 'Livraison' && destination === 'Autre destination'){
    const addr = [$('address').value.trim(), $('postalCode').value.trim(), $('city').value.trim()].filter(Boolean).join(', ');
    parts.push(`Adresse / destination exacte : ${addr}`);
  }

  parts.push(`Date souhaitée : ${selectedDate}`);

  if($('flavors').value.trim()) parts.push(`Goûts / composition : ${$('flavors').value.trim()}`);
  if($('note').value.trim()) parts.push(`Note : ${$('note').value.trim()}`);

  parts.push(
    `Livraison : ${status.text}`,
    'Précautions : je confirme qu’aucune des situations particulières indiquées dans le formulaire ne me concerne.',
    '',
    'Merci de me confirmer la disponibilité, le montant final et les modalités de livraison/retrait.'
  );

  const url = `https://wa.me/32470923114?text=${encodeURIComponent(parts.join('\n'))}`;
  window.open(url, '_blank', 'noopener');
  toast(`Commande ${orderNo} prête dans WhatsApp`);
});

render();
syncDelivery();
