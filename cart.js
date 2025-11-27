function getCart() {
  const raw = localStorage.getItem("shoppyCart");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("shoppyCart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const span = document.getElementById("cart-count");
  if (span) span.textContent = count;
}

function addItemFromCard(card) {
  const id = card.dataset.id;
  const name = card.dataset.name;
  const price = parseFloat(card.dataset.price);
  const img = card.querySelector("img")?.getAttribute("src") || "";
  if (!id || !name || !price) return;

  const cart = getCart();
  const existing = cart.find((p) => p.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, image: img, qty: 1 });
  }
  saveCart(cart);
}

function attachAddToCartButtons() {
  const buttons = document.querySelectorAll(".add-to-cart-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      if (card) addItemFromCard(card);
    });
  });
}

function renderCartPage() {
  const tbody = document.getElementById("cart-items");
  if (!tbody) return;

  const emptyText = document.getElementById("cart-empty");
  const totalSpan = document.getElementById("cart-total");
  const cart = getCart();

  tbody.innerHTML = "";

  if (cart.length === 0) {
    if (emptyText) emptyText.style.display = "block";
    if (totalSpan) totalSpan.textContent = "$0.00";
    return;
  }

  if (emptyText) emptyText.style.display = "none";

  let grandTotal = 0;

  cart.forEach((item) => {
    const row = document.createElement("tr");
    const lineTotal = item.price * item.qty;
    grandTotal += lineTotal;

    row.innerHTML = `
      <td class="cart-product-cell">
        <img src="${item.image}" alt="${item.name}" class="cart-thumb" />
        <span>${item.name}</span>
      </td>
      <td>$${item.price.toFixed(2)}</td>
      <td>
        <button class="qty-btn" data-id="${item.id}" data-change="-1">-</button>
        <span class="cart-qty">${item.qty}</span>
        <button class="qty-btn" data-id="${item.id}" data-change="1">+</button>
      </td>
      <td>$${lineTotal.toFixed(2)}</td>
      <td>
        <button class="btn btn-small remove-btn" data-id="${item.id}">Remove</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  if (totalSpan) totalSpan.textContent = "$" + grandTotal.toFixed(2);

  attachCartRowHandlers();
  updateCheckoutMail();
}

function attachCartRowHandlers() {
  const minusPlus = document.querySelectorAll(".qty-btn");
  minusPlus.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const change = parseInt(btn.dataset.change || "0", 10);
      if (!id || !change) return;

      const cart = getCart();
      const item = cart.find((p) => p.id === id);
      if (!item) return;

      item.qty += change;
      if (item.qty <= 0) {
        const index = cart.indexOf(item);
        cart.splice(index, 1);
      }
      saveCart(cart);
      renderCartPage();
    });
  });

  const removes = document.querySelectorAll(".remove-btn");
  removes.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const cart = getCart().filter((p) => p.id !== id);
      saveCart(cart);
      renderCartPage();
    });
  });
}

function updateCheckoutMail() {
  const link = document.getElementById("checkout-link");
  if (!link) return;

  const cart = getCart();
  if (cart.length === 0) {
    link.href = "mailto:shoppymadeeasy@gmail.com";
    return;
  }

  let body = "Hello,%0D%0A%0D%0AI want to order these items:%0D%0A";
  cart.forEach((item) => {
    body += `- ${item.name} x${item.qty} ($${item.price.toFixed(2)} each)%0D%0A`;
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  body += `%0D%0ATotal: $${total.toFixed(2)}%0D%0A%0D%0AThank you.%0D%0A`;

  link.href =
    "mailto:shoppymadeeasy@gmail.com?subject=New order from Shoppymadeeasy&body=" +
    body;
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  attachAddToCartButtons();
  renderCartPage();
});
