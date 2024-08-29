document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('productsContainer');
    const cartContainer = document.getElementById('cartContainer');
    const cartTotal = document.getElementById('totalPrice');
    const clearCartButton = document.getElementById('clearCart');
    const finalizePurchaseButton = document.getElementById('finalizePurchase');
    let products = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Cargar productos desde el archivo JSON

    fetch('../data/productos.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            renderProducts(products);
            populateCategories(products);
        });

    function renderProducts(products) {
        productsContainer.innerHTML = '';
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('item__product');
            productDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="item__products__details">
                    <h5>${product.name}</h5>
                    <p>$${product.price.toFixed(2)}</p>
                    <button onclick="addToCart(${product.id})">Agregar al carrito</button>
                </div>
            `;
            productsContainer.appendChild(productDiv);
        });
    }

    function populateCategories(products) {
        const select = document.getElementById('select');
        const categories = [...new Set(products.map(product => product.category))];
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });

        select.addEventListener('change', () => {
            const selectedCategory = select.value;
            if (selectedCategory === 'all') {
                renderProducts(products);
            } else {
                renderProducts(products.filter(product => product.category === selectedCategory));
            }
        });
    }

    window.addToCart = function(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const existingProduct = cart.find(p => p.id === product.id);
        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            product.quantity = 1;
            cart.push(product);
        }

        // SweetAlert

        Swal.fire("Producto agregado al carrito!");
        updateCart();
    };

    function updateCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        updateCartTotal();
    }

    function renderCartItems() {
        cartContainer.innerHTML = '';
        cart.forEach(product => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart__item');
            cartItemDiv.innerHTML = `
                <div class="cart__item__name">
                    <img src="${product.image}" alt="${product.name}">
                    <p>${product.name}</p>
                </div>
                <div class="cart__item__quantity">
                    <strong>Cantidad</strong>
                    <div class="button__quantity">
                        <button onclick="changeQuantity(${product.id}, 'decrease')">-</button>
                        <strong class="quantity">${product.quantity}</strong>
                        <button onclick="changeQuantity(${product.id}, 'increase')">+</button>
                    </div>
                </div>
                <div class="cart__item__price">
                    <p>$${(product.price * product.quantity).toFixed(2)}</p>
                </div>
                <div class="cart__item__delete">
                    <button class="material-symbols-outlined" onclick="removeFromCart(${product.id})">delete</button>
                </div>
            `;
            cartContainer.appendChild(cartItemDiv);
        });
    }

    window.changeQuantity = function(productId, action) {
        const product = cart.find(p => p.id === productId);
        if (!product) return;
        if (action === 'increase') {
            product.quantity++;
        } else if (action === 'decrease' && product.quantity > 1) {
            product.quantity--;
        } else if (action === 'decrease' && product.quantity === 1) {
            removeFromCart(productId);
        }
        updateCart();
    };

    window.removeFromCart = function(productId) {
        cart = cart.filter(product => product.id !== productId);
        updateCart();
    };

    function updateCartTotal() {
        const total = cart.reduce((sum, product) => sum + (product.price * product.quantity), 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }

    clearCartButton.addEventListener('click', () => {
        cart = [];
        updateCart();
    });

    finalizePurchaseButton.addEventListener('click', () => {
        if (cart.length === 0) {
            // SweetAlert
            Swal.fire("El carrito está vacío");
        } else {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "¡Tu compra fue realizada con éxito!",
                showConfirmButton: false,
                timer: 1500
            });
            cart = [];
            updateCart();
        }
    });

    updateCart();
});
