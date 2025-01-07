document.addEventListener("DOMContentLoaded", () => {
    const ordersContainer = document.getElementById("orders-container");
    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    if (orders.length === 0) {
        ordersContainer.innerHTML = "<p>No orders found.</p>";
        return;
    }

    let ordersHTML = `
        <table>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
    `;

    orders.forEach(order => {
        ordersHTML += `
            <tr>
                <td>${order.orderId}</td>
                <td>${order.date}</td>
                <td>$${order.total}</td>
                <td><a href="order-details.html?orderId=${order.orderId}">View Details</a></td>
            </tr>
        `;
    });

    ordersHTML += "</tbody></table>";
    ordersContainer.innerHTML = ordersHTML;
});
