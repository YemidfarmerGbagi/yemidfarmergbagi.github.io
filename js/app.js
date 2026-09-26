/* =====================================================
   PHONE ACCESSORIES STOCK MANAGER
===================================================== */


/* =====================================================
   DATA
===================================================== */

let products = JSON.parse(
    localStorage.getItem("accessoryProducts")
) || [];

let sales = JSON.parse(
    localStorage.getItem("accessorySales")
) || [];


/* =====================================================
   SAVE DATA
===================================================== */

function saveData() {

    localStorage.setItem(
        "accessoryProducts",
        JSON.stringify(products)
    );

    localStorage.setItem(
        "accessorySales",
        JSON.stringify(sales)
    );
}


/* =====================================================
   CURRENCY
===================================================== */

function money(amount) {

    return "₦" + Number(amount).toLocaleString("en-NG");
}


/* =====================================================
   NAVIGATION
===================================================== */

function showSection(sectionId, button) {

    document.querySelectorAll(".section")
        .forEach(section => {
            section.classList.remove("active");
        });

    document.getElementById(sectionId)
        .classList.add("active");


    document.querySelectorAll(".nav-btn")
        .forEach(btn => {
            btn.classList.remove("active");
        });

    if (button) {
        button.classList.add("active");
    }


    if (sectionId === "products") {
        displayProducts();
    }

    if (sectionId === "sales") {
        updateSaleProducts();
    }

    if (sectionId === "history") {
        displaySales();
    }

    updateDashboard();
}


/* =====================================================
   PRODUCT FORM
===================================================== */

function openProductForm() {

    document.getElementById(
        "productFormContainer"
    ).classList.remove("hidden");

    document.getElementById(
        "productFormTitle"
    ).textContent = "Add New Product";

    document.getElementById(
        "productForm"
    ).reset();

    document.getElementById(
        "editProductId"
    ).value = "";

    showSectionWithoutChangingNav("products");
}


function closeProductForm() {

    document.getElementById(
        "productFormContainer"
    ).classList.add("hidden");

    document.getElementById(
        "productForm"
    ).reset();

    document.getElementById(
        "editProductId"
    ).value = "";
}


function showSectionWithoutChangingNav(sectionId) {

    document.querySelectorAll(".section")
        .forEach(section => {
            section.classList.remove("active");
        });

    document.getElementById(sectionId)
        .classList.add("active");

    document.querySelectorAll(".nav-btn")
        .forEach(btn => {
            btn.classList.remove("active");
        });

    const button = document.querySelector(
        `.nav-btn[onclick*="${sectionId}"]`
    );

    if (button) {
        button.classList.add("active");
    }
}


/* =====================================================
   ADD / EDIT PRODUCT
===================================================== */

document.getElementById(
    "productForm"
).addEventListener("submit", function(event) {

    event.preventDefault();


    const id = document.getElementById(
        "editProductId"
    ).value;


    const name = document.getElementById(
        "productName"
    ).value.trim();


    const category = document.getElementById(
        "productCategory"
    ).value;


    const buyingPrice = Number(
        document.getElementById(
            "buyingPrice"
        ).value
    );


    const sellingPrice = Number(
        document.getElementById(
            "sellingPrice"
        ).value
    );


    const quantity = Number(
        document.getElementById(
            "productQuantity"
        ).value
    );


    if (!name) {
        alert("Please enter the product name.");
        return;
    }


    if (buyingPrice < 0 || sellingPrice < 0) {
        alert("Price cannot be negative.");
        return;
    }


    if (quantity < 0) {
        alert("Quantity cannot be negative.");
        return;
    }


    /* EDIT */

    if (id) {

        const product = products.find(
            item => item.id === id
        );

        if (product) {

            product.name = name;
            product.category = category;
            product.buyingPrice = buyingPrice;
            product.sellingPrice = sellingPrice;
            product.quantity = quantity;

        }

        alert("Product updated successfully.");

    }


    /* ADD */

    else {

        const product = {

            id: Date.now().toString(),

            name: name,

            category: category,

            buyingPrice: buyingPrice,

            sellingPrice: sellingPrice,

            quantity: quantity,

            createdAt: new Date().toISOString()

        };


        products.push(product);

        alert("Product added successfully.");

    }


    saveData();

    closeProductForm();

    displayProducts();

    updateSaleProducts();

    updateDashboard();

});


/* =====================================================
   DISPLAY PRODUCTS
===================================================== */

function displayProducts() {

    const container = document.getElementById(
        "productList"
    );


    const search = document.getElementById(
        "productSearch"
    ).value.toLowerCase().trim();


    const filteredProducts = products.filter(product => {

        return product.name
            .toLowerCase()
            .includes(search);

    });


    if (filteredProducts.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                No products found.
            </p>
        `;

        return;
    }


    container.innerHTML = filteredProducts.map(product => {

        const stockClass =
            product.quantity <= 5
                ? "stock-low"
                : "stock-good";


        return `

        <div class="product-card">

            <div class="product-top">

                <div>

                    <div class="product-name">
                        ${escapeHTML(product.name)}
                    </div>

                    <span class="category">
                        ${escapeHTML(product.category)}
                    </span>

                </div>

            </div>


            <div class="product-details">

                <div class="product-detail">

                    <span>Buying</span>

                    <strong>
                        ${money(product.buyingPrice)}
                    </strong>

                </div>


                <div class="product-detail">

                    <span>Selling</span>

                    <strong>
                        ${money(product.sellingPrice)}
                    </strong>

                </div>


                <div class="product-detail">

                    <span>Stock</span>

                    <strong class="${stockClass}">
                        ${product.quantity}
                    </strong>

                </div>

            </div>


            <div class="product-actions">

                <button
                    class="edit-btn"
                    onclick="editProduct('${product.id}')">

                    ✏️ Edit

                </button>


                <button
                    class="delete-btn"
                    onclick="deleteProduct('${product.id}')">

                    🗑️ Delete

                </button>

            </div>

        </div>

        `;

    }).join("");

}


/* =====================================================
   EDIT PRODUCT
===================================================== */

function editProduct(id) {

    const product = products.find(
        item => item.id === id
    );


    if (!product) {
        return;
    }


    document.getElementById(
        "editProductId"
    ).value = product.id;


    document.getElementById(
        "productName"
    ).value = product.name;


    document.getElementById(
        "productCategory"
    ).value = product.category;


    document.getElementById(
        "buyingPrice"
    ).value = product.buyingPrice;


    document.getElementById(
        "sellingPrice"
    ).value = product.sellingPrice;


    document.getElementById(
        "productQuantity"
    ).value = product.quantity;


    document.getElementById(
        "productFormTitle"
    ).textContent = "Edit Product";


    document.getElementById(
        "productFormContainer"
    ).classList.remove("hidden");


    showSectionWithoutChangingNav("products");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   DELETE PRODUCT
===================================================== */

function deleteProduct(id) {

    const product = products.find(
        item => item.id === id
    );


    if (!product) {
        return;
    }


    const confirmDelete = confirm(
        `Delete "${product.name}"?`
    );


    if (!confirmDelete) {
        return;
    }


    products = products.filter(
        item => item.id !== id
    );


    saveData();

    displayProducts();

    updateSaleProducts();

    updateDashboard();

    alert("Product deleted.");

}


/* =====================================================
   SALES PRODUCT DROPDOWN
===================================================== */

function updateSaleProducts() {

    const select = document.getElementById(
        "saleProduct"
    );


    const currentValue = select.value;


    select.innerHTML = `
        <option value="">
            Select a product
        </option>
    `;


    products
        .filter(product => product.quantity > 0)
        .forEach(product => {

            const option =
                document.createElement("option");

            option.value = product.id;

            option.textContent =
                `${product.name} — Stock: ${product.quantity} — ${money(product.sellingPrice)}`;

            select.appendChild(option);

        });


    select.value = currentValue;


    updateSalePreview();

}


/* =====================================================
   SALE PREVIEW
===================================================== */

document.getElementById(
    "saleProduct"
).addEventListener(
    "change",
    updateSalePreview
);


document.getElementById(
    "saleQuantity"
).addEventListener(
    "input",
    updateSalePreview
);


function updateSalePreview() {

    const productId =
        document.getElementById(
            "saleProduct"
        ).value;


    const quantity =
        Number(
            document.getElementById(
                "saleQuantity"
            ).value
        ) || 0;


    const preview =
        document.getElementById(
            "salePricePreview"
        );


    const product = products.find(
        item => item.id === productId
    );


    if (!product) {

        preview.textContent =
            "Select a product to see price.";

        return;
    }


    const total =
        product.sellingPrice * quantity;


    const profit =
        (product.sellingPrice -
         product.buyingPrice) * quantity;


    preview.innerHTML = `

        Total Sale:
        <strong>${money(total)}</strong>

        <br>

        Estimated Profit:
        <strong>${money(profit)}</strong>

    `;

}


/* =====================================================
   RECORD SALE
===================================================== */

document.getElementById(
    "saleForm"
).addEventListener("submit", function(event) {

    event.preventDefault();


    const productId =
        document.getElementById(
            "saleProduct"
        ).value;


    const quantity =
        Number(
            document.getElementById(
                "saleQuantity"
            ).value
        );


    const customer =
        document.getElementById(
            "customerName"
        ).value.trim();


    const note =
        document.getElementById(
            "saleNote"
        ).value.trim();


    const product = products.find(
        item => item.id === productId
    );


    if (!product) {

        alert("Please select a product.");

        return;
    }


    if (quantity <= 0) {

        alert("Enter a valid quantity.");

        return;
    }


    if (quantity > product.quantity) {

        alert(
            `Only ${product.quantity} item(s) available in stock.`
        );

        return;
    }


    const total =
        product.sellingPrice * quantity;


    const profit =
        (product.sellingPrice -
         product.buyingPrice) * quantity;


    const sale = {

        id: Date.now().toString(),

        productId: product.id,

        productName: product.name,

        quantity: quantity,

        sellingPrice: product.sellingPrice,

        buyingPrice: product.buyingPrice,

        total: total,

        profit: profit,

        customer: customer,

        note: note,

        date: new Date().toISOString()

    };


    sales.unshift(sale);


    /* REDUCE STOCK */

    product.quantity -= quantity;


    saveData();


    alert(
        `Sale recorded successfully!\n\nTotal: ${money(total)}`
    );


    document.getElementById(
        "saleForm"
    ).reset();


    document.getElementById(
        "saleQuantity"
    ).value = 1;


    updateSaleProducts();

    updateDashboard();

    displayProducts();

    updateSalePreview();

});


/* =====================================================
   DISPLAY SALES HISTORY
===================================================== */

function displaySales() {

    const container =
        document.getElementById(
            "salesHistory"
        );


    if (sales.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                No sales recorded yet.
            </p>
        `;

        return;
    }


    container.innerHTML = sales.map(sale => {

        const date =
            new Date(sale.date)
                .toLocaleString("en-NG");


        return `

        <div class="sale-record">

            <div class="sale-record-top">

                <div>

                    <h3>
                        ${escapeHTML(sale.productName)}
                    </h3>

                    <div class="sale-info">

                        Quantity:
                        <strong>
                            ${sale.quantity}
                        </strong>

                    </div>

                </div>


                <div class="sale-total">

                    ${money(sale.total)}

                </div>

            </div>


            <div class="sale-info">

                Customer:
                ${sale.customer
                    ? escapeHTML(sale.customer)
                    : "Walk-in customer"}

                <br>

                Profit:
                <strong>
                    ${money(sale.profit)}
                </strong>

                ${
                    sale.note
                    ? `<br>Note: ${escapeHTML(sale.note)}`
                    : ""
                }

            </div>


            <div class="sale-date">

                ${date}

            </div>

        </div>

        `;

    }).join("");

}


/* =====================================================
   CLEAR SALES
===================================================== */

function clearSales() {

    if (sales.length === 0) {

        alert("There is no sales history.");

        return;
    }


    const confirmation =
        confirm(
            "Are you sure you want to clear all sales history?"
        );


    if (!confirmation) {
        return;
    }


    sales = [];

    saveData();

    displaySales();

    updateDashboard();

    alert("Sales history cleared.");

}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const totalProducts =
        products.length;


    const totalStock =
        products.reduce(
            (total, product) =>
                total + Number(product.quantity),
            0
        );


    const totalSales =
        sales.reduce(
            (total, sale) =>
                total + Number(sale.total),
            0
        );


    const lowStockProducts =
        products.filter(
            product => product.quantity <= 5
        );


    document.getElementById(
        "totalProducts"
    ).textContent =
        totalProducts;


    document.getElementById(
        "totalStock"
    ).textContent =
        totalStock;


    document.getElementById(
        "totalSales"
    ).textContent =
        money(totalSales);


    document.getElementById(
        "lowStock"
    ).textContent =
        lowStockProducts.length;


    displayLowStock();

}


/* =====================================================
   LOW STOCK
===================================================== */

function displayLowStock() {

    const container =
        document.getElementById(
            "lowStockList"
        );


    const lowStockProducts =
        products.filter(
            product => product.quantity <= 5
        );


    if (lowStockProducts.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                No low-stock products.
            </p>
        `;

        return;
    }


    container.innerHTML =
        lowStockProducts.map(product => {

            return `

            <div class="low-stock-item">

                <span>
                    ${escapeHTML(product.name)}
                </span>

                <strong>
                    ${product.quantity} left
                </strong>

            </div>

            `;

        }).join("");

}


/* =====================================================
   OPEN SALES FORM
===================================================== */

function openSaleForm() {

    showSectionWithoutChangingNav(
        "sales"
    );

    updateSaleProducts();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   SECURITY
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   START APP
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        displayProducts();

        updateSaleProducts();

        displaySales();

        updateDashboard();

    }
);
