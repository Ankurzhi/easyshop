const apiUrl = "http://localhost:5000/api/products";

/* =========================
   LOAD PRODUCTS
========================= */
if (document.getElementById("product-list")) {
  fetch(apiUrl)
    .then(res => res.json())
    .then(products => {
      const productList = document.getElementById("product-list");

      products.forEach(p => {
        const div = document.createElement("div");
        div.className = "product";

        div.innerHTML = `
          <img src="${p.image}" alt="${p.name}">
          <h3>${p.name}</h3>
          <p>₹${p.price}</p>
          <button class="add-btn">Add to Cart</button>
        `;

        div.querySelector(".add-btn").addEventListener("click", () => {
          addToCart(p.id, p.name, p.price);
        });

        productList.appendChild(div);
      });
    })
    .catch(err => console.error(err));
}

/* =========================
   ADD TO CART (FINAL FIX)
========================= */
function addToCart(id, name, price) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: id,
      name: name,
      price: Number(price),
      quantity: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${name} added to cart ✅`);
}

/* =========================
   CART PAGE
========================= */
if (document.getElementById("cart-items")) {

  const cartItemsDiv = document.getElementById("cart-items");
  const totalSpan = document.getElementById("cart-total");

  function renderCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cartItemsDiv.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
      cartItemsDiv.innerHTML = "<p>Your cart is empty 😢</p>";
      totalSpan.textContent = 0;
      return;
    }

    cart.forEach((item, index) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;

      const div = document.createElement("div");
      div.className = "cart-item";

      div.innerHTML = `
        <h3>${item.name}</h3>
        <p>₹${price} × ${quantity}</p>
        <p>Total: ₹${price * quantity}</p>
        <button class="remove-btn">Remove</button>
        <hr>
      `;

      div.querySelector(".remove-btn").addEventListener("click", () => {
        removeItem(index);
      });

      cartItemsDiv.appendChild(div);

      total += price * quantity;
    });

    totalSpan.textContent = total;
  }

  function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }

  renderCart();

  /* =========================
     CHECKOUT BUTTON
  ========================= */
  const checkoutBtn = document.getElementById("checkout");

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {

      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }

      const user = localStorage.getItem("user");

      if (!user) {
        window.location.href = "login.html?redirect=buy.html";
      } else {
        window.location.href = "buy.html";
      }
    });
  }
}

/* =========================
   CONTACT FORM
========================= */
if (document.getElementById("contactForm")) {
  document.getElementById("contactForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value
    };

    try {
      const res = await fetch("http://localhost:5000/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      document.getElementById("response").innerText = result.message;
      this.reset();
    } catch {
      document.getElementById("response").innerText = "Error sending message";
    }
  });
}