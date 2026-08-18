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

const LANG = (document.documentElement.lang || 'fr').toLowerCase().slice(0,2);

const I18N = {
  fr: {
    item1:'article', itemN:'articles',
    addBottle:'Ajoutez au moins une bouteille.',
    added:'ajouté au panier',
    minDate:'Choisissez une date au minimum 3 jours à l’avance.',
    pickup:'Retrait à Liedekerke',
    pickupFree:'Retrait à Liedekerke : aucun frais de transport à ajouter.',
    chooseDestination:'Choisissez une destination. Livraison sans frais supplémentaires sur les points indiqués dès 20 € de commande.',
    freeAt:(d)=>`Livraison sans frais supplémentaires à ${d} : votre commande atteint le minimum de 20 €.`,
    under20:(d,total)=>`Pour ${d}, la livraison sans frais supplémentaires est disponible à partir de 20 €. Votre panier est actuellement de ${total} ; les frais éventuels seront communiqués avant confirmation.`,
    other:'Autre destination : des frais de transport sont obligatoires et seront communiqués avant confirmation.',
    orderReady:(n)=>`Commande ${n} prête dans WhatsApp`,
    msgHello:(n)=>`Bonjour GUG, je souhaite confirmer ma commande ${n}.`,
    msgTotal:'Total produits', msgName:'Nom', msgPhone:'Téléphone', msgReception:'Réception',
    msgDestination:'Destination', msgPayment:'Paiement', msgAddress:'Adresse / destination exacte',
    msgDate:'Date souhaitée', msgFlavors:'Goûts / composition', msgNote:'Note', msgDelivery:'Livraison',
    msgPrecautions:'Précautions : je confirme qu’aucune des situations particulières indiquées dans le formulaire ne me concerne.',
    msgConfirm:'Merci de me confirmer la disponibilité, le montant final et les modalités de livraison/retrait.',
    modeDelivery:'Livraison', modePickup:'Retrait à Liedekerke',
    paymentCash:'Cash', paymentTransfer:'Virement bancaire'
  },
  en: {
    item1:'item', itemN:'items',
    addBottle:'Add at least one bottle.',
    added:'added to cart',
    minDate:'Choose a date at least 3 days in advance.',
    pickup:'Pickup in Liedekerke',
    pickupFree:'Pickup in Liedekerke: no transport charge is added.',
    chooseDestination:'Choose a destination. Delivery has no additional charge at the listed locations for orders of €20 or more.',
    freeAt:(d)=>`Delivery with no additional charge to ${d}: your order reaches the €20 minimum.`,
    under20:(d,total)=>`For ${d}, delivery has no additional charge from €20. Your cart is currently ${total}; any applicable charge will be communicated before confirmation.`,
    other:'Other destination: transport charges apply and will be communicated before confirmation.',
    orderReady:(n)=>`Order ${n} is ready in WhatsApp`,
    msgHello:(n)=>`Hello GUG, I would like to confirm my order ${n}.`,
    msgTotal:'Product total', msgName:'Name', msgPhone:'Phone', msgReception:'Fulfilment',
    msgDestination:'Destination', msgPayment:'Payment', msgAddress:'Exact address / destination',
    msgDate:'Requested date', msgFlavors:'Flavours / assortment', msgNote:'Note', msgDelivery:'Delivery',
    msgPrecautions:'Precautions: I confirm that none of the particular situations listed in the form applies to me.',
    msgConfirm:'Please confirm availability, the final amount and the delivery/pickup arrangements.',
    modeDelivery:'Delivery', modePickup:'Pickup in Liedekerke',
    paymentCash:'Cash', paymentTransfer:'Bank transfer'
  },
  nl: {
    item1:'artikel', itemN:'artikelen',
    addBottle:'Voeg minstens één fles toe.',
    added:'toegevoegd aan de winkelmand',
    minDate:'Kies een datum minstens 3 dagen vooraf.',
    pickup:'Afhalen in Liedekerke',
    pickupFree:'Afhalen in Liedekerke: er worden geen transportkosten toegevoegd.',
    chooseDestination:'Kies een bestemming. Op de vermelde locaties zijn er geen extra leveringskosten voor bestellingen vanaf € 20.',
    freeAt:(d)=>`Geen extra leveringskosten naar ${d}: uw bestelling bereikt het minimum van € 20.`,
    under20:(d,total)=>`Voor ${d} zijn er vanaf € 20 geen extra leveringskosten. Uw winkelmand bedraagt momenteel ${total}; eventuele kosten worden vóór bevestiging meegedeeld.`,
    other:'Andere bestemming: transportkosten zijn verplicht en worden vóór bevestiging meegedeeld.',
    orderReady:(n)=>`Bestelling ${n} staat klaar in WhatsApp`,
    msgHello:(n)=>`Hallo GUG, ik wil mijn bestelling ${n} bevestigen.`,
    msgTotal:'Totaal producten', msgName:'Naam', msgPhone:'Telefoon', msgReception:'Ontvangst',
    msgDestination:'Bestemming', msgPayment:'Betaling', msgAddress:'Exact adres / bestemming',
    msgDate:'Gewenste datum', msgFlavors:'Smaken / assortiment', msgNote:'Opmerking', msgDelivery:'Levering',
    msgPrecautions:'Voorzorgsmaatregelen: ik bevestig dat geen van de bijzondere situaties uit het formulier op mij van toepassing is.',
    msgConfirm:'Bevestig alstublieft de beschikbaarheid, het eindbedrag en de leverings-/afhaalafspraken.',
    modeDelivery:'Levering', modePickup:'Afhalen in Liedekerke',
    paymentCash:'Cash', paymentTransfer:'Bankoverschrijving'
  }
};
const T = I18N[LANG] || I18N.fr;

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
    return { text: T.pickupFree, css: 'success' };
  }
  if(!destination){
    return { text: T.chooseDestination, css: '' };
  }
  if(FREE_DESTINATIONS.has(destination) && total >= 20){
    return { text: T.freeAt(destination), css: 'success' };
  }
  if(FREE_DESTINATIONS.has(destination) && total < 20){
    return { text: T.under20(destination, money(total)), css: 'warning' };
  }
  return { text: T.other, css: 'warning' };
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
  $('floatingItemLabel').textContent = qty === 1 ? T.item1 : T.itemN;
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
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(window.__toast);
  window.__toast = setTimeout(()=>el.classList.remove('show'),1800);
}

function change(id, delta){
  state[id] = Math.max(0, state[id] + delta);
  render();
  if(delta > 0) toast(`${PRODUCTS[id].name} ${T.added}`);
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

const minDate = new Date();
minDate.setDate(minDate.getDate() + 3);
$('deliveryDate').min = localISO(minDate);

function localizedMode(raw){
  return raw === 'Retrait à Liedekerke' ? T.modePickup : T.modeDelivery;
}
function localizedPayment(raw){
  return raw === 'Virement bancaire' ? T.paymentTransfer : T.paymentCash;
}

orderForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  const { qty, total } = totals();

  if(!qty){
    toast(T.addBottle);
    return;
  }

  if(!orderForm.reportValidity()) return;

  const selectedDate = $('deliveryDate').value;
  if(selectedDate && selectedDate < $('deliveryDate').min){
    toast(T.minDate);
    $('deliveryDate').focus();
    return;
  }

  const modeRaw = document.querySelector('input[name="delivery"]:checked').value;
  const paymentRaw = document.querySelector('input[name="payment"]:checked').value;
  const destination = modeRaw === 'Livraison' ? $('deliveryDestination').value : 'Liedekerke';
  const orderNo = `GUG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random()*9000)}`;

  const items = Object.entries(state)
    .filter(([,q])=>q>0)
    .map(([id,q])=>`• ${q} × ${PRODUCTS[id].name} = ${money(q*PRODUCTS[id].price)}`)
    .join('\n');

  const status = deliveryStatus();

  const parts = [
    T.msgHello(orderNo),
    '',
    items,
    '',
    `${T.msgTotal} : ${money(total)}`,
    `${T.msgName} : ${$('customerName').value.trim()}`,
    `${T.msgPhone} : ${$('customerPhone').value.trim()}`,
    `${T.msgReception} : ${localizedMode(modeRaw)}`,
    `${T.msgDestination} : ${destination}`,
    `${T.msgPayment} : ${localizedPayment(paymentRaw)}`
  ];

  if(modeRaw === 'Livraison' && $('deliveryDestination').value === 'Autre destination'){
    const addr = [$('address').value.trim(), $('postalCode').value.trim(), $('city').value.trim()].filter(Boolean).join(', ');
    parts.push(`${T.msgAddress} : ${addr}`);
  }

  parts.push(`${T.msgDate} : ${selectedDate}`);

  if($('flavors').value.trim()) parts.push(`${T.msgFlavors} : ${$('flavors').value.trim()}`);
  if($('note').value.trim()) parts.push(`${T.msgNote} : ${$('note').value.trim()}`);

  parts.push(
    `${T.msgDelivery} : ${status.text}`,
    T.msgPrecautions,
    '',
    T.msgConfirm
  );

  const url = `https://wa.me/32470923114?text=${encodeURIComponent(parts.join('\n'))}`;
  window.open(url, '_blank', 'noopener');
  toast(T.orderReady(orderNo));
});

render();
syncDelivery();
