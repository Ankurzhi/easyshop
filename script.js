const apiUrl = "http://localhost:5000/api/products";

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
          <button onclick="addToCart(${p.id}, '${p.name}', ${p.price})">Add to Cart</button>
        `;
        productList.appendChild(div);
      });
    });
}
function addToCart( id,name, price) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push({ name, price });
  localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${name} added to cart!`);
}

if (document.getElementById("cart-items")) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItemsDiv = document.getElementById("cart-items");
  const totalSpan = document.getElementById("cart-total");

  function renderCart() {
    cartItemsDiv.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      total += item.price;
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>
        <button onclick="removeItem(${index})">Remove</button>
      `;
      cartItemsDiv.appendChild(div);
    });

    totalSpan.textContent = total;
  }

  window.removeItem = function(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  };

  renderCart();

  document.getElementById("checkout").onclick = () => {
    fetch("http://localhost:5000/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart })
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      localStorage.removeItem("cart");
      window.location.href = "buy.html";//add 
    });
  };
}

function addToCart1(name, price) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push({ name, price });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${name} added to cart!`);
}


function displayCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let cartContainer = document.getElementById("cart-items");
  let totalContainer = document.getElementById("cart-total");

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    totalContainer.innerHTML = "";
    return;
  }

  cartContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    let div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <span>${item.name}</span>
      <span>₹${item.price}</span>
      <button onclick="removeFromCart(${index})">❌</button>
    `;
    cartContainer.appendChild(div);
    total += item.price;
  });

  totalContainer.innerHTML = `<h3>Total: ₹${total}</h3>`;
}


function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

function clearCart() {
  localStorage.removeItem("cart");
  displayCart();
}

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
        document.getElementById("contactForm").reset();
      } catch (err) {
        document.getElementById("response").innerText = "Something went wrong. Try again later.";
      }
    });

document.querySelector("button").addEventListener("click", () => {
  // Get the current cart from localStorage
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  // Send cart data to backend
  fetch("http://localhost:5000/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Response:", data);
    alert(data.message);

    // Clear cart after successful checkout
    localStorage.removeItem("cart");
    window.location.href = "index.html";
  })
  .catch(err => console.error("Fetch error:", err));
});


function goToCategory() {
  window.location.href = "categories.html";
}

if (!localStorage.getItem("offerShown")) {
  setTimeout(() => {
    popup.style.display = "flex";
    localStorage.setItem("offerShown", "yes");
  }, 1000);
}





