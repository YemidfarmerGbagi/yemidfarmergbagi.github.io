/* =========================================================
   PHONE ACCESSORIES MANAGER
   COMPLETE APPLICATION
   ========================================================= */


/* =========================================================
   STORAGE KEYS
   ========================================================= */

const PRODUCTS_KEY = "accessoryProducts";
const SALES_KEY = "accessorySales";
const PHONE_RECORDS_KEY = "phoneRechargeRecords";
const POS_RECORDS_KEY = "posRecords";
const USERS_KEY = "accessoryUsers";
const CURRENT_USER_KEY = "accessoryCurrentUser";

/*
   Admin recovery code.

   If you forget the Admin login:
   Login screen → Forgot Admin Login → enter 2580
*/
const ADMIN_RECOVERY_CODE = "2580";


/* =========================================================
   DATA
   ========================================================= */

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

let currentUser =
    JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null;


/* =========================================================
   BASIC HELPERS
   ========================================================= */

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


function makeId(prefix = "id") {

    return (
        prefix +
        "_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


/* =========================================================
   PAGE START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeAuthentication();

        setupForms();

    }
);


/* =========================================================
   AUTHENTICATION
   ========================================================= */

function initializeAuthentication() {

    const adminExists =
        users.some(function (user) {

            return user.role === "admin";

        });


    /*
       No Admin exists.

       Show Create Admin Account.
    */

    if (!adminExists) {

        showSetup();

        return;

    }


    /*
       Restore previous login if valid.
    */

    if (currentUser) {

        const savedUser =
            users.find(function (user) {

                return (
                    user.id === currentUser.id &&
                    user.active !== false
                );

            });


        if (savedUser) {

            currentUser = {

                id: savedUser.id,

                name: savedUser.name,

                username: savedUser.username,

                role: savedUser.role

            };


            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(currentUser)
            );


            showApplication();

            return;

        }


        currentUser = null;

        localStorage.removeItem(
            CURRENT_USER_KEY
        );

    }


    showLogin();

}


/* =========================================================
   SHOW LOGIN
   ========================================================= */

function showLogin() {

    const login =
        document.getElementById("loginScreen");

    const setup =
        document.getElementById("setupScreen");

    const app =
        document.getElementById("app");


    if (login) {
        login.classList.remove("hidden");
    }

    if (setup) {
        setup.classList.add("hidden");
    }

    if (app) {
        app.classList.add("hidden");
    }


    const username =
        document.getElementById("loginUsername");

    const password =
        document.getElementById("loginPassword");


    if (username) {
        username.value = "";
    }

    if (password) {
        password.value = "";
    }

}


/* =========================================================
   SHOW ADMIN SETUP
   ========================================================= */

function showSetup() {

    const login =
        document.getElementById("loginScreen");

    const setup =
        document.getElementById("setupScreen");

    const app =
        document.getElementById("app");


    if (login) {
        login.classList.add("hidden");
    }

    if (setup) {
        setup.classList.remove("hidden");
    }

    if (app) {
        app.classList.add("hidden");
    }

}


/* =========================================================
   SHOW APPLICATION
   ========================================================= */

function showApplication() {

    const login =
        document.getElementById("loginScreen");

    const setup =
        document.getElementById("setupScreen");

    const app =
        document.getElementById("app");


    if (login) {
        login.classList.add("hidden");
    }

    if (setup) {
        setup.classList.add("hidden");
    }

    if (app) {
        app.classList.remove("hidden");
    }


    updateUserInterface();

    initializeApplication();

}


/* =========================================================
   FORM SETUP
   ========================================================= */

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


/* =========================================================
   CREATE FIRST ADMIN
   ========================================================= */

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


    if (!username) {

        alert(
            "Please enter an Admin username."
        );

        return;

    }


    if (username.length < 3) {

        alert(
            "Username must be at least 3 characters."
        );

        return;

    }


    if (password.length < 6) {

        alert(
            "Password must be at least 6 characters."
        );

        return;

    }


    if (password !== confirmPassword) {

        alert(
            "Passwords do not match."
        );

        return;

    }


    const adminExists =
        users.some(function (user) {

            return user.role === "admin";

        });


    if (adminExists) {

        alert(
            "An Admin account already exists."
        );

        showLogin();

        return;

    }


    const usernameExists =
        users.some(function (user) {

            return (
                user.username &&
                user.username.toLowerCase() ===
                username.toLowerCase()
            );

        });


    if (usernameExists) {

        alert(
            "That username is already being used."
        );

        return;

    }


    const admin = {

        id:
            makeId("admin"),

        name:
            "Administrator",

        username:
            username,

        password:
            password,

        role:
            "admin",

        active:
            true,

        createdAt:
            new Date().toISOString()

    };


    users.push(admin);

    saveData();


    currentUser = {

        id:
            admin.id,

        name:
            admin.name,

        username:
            admin.username,

        role:
            admin.role

    };


    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(currentUser)
    );


    alert(
        "Admin account created successfully."
    );


    document
        .getElementById("setupForm")
        .reset();


    showApplication();

}


/* =========================================================
   LOGIN
   ========================================================= */

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


    if (!username || !password) {

        alert(
            "Please enter your username and password."
        );

        return;

    }


    const user =
        users.find(function (item) {

            return (

                item.username &&
                item.username.toLowerCase() ===
                username.toLowerCase() &&

                item.password ===
                password &&

                item.active !== false

            );

        });


    if (!user) {

        alert(
            "Incorrect username or password."
        );

        return;

    }


    currentUser = {

        id:
            user.id,

        name:
            user.name,

        username:
            user.username,

        role:
            user.role

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


/* =========================================================
   LOGOUT
   ========================================================= */

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


/* =========================================================
   ADMIN CHECK
   ========================================================= */

function isAdmin() {

    return !!(
        currentUser &&
        currentUser.role === "admin"
    );

}


/* =========================================================
   ADMIN RECOVERY
   ========================================================= */

function recoverAdminLogin() {

    const code =
        prompt(
            "Enter the Admin Recovery Code:"
        );


    if (code === null) {
        return;
    }


    if (code !== ADMIN_RECOVERY_CODE) {

        alert(
            "Incorrect recovery code."
        );

        return;

    }


    const confirmed =
        confirm(
            "Reset the Admin login?\n\n" +
            "Your Products, Sales, Phone/Data records " +
            "and POS records will remain safe.\n\n" +
            "Only the login accounts will be removed."
        );


    if (!confirmed) {
        return;
    }


    users = [];

    currentUser = null;


    localStorage.removeItem(
        USERS_KEY
    );

    localStorage.removeItem(
        CURRENT_USER_KEY
    );


    alert(
        "Login reset successfully.\n\n" +
        "You can now create a new Admin account."
    );


    showSetup();

}


/* =========================================================
   USER INTERFACE
   ========================================================= */

function updateUserInterface() {

    if (!currentUser) {
        return;
    }


    const loggedInUser =
        document.getElementById(
            "loggedInUser"
        );

    const loggedInRole =
        document.getElementById(
            "loggedInRole"
        );


    if (loggedInUser) {

        loggedInUser.textContent =
            currentUser.name;

    }


    if (loggedInRole) {

        loggedInRole.textContent =
            isAdmin()
                ? "Administrator"
                : "Sales Girl";

    }


    document
        .querySelectorAll(".admin-only")
        .forEach(function (element) {

            if (isAdmin()) {

                element.classList.remove(
                    "hidden"
                );

            } else {

                element.classList.add(
                    "hidden"
                );

            }

        });


    const buyingStatus =
        document.getElementById(
            "buyingPriceStatus"
        );


    if (buyingStatus) {

        buyingStatus.textContent =
            isAdmin()
                ? "👑 Admin can view buying prices."
                : "🔒 Buying prices are hidden from sales staff.";

    }

}


/* =========================================================
   APPLICATION INITIALIZATION
   ========================================================= */

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


/* =========================================================
   NAVIGATION
   ========================================================= */

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
        .forEach(function (section) {

            section.classList.remove(
                "active"
            );

        });


    document
        .querySelectorAll(".nav-btn")
        .forEach(function (navButton) {

            navButton.classList.remove(
                "active"
            );

        });


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


/* =========================================================
   DASHBOARD
   ========================================================= */

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

                return Number(product.quantity || 0) <= 5;

            }
        );


    setText(
        "totalProducts",
        totalProducts
    );

    setText(
        "totalStock",
        totalStock
    );

    setText(
        "totalSales",
        money(totalSales)
    );

    setText(
        "totalSalesProfit",
        money(totalSalesProfit)
    );

    setText(
        "phoneProfit",
        money(totalPhoneProfit)
    );

    setText(
        "posProfit",
        money(totalPOSProfit)
    
