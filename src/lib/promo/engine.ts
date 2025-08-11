function promoValid(promo, qty, now) {
  if (promo.start && now < new Date(promo.start)) return false;
  if (promo.end && now > new Date(promo.end)) return false;
  if (promo.minQty && qty < promo.minQty) return false;
  if (promo.maxQty && qty > promo.maxQty) return false;
  return true;
}

function promoEngine(cart, promotions, now = new Date()) {
  const cartAfter = cart.map((i) => ({ ...i, discount: 0, finalPrice: i.price * i.qty }));
  const appliedMap = new Map();
  let totalDiscount = 0;

  const packPromos = promotions.filter((p) => p.type === 'PACK3');

  for (const item of cartAfter) {
    let best = { promo: null, discount: 0 };
    for (const promo of promotions) {
      if (promo.type === 'PACK3') continue;
      if (promo.productId && promo.productId !== item.id) continue;
      if (!promoValid(promo, item.qty, now)) continue;
      let discount = 0;
      if (promo.type === 'PERCENT') {
        discount = item.price * item.qty * (promo.percent || 0) / 100;
      } else if (promo.type === 'FIXED') {
        discount = (promo.amount || 0) * item.qty;
        const max = item.price * item.qty;
        if (discount > max) discount = max;
      } else if (promo.type === 'BxGy') {
        const buy = promo.buy_qty || 0;
        const get = promo.get_qty || 0;
        if (buy > 0 && get > 0) {
          const group = buy + get;
          const deals = Math.floor(item.qty / group);
          discount = deals * get * item.price;
        }
      }
      if (discount > best.discount) best = { promo, discount };
    }

    for (const promo of packPromos) {
      if (!promo.productIds || !promo.productIds.includes(item.id)) continue;
      const items = promo.productIds.map((id) => cartAfter.find((ci) => ci.id === id));
      if (items.some((ci) => !ci)) continue;
      if (!promoValid(promo, item.qty, now)) continue;
      const packCount = Math.min(...items.map((ci) => ci.qty));
      if (packCount <= 0) continue;
      const sumPrice = items.reduce((s, ci) => s + ci.price, 0);
      const discountPerPack = sumPrice - (promo.pack_price || 0);
      const perItem = discountPerPack / items.length;
      const discount = perItem * packCount;
      if (discount > best.discount) best = { promo, discount };
    }

    if (best.promo) {
      item.discount = best.discount;
      item.finalPrice = item.price * item.qty - best.discount;
      totalDiscount += best.discount;
      const rec = appliedMap.get(best.promo.id) || { id: best.promo.id, type: best.promo.type, discount: 0 };
      rec.discount += best.discount;
      appliedMap.set(best.promo.id, rec);
    }
  }

  return { applied: Array.from(appliedMap.values()), totalDiscount, cartAfter };
}

module.exports = { promoEngine };
