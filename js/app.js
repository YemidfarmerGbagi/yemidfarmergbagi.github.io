/* =====================================================
   PHONE ACCESSORIES MANAGER
   Complete Application
===================================================== */


/* =====================================================
   STORAGE KEYS
===================================================== */

const PRODUCTS_KEY = "accessoryProducts";
const SALES_KEY = "accessorySales";
const PHONE_RECORDS_KEY = "phoneRechargeRecords";
const POS_RECORDS_KEY = "posRecords";
const USERS_KEY = "accessoryUsers";
const CURRENT_USER_KEY = "accessoryCurrentUser";


/* =====================================================
   DATA
===================================================== */

let products =
    JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];

let sales =
    JSON.parse(localStorage.getItem(SALES_KEY)) || [];

let phoneRecords =
    JSON.parse(localStorage.getItem(PHONE_RECORDS_KEY)) || [];

let posRecords =
    JSON.parse(localStorage.getItem(POS_RECORDS_KEY)) || [];

let users =
    JSON.parse(localStorage.getItem(USERS_KEY)) || [];


/* =====================================================
   CURRENT USER
===================================================== */

let currentUser =
    JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null;


/* =====================================================
   HELPERS
===================================================== */

function saveData() {

    localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(products)
    );

    localStorage.setItem(
        SALES_KEY,
        JSON.stringify(sales)
    );

    localStorage.setItem(
        PHONE_RECORDS_KEY,
        JSON.stringify(phoneRecords)
    );

    localStorage.setItem(
        POS_RECORDS_KEY,
        JSON.stringify(posRecords)
    );

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );
}


function money(amount) {

    return "₦" +
        Number(amount || 0).toLocaleString("en-NG");
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function today() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-NG",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =====================================================
   AUTHENTICATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeAuthentication();

        setupForms();

    }
);


function initializeAuthentication() {

    if (users.length === 0) {

        document
            .getElementById("loginScreen")
            .classList.add("hidden");

        document
            .getElementById("setupScreen")
            .classList.remove("hidden");

        return;
    }


    if (currentUser) {

        showApplication();

    } else {

        showLogin();

    }
}


function showLogin() {

    document
        .getElementById("setupScreen")
        .classList.add("hidden");

    document
        .getElementById("loginScreen")
        .classList.remove("hidden");

    document
        .getElementById("app")
        .classList.add("hidden");
}


function showApplication() {

    document
        .getElementById("loginScreen")
        .classList.add("hidden");

    document
        .getElementById("setupScreen")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");


    updateUserInterface();

    initializeApplication();

}


function setupForms() {

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );

    }


    const setupForm =
        document.getElementById("setupForm");

    if (setupForm) {

        setupForm.addEventListener(
            "submit",
            createFirstAdmin
        );

    }


    const productForm =
        document.getElementById("productForm");

    if (productForm) {

        productForm.addEventListener(
            "submit",
            saveProduct
        );

    }


    const saleForm =
        document.getElementById("saleForm");

    if (saleForm) {

        saleForm.addEventListener(
            "submit",
            recordSale
        );

    }


    const phoneForm =
        document.getElementById("phoneRecordForm");

    if (phoneForm) {

        phoneForm.addEventListener(
            "submit",
            savePhoneRecord
        );

    }


    const posForm =
        document.getElementById("posForm");

    if (posForm) {

        posForm.addEventListener(
            "submit",
            savePOSRecord
        );

    }


    const staffForm =
        document.getElementById("staffForm");

    if (staffForm) {

        staffForm.addEventListener(
            "submit",
            createStaff
        );

    }


    const adminPasswordForm =
        document.getElementById("adminPasswordForm");

    if (adminPasswordForm) {

        adminPasswordForm.addEventListener(
            "submit",
            changeAdminPassword
        );

    }


    const saleProduct =
        document.getElementById("saleProduct");

    if (saleProduct) {

        saleProduct.addEventListener(
            "change",
            updateSalePrice
        );

    }


    const saleQuantity =
        document.getElementById("saleQuantity");

    if (saleQuantity) {

        saleQuantity.addEventListener(
            "input",
            updateSalePreview
        );

    }


    const salePrice =
        document.getElementById("salePrice");

    if (salePrice) {

        salePrice.addEventListener(
            "input",
            updateSalePreview
        );

    }


    const saleSearch =
        document.getElementById(
            "saleProductSearch"
        );

    if (saleSearch) {

        saleSearch.addEventListener(
            "input",
            filterSaleProducts
        );

    }

}


function createFirstAdmin(event) {

    event.preventDefault();


    const username =
        document
            .getElementById("setupUsername")
            .value
            .trim();

    const password =
        document
            .getElementById("setupPassword")
            .value;

    const confirmPassword =
        document
            .getElementById("setupPasswordConfirm")
            .value;


    if (password !== confirmPassword) {

        alert("Passwords do not match.");

        return;
    }


    if (password.length < 6) {

        alert(
            "Password must be at least 6 characters."
        );

        return;
    }


    const admin = {

        id: "admin_" + Date.now(),

        name: "Administrator",

        username: username,

        password: password,

        role: "admin",

        active: true,

        createdAt: new Date().toISOString()

    };


    users.push(admin);

    saveData();


    currentUser = {

        id: admin.id,

        name: admin.name,

        username: admin.username,

        role: admin.role

    };


    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(currentUser)
    );


    alert(
        "Admin account created successfully."
    );


    showApplication();
}


function handleLogin(event) {

    event.preventDefault();


    const username =
        document
            .getElementById("loginUsername")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value;


    const user =
        users.find(
            function (item) {

                return (
                    item.username.toLowerCase() ===
                    username.toLowerCase() &&

                    item.password === password &&

                    item.active !== false
                );

            }
        );


    if (!user) {

        alert(
            "Incorrect username or password."
        );

        return;
    }


    currentUser = {

        id: user.id,

        name: user.name,

        username: user.username,

        role: user.role

    };


    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(currentUser)
    );


    document
        .getElementById("loginForm")
        .reset();


    showApplication();
}


function logout() {

    if (
        !confirm(
            "Are you sure you want to logout?"
        )
    ) {
        return;
    }


    currentUser = null;

    localStorage.removeItem(
        CURRENT_USER_KEY
    );


    showLogin();
}


function isAdmin() {

    return (
        currentUser &&
        currentUser.role === "admin"
    );
}


/* =====================================================
   USER INTERFACE
===================================================== */

function updateUserInterface() {

    if (!currentUser) {
        return;
    }


    document.getElementById(
        "loggedInUser"
    ).textContent =
        currentUser.name;


    document.getElementById(
        "loggedInRole"
    ).textContent =
        isAdmin()
            ? "Administrator"
            : "Sales Girl";


    const adminButtons =
        document.querySelectorAll(
            ".admin-only"
        );


    adminButtons.forEach(
        function (element) {

            if (isAdmin()) {

                element.classList.remove(
                    "hidden"
                );

            } else {

                element.classList.add(
                    "hidden"
                );

            }

        }
    );


    const buyingStatus =
        document.getElementById(
            "buyingPriceStatus"
        );


    if (buyingStatus) {

        if (isAdmin()) {

            buyingStatus.textContent =
                "👑 Admin can view buying prices.";

        } else {

            buyingStatus.textContent =
                "🔒 Buying prices are hidden from sales staff.";

        }

    }
}


/* =====================================================
   APPLICATION INITIALIZATION
===================================================== */

function initializeApplication() {

    displayProducts();

    updateSaleProducts();

    displaySales();

    displayPhoneRecords();

    displayPOSRecords();

    displayStaff();

    updateDashboard();

    setDefaultDates();

}


/* =====================================================
   NAVIGATION
===================================================== */

function showSection(
    sectionId,
    button
) {

    if (
        sectionId === "admin" &&
        !isAdmin()
    ) {

        alert(
            "Only the Admin can access this section."
        );

        return;
    }


    document
        .querySelectorAll(".section")
        .forEach(
            function (section) {

                section.classList.remove(
                    "active"
                );

            }
        );


    document
        .querySelectorAll(".nav-btn")
        .forEach(
            function (navButton) {

                navButton.classList.remove(
                    "active"
                );

            }
        );


    const section =
        document.getElementById(sectionId);


    if (section) {

        section.classList.add("active");

    }


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


    if (sectionId === "phoneRecords") {

        displayPhoneRecords();

    }


    if (sectionId === "pos") {

        displayPOSRecords();

    }


    if (sectionId === "admin") {

        displayStaff();

    }


    updateDashboard();
}


/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {

    const totalProducts =
        products.length;


    const totalStock =
        products.reduce(
            function (total, product) {

                return total +
                    Number(product.quantity || 0);

            },
            0
        );


    const totalSales =
        sales.reduce(
            function (total, sale) {

                return total +
                    Number(sale.total || 0);

            },
            0
        );


    const totalSalesProfit =
        sales.reduce(
            function (total, sale) {

                return total +
                    Number(sale.profit || 0);

            },
            0
        );


    const totalPhoneProfit =
        phoneRecords.reduce(
            function (total, record) {

                return total +
                    Number(record.profit || 0);

            },
            0
        );


    const totalPOSProfit =
        posRecords.reduce(
            function (total, record) {

                return total +
                    Number(record.profit || 0);

            },
            0
        );


    const totalBusinessProfit =
        totalSalesProfit +
        totalPhoneProfit +
        totalPOSProfit;


    const lowStockProducts =
        products.filter(
            function (product) {

                return Number(product.quantity) <= 5;

            }
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
        "totalSalesProfit"
    ).textContent =
        money(totalSalesProfit);


    document.getElementById(
        "phoneProfit"
    ).textContent =
        money(totalPhoneProfit);


    document.getElementById(
        "posProfit"
    ).textContent =
        money(totalPOSProfit);


    document.getElementById(
        "totalBusinessProfit"
    ).textContent =
        money(totalBusinessProfit);


    document.getElementById(
        "lowStock"
    ).textContent =
        lowStockProducts.length;


    displayLowStock(
        lowStockProducts
    );
}


function displayLowStock(items) {

    const container =
        document.getElementById(
            "lowStockList"
        );


    if (items.length === 0) {

        container.innerHTML =
            `<p class="empty-message">
                No low-stock products.
            </p>`;

        return;
    }


    container.innerHTML =
        items.map(
            function (product) {

                return `
                    <div class="record-card">

                        <div class="record-card-top">

                            <div>

                                <h3>
                                    ${escapeHTML(product.name)}
                                </h3>

                                <div class="record-meta">
                                    ${escapeHTML(product.category)}
                                </div>

                            </div>

                            <strong class="stock-low">
                                ${product.quantity} left
                            </strong>

                        </div>

                    </div>
                `;

            }
        ).join("");
}


/* =====================================================
   PRODUCTS
===================================================== */

function openProductForm() {

    document
        .getElementById(
            "productFormContainer"
        )
        .classList.remove("hidden");


    document
        .getElementById(
            "productFormTitle"
        )
        .textContent =
        "Add New Product";


    document
        .getElementById(
            "productForm"
        )
        .reset();


    document
        .getElementById(
            "editProductId"
        )
        .value = "";


    document
        .getElementById(
            "products"
        )
        .scrollIntoView({
            behavior: "smooth"
        });
}


function closeProductForm() {

    document
        .getElementById(
            "productFormContainer"
        )
        .classList.add("hidden");


    document
        .getElementById(
            "productForm"
        )
        .reset();


    document
        .getElementById(
            "editProductId"
        )
        .value = "";
}


function saveProduct(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("productName")
            .value
            .trim();

    const category =
        document
            .getElementById("productCategory")
            .value;

    const buyingPrice =
        Number(
            document
                .getElementById("buyingPrice")
                .value
        );

    const sellingPrice =
        Number(
            document
                .getElementById("sellingPrice")
                .value
        );

    const quantity =
        Number(
            document
                .getElementById("productQuantity")
                .value
        );

    const editId =
        document
            .getElementById("editProductId")
            .value;


    if (!name) {

        alert(
            "Please enter a product name."
        );

        return;
    }


    if (
        buyingPrice < 0 ||
        sellingPrice < 0 ||
        quantity < 0
    ) {

        alert(
            "Prices and quantity cannot be negative."
        );

        return;
    }


    if (editId) {

        const product =
            products.find(
                function (item) {

                    return item.id === editId;

                }
            );


        if (product) {

            product.name = name;

            product.category = category;

            product.buyingPrice =
                buyingPrice;

            product.sellingPrice =
                sellingPrice;

            product.quantity =
                quantity;

            alert(
                "Product updated successfully."
            );

        }

    } else {

        products.push({

            id:
                Date.now().toString(),

            name,

            category,

            buyingPrice,

            sellingPrice,

            quantity,

            createdAt:
                new Date().toISOString()

        });


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
            document
                .getElementById(
                    "productSearch"
                )
                ?.value || ""
        )
        .toLowerCase()
        .trim();


    const filtered =
        products.filter(
            function (product) {

                return product.name
                    .toLowerCase()
                    .includes(search);

            }
        );


    if (filtered.length === 0) {

        container.innerHTML =
            `<p class="empty-message">
           
