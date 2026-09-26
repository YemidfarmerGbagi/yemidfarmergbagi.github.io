/* =====================================================
   PHONE ACCESSORIES STOCK MANAGER
===================================================== */


/* =====================================================
   OWNER PASSKEY
===================================================== */

/*
   CHANGE THIS NUMBER IF YOU WANT A DIFFERENT PASSKEY.

   Example:
   const OWNER_PASSKEY = "1234";
*/

const OWNER_PASSKEY = "2580";


/*
   Buying prices are hidden by default.
*/

let buyingPricesUnlocked = false;



/* =====================================================
   DATA
===================================================== */

let products =
    JSON.parse(
        localStorage.getItem("accessoryProducts")
    ) || [];


let sales =
    JSON.parse(
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

    return "₦" +
        Number(amount || 0)
            .toLocaleString("en-NG");

}



/* =====================================================
   PASSKEY
===================================================== */

function requestPasskey() {

    const entered =
        prompt("🔐 Enter owner passkey:");

    if (entered === null) {

        return false;

    }


    if (entered !== OWNER_PASSKEY) {

        alert("❌ Incorrect passkey.");

        return false;

    }


    return true;

}



/* =====================================================
   BUYING PRICE VISIBILITY
===================================================== */

function toggleBuyingPrices() {

    if (buyingPricesUnlocked) {

        buyingPricesUnlocked = false;

        updateBuyingPriceStatus();

        displayProducts();

        return;

    }


    if (!requestPasskey()) {

        return;

    }


    buyingPricesUnlocked = true;

    updateBuyingPriceStatus();

    displayProducts();

}


function updateBuyingPriceStatus() {

    const status =
        document.getElementById(
            "buyingPriceStatus"
        );


    if (!status) {

        return;

    }


    if (buyingPricesUnlocked) {

        status.className =
            "unlocked-message";

        status.textContent =
            "🔓 Buying prices are visible. Tap the button again to hide them.";

    } else {

        status.className =
            "locked-message";

        status.textContent =
            "🔒 Buying prices are hidden.";

    }

}



/* =====================================================
   NAVIGATION
===================================================== */

function showSection(sectionId, button) {

    document.querySelectorAll(".section")
        .forEach(section => {

            section.classList.remove("active");

        });


    const section =
        document.getElementById(sectionId);


    if (section) {

        section.classList.add("active");

    }


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
   SHOW SECTION WITHOUT NAV CHANGE
===================================================== */

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


    const button =
        document.querySelector(
            `.nav-btn[onclick*="${sectionId}"]`
        );


    if (button) {

        button.classList.add("active");

    }

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
    ).textContent =
        "Add New Product";


    document.getElementById(
        "productForm"
    ).reset();


    document.getElementById(
        "editProductId"
    ).value = "";


    showSectionWithoutChangingNav(
        "products"
    );

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



/* =====================================================
   ADD / EDIT PRODUCT
===================================================== */

document.getElementById(
    "productForm"
).addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const id =
            document.getElementById(
                "editProductId"
            ).value;


        const name =
            document.getElementById(
                "productName"
            ).value.trim();


        const category =
            document.getElementById(
                "productCategory"
            ).value;


        const buyingPrice =
            Number(
                document.getElementById(
                    "buyingPrice"
                ).value
            );


        const sellingPrice =
            Number(
                document.getElementById(
                    "sellingPrice"
                ).value
            );


        const quantity =
            Number(
                document.getElementById(
                    "productQuantity"
                ).value
            );


        if (!name) {

            alert(
                "Please enter the product name."
            );

            return;

        }


        if (
            buyingPrice < 0 ||
            sellingPrice < 0
        ) {

            alert(
                "Price cannot be negative."
            );

            return;

        }


        if (quantity < 0) {

            alert(
                "Quantity cannot be negative."
            );

            return;

        }



        /* =============================================
           EDIT PRODUCT
        ============================================= */

        if (id) {


            /*
               Editing a product contains the buying price,
               so require the owner passkey.
            */

            if (!requestPasskey()) {

                return;

            }


            const product =
                products.find(
                    item => item.id === id
                );


            if (product) {

                product.name =
                    name;

                product.category =
                    category;

                product.buyingPrice =
                    buyingPrice;

                product.sellingPrice =
                    sellingPrice;

                product.quantity =
                    quantity;

            }


            alert(
                "Product updated successfully."
            );

        }



        /* =============================================
           ADD PRODUCT
        ============================================= */

        else {


            const product = {

                id:
                    Date.now().toString(),

                name:
                    name,

                category:
                    category,

                buyingPrice:
                    buyingPrice,

                sellingPrice:
                    sellingPrice,

                quantity:
                    quantity,

                createdAt:
                    new Date().toISOString()

            };


            products.push(product);


            alert(
                "Product added successfully."
            );

        }



        saveData();


        closeProductForm();


        displayProducts();


        updateSaleProducts();


        updateDashboard();

    }
);



/* =====================================================
   DISPLAY PRODUCTS
===================================================== */

function displayProducts() {

    const container =
        document.getElementById(
            "productList"
        );


    if (!container) {

        return;

    }


    const search =
        (
            document.getElementById(
                "productSearch"
            ).value || ""
        )
        .toLowerCase()
        .trim();


    const filteredProducts =
        products.filter(product => {

            return (
                product.name || ""
            )
            .toLowerCase()
            .includes(search);

        });


    if (
        filteredProducts.length === 0
    ) {

        container.innerHTML = `

            <p class="empty-message">

                No products found.

            </p>

        `;

        return;

    }



    container.innerHTML =
        filteredProducts
        .map(product => {


            const stockClass =
                product.quantity <= 5
                    ? "stock-low"
                    : "stock-good";


            const buyingPriceHTML =
                buyingPricesUnlocked

                    ? `
                        <strong>
                            ${money(
                                product.buyingPrice
                            )}
                        </strong>
                      `

                    : `
                        <strong class="price-hidden">
                            🔒 Hidden
                        </strong>
                      `;



            return `

            <div class="product-card">


                <div class="product-top">

                    <div>

                        <div class="product-name">

                            ${escapeHTML(
                                product.name
                            )}

                        </div>


                        <span class="category">

                            ${escapeHTML(
                                product.category
                            )}

                        </span>

                    </div>

                </div>



                <div class="product-details">


                    <div class="product-detail">

                        <span>
                            Buying
                        </span>

                        ${buyingPriceHTML}

                    </div>



                    <div class="product-detail">

                        <span>
                            Selling
                        </span>

                        <strong>
                            ${money(
                                product.sellingPrice
                            )}
                        </strong>

                    </div>



                    <div class="product-detail">

                        <span>
                            Stock
                        </span>

                        <strong
                            class="${stockClass}">

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

        })
        .join("");

}



/* =====================================================
   EDIT PRODUCT
===================================================== */

function editProduct(id) {

    /*
       Editing exposes buying price,
       so require the owner passkey.
    */

    if (!requestPasskey()) {

        return;

    }


    const product =
        products.find(
            item => item.id === id
        );


    if (!product) {

        return;

    }


    document.getElementById(
        "editProductId"
    ).value =
        product.id;


    document.getElementById(
        "productName"
    ).value =
        product.name;


    document.getElementById(
        "productCategory"
    ).value =
        product.category;


    document.getElementById(
        "buyingPrice"
    ).value =
        product.buyingPrice;


    document.getElementById(
        "sellingPrice"
    ).value =
        product.sellingPrice;


    document.getElementById(
        "productQuantity"
    ).value =
        product.quantity;


    document.getElementById(
        "productFormTitle"
    ).textContent =
        "Edit Product";


    document.getElementById(
        "productFormContainer"
    ).classList.remove("hidden");


    showSectionWithoutChangingNav(
        "products"
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}



/* =====================================================
   DELETE PRODUCT
===================================================== */

function deleteProduct(id) {

    const product =
        products.find(
            item => item.id === id
        );


    if (!product) {

        return;

    }


    const confirmDelete =
        confirm(
            `Delete "${product.name}"?`
        );


    if (!confirmDelete) {

        return;

    }


    products =
        products.filter(
            item => item.id !== id
        );


    saveData();


    displayProducts();


    updateSaleProducts();


    updateDashboard();


    alert(
        "Product deleted."
    );

}



/* =====================================================
   SALES PRODUCT DROPDOWN
===================================================== */

function updateSaleProducts() {

    const select =
        document.getElementById(
            "saleProduct"
        );


    if (!select) {

        return;

    }


    const currentValue =
        select.value;


    const searchInput =
        document.getElementById(
            "saleProductSearch"
        );


    const search =
        (
            searchInput
                ? searchInput.value
                : ""
        )
        .toLowerCase()
        .trim();


    select.innerHTML = `

        <option value="">

            Select a product

        </option>

    `;



    products

        .filter(
            product =>
                product.quantity > 0
        )

        .filter(
            product =>
                (
                    product.name || ""
                )
                .toLowerCase()
                .includes(search)
        )

        .forEach(product => {


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                product.id;


            option.textContent =
                `${product.name} — Stock: ${product.quantity} — ${money(product.sellingPrice)}`;


            select.appendChild(
                option
            );

        });



    /*
       Keep selected product if it still exists.
    */

    const stillExists =
        Array.from(
            select.options
        )
        .some(
            option =>
                option.value === currentValue
        );


    if (stillExists) {

        select.value =
            currentValue;

    }


    updateSalePreview();

}



/* =====================================================
   SEARCH SALES PRODUCTS
===================================================== */

document.getElementById(
    "saleProductSearch"
).addEventListener(
    "input",
    function() {

        updateSaleProducts();

    }
);



/* =====================================================
   CLEAR SALES PRODUCT SEARCH
===================================================== */

function clearSaleProductSearch() {

    const search =
        document.getElementById(
            "saleProductSearch"
        );


    search.value = "";


    updateSaleProducts();


    search.focus();

}



/* =====================================================
   WHEN PRODUCT IS SELECTED
===================================================== */

document.getElementById(
    "saleProduct"
).addEventListener(
    "change",
    function() {

        const product =
            products.find(
                item =>
                    item.id === this.value
            );


        if (product) {

            document.getElementById(
                "salePrice"
            ).value =
                product.sellingPrice;

        }


        updateSalePreview();

    }
);



/* =====================================================
   SALE QUANTITY
===================================================== */

document.getElementById(
    "saleQuantity"
).addEventListener(
    "input",
    updateSalePreview
);



/* =====================================================
   SALE PRICE
===================================================== */

document.getElementById(
    "salePrice"
).addEventListener(
    "input",
    updateSalePreview
);



/* =====================================================
   SALE PREVIEW
===================================================== */

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


    const salePrice =
        Number(
            document.getElementById(
                "salePrice"
            ).value
        ) || 0;


    const preview =
        document.getElementById(
            "salePricePreview"
        );


    const product =
        products.find(
            item =>
                item.id === productId
        );


    if (!product) {

        preview.innerHTML = `

            Select a product to see sale details.

        `;

        return;

    }


    const total =
        salePrice * quantity;


    const profit =
        (
            salePrice -
            Number(product.buyingPrice)
        ) * quantity;


    preview.innerHTML = `

        <div class="preview-row">

            <span>
                Normal Price
            </span>

            <strong>
                ${money(product.sellingPrice)}
            </strong>

        </div>


        <div class="preview-row">

            <span>
                Actual Sale Price
            </span>

            <strong>
                ${money(salePrice)}
            </strong>

        </div>


        <div class="preview-row">

            <span>
                Quantity
            </span>

            <strong>
                ${quantity}
            </strong>

        </div>


        <div class="preview-total">

            Total Sale:
            <strong>
                ${money(total)}
            </strong>

        </div>


        <div class="preview-profit">

            Estimated Profit:
            <strong>
                ${money(profit)}
            </strong>

        </div>

    `;

}



/* =====================================================
   RECORD SALE
===================================================== */

document.getElementById(
    "saleForm"
).addEventListener(
    "submit",
    function(event) {

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


        const actualSellingPrice =
            Number(
                document.getElementById(
                    "salePrice"
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


        const product =
            products.find(
                item =>
                    item.id === productId
            );


        if (!product) {

            alert(
                "Please select a product."
            );

            return;

        }


        if (quantity <= 0) {

            alert(
                "Enter a valid quantity."
            );

            return;

        }


        if (actualSellingPrice < 0) {

            alert(
                "Selling price cannot be negative."
            );

            return;

        }


        if (
            quantity >
            product.quantity
        ) {

            alert(
                `Only ${product.quantity} item(s) available in stock.`
            );

            return;

        }



        const total =
            actualSellingPrice *
            quantity;


        const profit =
            (
                actualSellingPrice -
                Number(product.buyingPrice)
            ) *
            quantity;



        const sale = {

            id:
                Date.now().toString(),

            productId:
                product.id,

            productName:
                product.name,

            quantity:
                quantity,

            sellingPrice:
                actualSellingPrice,

            buyingPrice:
                Number(product.buyingPrice),

            total:
                total,

            profit:
                profit,

            customer:
                customer,

            note:
                note,

            date:
                new Date().toISOString()

        };


        sales.unshift(
            sale
        );


        /* REDUCE STOCK */

        product.quantity -=
            quantity;


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


        document.getElementById(
            "salePrice"
        ).value = "";


        document.getElementById(
            "saleProductSearch"
        ).value = "";


        updateSaleProducts();


        updateDashboard();


        displayProducts();


        updateSalePreview();

    }
);



/* =====================================================
   DISPLAY SALES HISTORY
===================================================== */

function displaySales() {

    const container =
        document.getElementById(
            "salesHistory"
        );


    if (!container) {

        return;

    }


    if (sales.length === 0) {

        container.innerHTML = `

            <p class="empty-message">

                No sales recorded yet.

            </p>

        `;

        return;

    }


    container.innerHTML =
        sales.map(sale => {


            const date =
                new Date(
                    sale.date
                )
                .toLocaleString(
                    "en-NG"
                );


            return `

            <div class="sale-record">


                <div class="sale-record-top">


                    <div>

                        <h3>

                            ${escapeHTML(
                                sale.productName
                            )}

                        </h3>


                        <div class="sale-info">

                            Quantity:

                            <strong>
                                ${sale.quantity}
                            </strong>

                        </div>

                    </div>



                    <div class="sale-total">

                        ${money(
                            sale.total
                        )}

                    </div>


                </div>



                <div class="sale-info">

                    Selling Price:

                    <strong>
                        ${money(
                            sale.sellingPrice
                        )}
                    </strong>


                    <br>


                    Customer:

                    ${
                        sale.customer
                            ? escapeHTML(
                                sale.customer
                              )
                            : "Walk-in customer"
                    }


                    <br>


                    Profit:

                    <strong>
                        ${money(
                            sale.profit
                        )}
                    </strong>


                    ${
                        sale.note
                            ? `
                                <br>
                                Note:
                                ${escapeHTML(
                                    sale.note
                                )}
                              `
                            : ""
                    }

                </div>



                <div class="sale-date">

                    ${date}

                </div>


            </div>

            `;

        })
        .join("");

}



/* =====================================================
   CLEAR SALES
===================================================== */

function clearSales() {

    if (sales.length === 0) {

        alert(
            "There is no sales history."
        );

        return;

    }


    /*
       Clearing all sales is protected
       by the owner passkey.
    */

    if (!requestPasskey()) {

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


    alert(
        "Sales history cleared."
    );

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
                total +
                Number(
                    product.quantity
                ),
            0
        );


    const totalSales =
        sales.reduce(
            (total, sale) =>
                total +
                Number(
                    sale.total
                ),
            0
        );


    const lowStockProducts =
        products.filter(
            product =>
                product.quantity <= 5
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
            product =>
                product.quantity <= 5
        );


    if (
        lowStockProducts.length === 0
    ) {

        container.innerHTML = `

            <p class="empty-message">

                No low-stock products.

            </p>

        `;

        return;

    }


    container.innerHTML =
        lowStockProducts
        .map(product => {

            return `

            <div class="low-stock-item">

                <span>

                    ${escapeHTML(
                        product.name
                    )}

                </span>


                <strong>

                    ${product.quantity}
                    left

                </strong>

            </div>

            `;

        })
        .join("");

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
   SECURITY / HTML ESCAPE
===================================================== */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

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

        updateBuyingPriceStatus();

    }
);
