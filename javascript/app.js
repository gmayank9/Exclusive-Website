// Main application script
document.addEventListener("DOMContentLoaded", function () {
    const currentPage = window.location.pathname.split("/").pop(); // Get the current file name
    const cartCountElement = document.getElementById("cart-count"); // Cart count badge

    // Function to update cart count
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem("cart")) || []; // Get cart from localStorage
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0); // Calculate total quantity
        if (cartCountElement) {
            cartCountElement.innerText = totalItems; // Update count in DOM
        }
    }

    // Ensure cart count updates on every page
    updateCartCount();

    if (currentPage === "index.html") {
        // Logic for index.html
        const addToCartButtons = document.querySelectorAll(".add-to-cart");
        let cart = JSON.parse(localStorage.getItem("cart")) || []; // Load existing cart

        function addToCart(event) {
            const productCard = event.target.closest(".product-card");
            if (!productCard) return;

            // Extract product details
            const productName = productCard.querySelector("h3").textContent;
            const productPrice = productCard.querySelector(".price").childNodes[0].textContent.trim();
            const productImage = productCard.querySelector("img").src;

            const product = {
                name: productName,
                price: parseFloat(productPrice.replace("$", "")),
                image: productImage,
                quantity: 1,
            };

            // Check if the item already exists in the cart
            const existingProduct = cart.find(item => item.name === product.name);
            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.push(product);
            }

            // Save updated cart to localStorage
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartCount();
            alert("Item added to cart!");
        }

        // Attach event listeners to "Add to Cart" buttons
        addToCartButtons.forEach(button => {
            button.addEventListener("click", addToCart);
        });

    } else if (currentPage === "cart.html") {
        // Logic for cart.html
        const cartContainer = document.querySelector(".cart");
        const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
        let total = 0;

        if (cartItems.length === 0) {
            cartContainer.innerHTML = `<p>Your cart is empty. <a href="index.html">Return to shop</a></p>`;
            return;
        }
        
        // Display cart items dynamically
        cartContainer.innerHTML = `
            <div class="breadcrumb">Home / Cart</div>
            <div class="cart-header">
                <div>Product</div>
                <div>Price</div>
                <div>Quantity</div>
                <div>Subtotal</div>
            </div>
        `;

        cartItems.forEach(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;

            cartContainer.innerHTML += `
                <div class="cart-item">
                    <div class="product-details">
                        <img src="${item.image}" alt="${item.name}">
                        <span>${item.name}</span>
                    </div>
                    <div class="product-info">$${item.price.toFixed(2)}</div>
                    <div class="product-info">
                        <input type="number" value="${item.quantity}" min="1" data-name="${item.name}" class="quantity-input">
                    </div>
                    <div class="product-info subtotal">$${subtotal.toFixed(2)}</div>
                </div>
            `;
        });

        cartContainer.innerHTML += `
            <div class="cart-actions">
                <button class="return-btn">Return to Shop</button>
                <button class="clear-cart">Clear Cart</button>
            </div>
            <div class="cart-total">
                <h3>Cart Total</h3>
                <p>Total: <span>$${total.toFixed(2)}</span></p>
                <button class="checkout-btn">Proceed to Checkout</button>
            </div>
        `;

        // Update quantities dynamically
        const quantityInputs = document.querySelectorAll(".quantity-input");
        quantityInputs.forEach(input => {
            input.addEventListener("change", (event) => {
                const productName = event.target.dataset.name;
                const newQuantity = parseInt(event.target.value, 10);
                const product = cartItems.find(item => item.name === productName);
                if (product) {
                    product.quantity = newQuantity;
                    localStorage.setItem("cart", JSON.stringify(cartItems));
                    location.reload();
                }
            });
        });

        // Clear cart functionality
        const clearCartButton = document.querySelector(".clear-cart");
        clearCartButton.addEventListener("click", () => {
            localStorage.removeItem("cart");
            updateCartCount();
            location.reload();
        });

        // Return to shop functionality
        const returnButton = document.querySelector(".return-btn");
        returnButton.addEventListener("click", () => {
            window.location.href = "index.html";
        });

        // Checkout button functionality
        const checkoutButton = document.querySelector(".checkout-btn");
        checkoutButton.addEventListener("click", () => {
            localStorage.setItem("cartTotal", total.toFixed(2)); // Save total in localStorage
            window.location.href = "checkout.html";
        });

    } else if (currentPage === "checkout.html") {
        // Logic for checkout.html
        const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
        const total = parseFloat(localStorage.getItem("cartTotal")) || 0;

        const orderSummary = document.querySelector(".order-summary ul");
        orderSummary.innerHTML = ""; // Clear existing content to avoid duplicates

        cartItems.forEach(item => {
            orderSummary.innerHTML += `
                <li>
                    <img src="${item.image}" alt="${item.name}">
                    ${item.name}
                    <span>$${item.price.toFixed(2)} x ${item.quantity}</span>
                </li>
            `;
        });

        orderSummary.innerHTML += `
            <li>
                <strong>Subtotal:</strong> <span>$${total.toFixed(2)}</span>
            </li>
            <li>
                <strong>Shipping:</strong> <span>Free</span>
            </li>
            <li>
                <strong>Total:</strong> <span>$${total.toFixed(2)}</span>
            </li>
        `;

        const placeOrderButton = document.querySelector(".place-order");
        placeOrderButton.addEventListener("click", () => {
            const billingDetails = {
                firstName: document.getElementById("first-name").value,
                companyName: document.getElementById("company-name").value,
                streetAddress: document.getElementById("street-address").value,
                apartment: document.getElementById("apartment").value,
                city: document.getElementById("town-city").value,
                phone: document.getElementById("phone").value,
                email: document.getElementById("email").value,
            };

            // Store all details in localStorage
            const orderDetails = {
                billingDetails,
                cartItems,
                total: total.toFixed(2),
                orderId: Date.now(),
            };

            const previousOrders = JSON.parse(localStorage.getItem("orderHistory")) || [];
            previousOrders.push(orderDetails);
            localStorage.setItem("orderHistory", JSON.stringify(previousOrders));

            alert("Order placed successfully!");
            window.location.href = "orderdetail.html"; // Redirect to order detail page
        });
        
    } else if (currentPage === "orderdetail.html") {
        // Retrieve the selected order from localStorage
        const selectedOrder = JSON.parse(localStorage.getItem("selectedOrder"));
    
        const billingInfoContainer = document.querySelector("#billing-details");
        const orderSummaryContainer = document.querySelector(".order-summary ul");
    
        // Check if selectedOrder exists and has required details
        if (!selectedOrder || !selectedOrder.billingDetails || !selectedOrder.cartItems) {
            billingInfoContainer.innerHTML = "<p>No order details available. Please select an order from your order history.</p>";
            orderSummaryContainer.innerHTML = "";
            return;
        }
    
        // Display billing information
        const billingDetails = selectedOrder.billingDetails;
        billingInfoContainer.innerHTML = `
            <p><strong>Name:</strong> ${billingDetails.firstName}</p>
            <p><strong>Company:</strong> ${billingDetails.companyName || "N/A"}</p>
            <p><strong>Address:</strong> ${billingDetails.streetAddress}, ${billingDetails.apartment || ""}</p>
            <p><strong>City:</strong> ${billingDetails.city}</p>
            <p><strong>Phone:</strong> ${billingDetails.phone}</p>
            <p><strong>Email:</strong> ${billingDetails.email}</p>
        `;
    
        // Display order summary
        const cartItems = selectedOrder.cartItems;
        orderSummaryContainer.innerHTML = ""; // Clear any existing content
        cartItems.forEach(item => {
            orderSummaryContainer.innerHTML += `
                <li>
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px;">
                    ${item.name} - $${item.price.toFixed(2)} x ${item.quantity}
                </li>
            `;
        });

        orderSummaryContainer.innerHTML += `
            <li><strong>Order Total:</strong> $${orderDetails.total}</li>
        `;

    } else if (currentPage === "orderhistory.html") {
        // Retrieve order history from localStorage
        const orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
        const orderHistoryContainer = document.querySelector("#order-history");
        
        if (!orderHistoryContainer) {
            console.error("Order history container not found in the DOM.");
            return;
        }
        
        if (orderHistory.length === 0) {
            orderHistoryContainer.innerHTML = "<p>No previous orders found.</p>";
            return;
        }
        
        // Assign unique IDs to orders if not already present
        orderHistory.forEach((order, index) => {
            if (!order.orderId) {
                order.orderId = index + 1; // Assign a unique ID starting from 1
            }
        });
    
        // Save updated order history with IDs back to localStorage
        localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
        
        // Render order history
        orderHistoryContainer.innerHTML = "<h2>Your Order History</h2><ul></ul>";
        const orderList = orderHistoryContainer.querySelector("ul");
        
        orderHistory.forEach(order => {
            const firstProductImage = order.cartItems.length > 0 ? order.cartItems[0].image : ""; // Get the image of the first product
            
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <a href="#" class="order-link" data-order-id="${order.orderId}">
                    <img src="${firstProductImage}" alt="Order Image" style="width: 50px; height: 50px; margin-right: 10px; vertical-align: middle;">
                    Order #${order.orderId} - Total: $${order.total}
                </a>
            `;
            orderList.appendChild(listItem);
        });
    
        // Add event listener for order links
        orderList.addEventListener("click", (event) => {
            if (event.target.closest(".order-link")) {
                event.preventDefault();
                const orderLink = event.target.closest(".order-link");
                const orderId = orderLink.dataset.orderId;
                const selectedOrder = orderHistory.find(order => order.orderId === Number(orderId));
                if (selectedOrder) {
                    // Save selected order to localStorage
                    localStorage.setItem("selectedOrder", JSON.stringify(selectedOrder));
                    window.location.href = "orderdetail.html"; // Redirect to orderdetail page
                } else {
                    console.error("Selected order not found in order history.");
                }
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split("/").pop();
  
    // Handle Registration and Store User Data
    if (currentPage === "login.html") {
      const registrationForm = document.querySelector('.login-form');
      
      // Handle Registration Form Submission
      if (registrationForm) {
        registrationForm.addEventListener('submit', (event) => {
          event.preventDefault();
          const name = document.getElementById('name').value.trim();
          const email = document.getElementById('email').value.trim();
          const password = document.getElementById('password').value.trim();
  
          if (name && email && password) {
            // Store user details in localStorage
            localStorage.setItem('user', JSON.stringify({ name, email, password }));
            alert('Account created successfully! You can now log in.');
            // Redirect to login page
            window.location.href = './login.html';
          } else {
            alert('Please fill in all fields.');
          }
        });
      }
  
      // Handle Login Form Submission
      const loginForm = document.querySelector('.login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
          event.preventDefault();
          const email = document.getElementById('email').value.trim();
          const password = document.getElementById('password').value.trim();
  
          const storedUser = JSON.parse(localStorage.getItem('user'));
  
          // Check if the entered credentials match the stored user data
          if (storedUser && storedUser.email === email && storedUser.password === password) {
            alert(`Welcome back, ${storedUser.name}!`);
            // Store logged-in user details in sessionStorage
            sessionStorage.setItem('loggedInUser', JSON.stringify(storedUser));
            // Redirect to details page
            window.location.href = './details.html';
          } else {
            alert('Invalid email or password.');
          }
        });
      }
    }
    // Handle Details Page
    if (currentPage === "details.html") {
      const userDetails = JSON.parse(sessionStorage.getItem('loggedInUser'));
  
      if (userDetails) {
        // Show the user details
        document.getElementById('user-name').textContent = `Name: ${userDetails.name}`;
        document.getElementById('user-email').textContent = `Email: ${userDetails.email}`;
        
      } else {
        // If no user is logged in, prompt them to log in
        document.getElementById('user-details').innerHTML = `
          <p>No user is logged in. Please <a href="login.html">log in</a>.</p>
          
        `;
      }
    }
  });
  document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".carousel-track");
    const slides = Array.from(track.children); // Array of slides
    const dotsNav = document.querySelector(".carousel-dots"); // Dot navigation container
    const dots = Array.from(dotsNav.children); // Array of dots
    let currentIndex = 0;

    // Function to move to the correct slide
    const moveToSlide = (index) => {
        track.style.transform = `translateX(-${index * 100}%)`; // Move track
        dots.forEach(dot => dot.classList.remove("active")); // Remove active class from all dots
        dots[index].classList.add("active"); // Add active class to the current dot
    };

    // Automatically cycle through slides
    const autoSlide = () => {
        currentIndex = (currentIndex + 1) % slides.length; // Cycle through indices
        moveToSlide(currentIndex);
    };

    // Set up dot click functionality
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            currentIndex = index; // Update current index
            moveToSlide(currentIndex); // Move to the selected slide
        });
    });

    // Start automatic sliding
    let slideInterval = setInterval(autoSlide, 3000); // Change every 3 seconds

    // Pause the carousel when hovering over it
    track.addEventListener("mouseover", () => clearInterval(slideInterval)); // Stop auto sliding
    track.addEventListener("mouseout", () => (slideInterval = setInterval(autoSlide, 3000))); // Restart auto sliding
});


  