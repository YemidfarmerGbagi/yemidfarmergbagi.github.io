/* =========================================================
   PHONE ACCESSORIES MANAGER
   COMPLETE js/app.js
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const KEYS = {
  products: "accessoryProducts",
  sales: "accessorySales",
  phone: "phoneRechargeRecords",
  pos: "posRecords",
  users: "accessoryUsers",
  current: "accessoryCurrentUser"
};


/* =========================================================
   ADMIN RECOVERY CODE
========================================================= */

const ADMIN_RECOVERY_CODE = "2580";


/* =========================================================
   APPLICATION DATA
========================================================= */

let products = loadData(KEYS.products, []);
let sales = loadData(KEYS.sales, []);
let phoneRecords = loadData(KEYS.phone, []);
let posRecords = loadData(KEYS.pos, []);
let users = loadData(KEYS.users, []);
let currentUser = loadData(KEYS.current, null);

let buyingPricesVisible = false;


/* =========================================================
   STORAGE HELPERS
========================================================= */

function loadData(key, fallback = []) {
  try {
    const saved = localStorage.getItem(key);

    if (saved === null) {
      return fallback;
    }

    return JSON.parse(saved);
  } catch (error) {
    console.error("Storage error:", error);
    return fallback;
  }
}


function saveAll() {
  localStorage.setItem(
    KEYS.products,
    JSON.stringify(products)
  );

  localStorage.setItem(
    KEYS.sales,
    JSON.stringify(sales)
  );

  localStorage.setItem(
    KEYS.phone,
    JSON.stringify(phoneRecords)
  );

  localStorage.setItem(
    KEYS.pos,
    JSON.stringify(posRecords)
  );

  localStorage.setItem(
    KEYS.users,
    JSON.stringify(users)
  );
}


/* =========================================================
   GENERAL HELPERS
========================================================= */

function money(value) {
  return (
    "₦" +
    Number(value || 0).toLocaleString("en-NG")
  );
}


function makeId(prefix) {
  return (
    prefix +
    "_" +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .substring(2, 9)
  );
}


function today() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}


function formatDateTime(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString("en-NG");
}


function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}


function escapeHTML(value) {
  return String(value ?? "")
    .replace(
      /[&<>"']/g,
      function (character) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        }[character];
      }
    );
}


function isAdmin() {
  return !!(
    currentUser &&
    currentUser.role === "admin"
  );
}


function userExists(username) {
  return users.some(function (user) {
    return (
      user.username &&
      user.username.toLowerCase() ===
        username.toLowerCase()
    );
  });
}


function getAdminUser() {
  return users.find(function (user) {
    return user.role === "admin";
  });
}


/* =========================================================
   START APPLICATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {
    bindForms();
    initializeAuthentication();
  }
);


/* =========================================================
   FORM EVENTS
========================================================= */

function bindForms() {
  const loginForm =
    document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener(
      "submit",
      login
    );
  }


  const setupForm =
    document.getElementById("setupForm");

  if (setupForm) {
    setupForm.addEventListener(
      "submit",
      createAdmin
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
    document.getElementById(
      "phoneRecordForm"
    );

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


  const passwordForm =
    document.getElementById(
      "adminPasswordForm"
    );

  if (passwordForm) {
    passwordForm.addEventListener(
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
    document.getElementById(
      "saleQuantity"
    );

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
   AUTHENTICATION
========================================================= */

function initializeAuthentication() {
  const adminExists = users.some(
    function (user) {
      return user.role === "admin";
    }
  );


  /*
     IMPORTANT:

     If there is no Admin account saved,
     show Admin setup.

     Once Admin is created, this will NOT
     appear again on the same browser unless
     the site data/accounts are cleared.
  */

  if (!adminExists) {
    currentUser = null;

    localStorage.removeItem(
      KEYS.current
    );

    showSetup();

    return;
  }


  /*
     Try to restore the previous login.
  */

  if (currentUser) {
    const savedUser = users.find(
      function (user) {
        return (
          user.id === currentUser.id &&
          user.active !== false
        );
      }
    );


    if (savedUser) {
      currentUser = {
        id: savedUser.id,
        name: savedUser.name,
        username: savedUser.username,
        role: savedUser.role
      };


      localStorage.setItem(
        KEYS.current,
        JSON.stringify(currentUser)
      );


      showApplication();

      return;
    }
  }


  showLogin();
}


/* =========================================================
   SCREEN CONTROL
========================================================= */

function toggleScreens(activeScreen) {
  const screens = [
    "loginScreen",
    "setupScreen",
    "app"
  ];


  screens.forEach(function (id) {
    const element =
      document.getElementById(id);

    if (!element) {
      return;
    }

    element.classList.toggle(
      "hidden",
      id !== activeScreen
    );
  });
}


function showLogin() {
  toggleScreens("loginScreen");

  const username =
    document.getElementById(
      "loginUsername"
    );

  const password =
    document.getElementById(
      "loginPassword"
    );

  if (username) {
    username.value = "";
  }

  if (password) {
    password.value = "";
  }
}


function showSetup() {
  toggleScreens("setupScreen");
}


function showApplication() {
  toggleScreens("app");

  updateUserInterface();

  initializeApplication();
}


/* =========================================================
   CREATE FIRST ADMIN
========================================================= */

function createAdmin(event) {
  event.preventDefault();


  const username =
    document
      .getElementById("setupUsername")
      .value
      .trim();


  const password =
    document.getElementById(
      "setupPassword"
    ).value;


  const confirmPassword =
    document.getElementById(
      "setupPasswordConfirm"
    ).value;


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


  if (getAdminUser()) {
    showLogin();
    return;
  }


  if (userExists(username)) {
    alert(
      "That username is already being used."
    );

    return;
  }


  const admin = {
    id: makeId("admin"),
    name: "Administrator",
    username: username,
    password: password,
    role: "admin",
    active: true,
    createdAt: new Date().toISOString()
  };


  users.push(admin);

  saveAll();

  setCurrentUser(admin);


  const form =
    document.getElementById(
      "setupForm"
    );

  if (form) {
    form.reset();
  }


  alert(
    "✅ Admin account created successfully."
  );


  showApplication();
}


/* =========================================================
   SET CURRENT USER
========================================================= */

function setCurrentUser(user) {
  currentUser = {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role
  };


  localStorage.setItem(
    KEYS.current,
    JSON.stringify(currentUser)
  );
}


/* =========================================================
   LOGIN
========================================================= */

function login(event) {
  event.preventDefault();


  const username =
    document
      .getElementById(
        "loginUsername"
      )
      .value
      .trim();


  const password =
    document.getElementById(
      "loginPassword"
    ).value;


  const user = users.find(
    function (item) {
      return (
        item.username &&
        item.username.toLowerCase() ===
          username.toLowerCase() &&
        item.password === password &&
        item.active !== false
      );
    }
  );


  if (!user) {
    alert(
      "❌ Incorrect username or password."
    );

    return;
  }


  setCurrentUser(user);


  const form =
    document.getElementById(
      "loginForm"
    );

  if (form) {
    form.reset();
  }


  showApplication();
}


/* =========================================================
   FORGOT ADMIN LOGIN
========================================================= */

function recoverAdminLogin() {
  const code = prompt(
    "🔑 ADMIN PASSWORD RECOVERY\n\nEnter the recovery code:"
  );


  if (code === null) {
    return;
  }


  if (
    code.trim() !==
    ADMIN_RECOVERY_CODE
  ) {
    alert(
      "❌ Incorrect recovery code."
    );

    return;
  }


  const admin = getAdminUser();


  /*
     If there is no Admin at all,
     allow a fresh Admin setup.
  */

  if (!admin) {
    alert(
      "No Admin account was found.\n\nYou can create a new Admin account now."
    );

    showSetup();

    return;
  }


  const newPassword = prompt(
    "✅ Recovery accepted.\n\nEnter your new Admin password:"
  );


  if (newPassword === null) {
    return;
  }


  if (newPassword.length < 6) {
    alert(
      "❌ Password must be at least 6 characters."
    );

    return;
  }


  const confirmPassword = prompt(
    "Confirm your new Admin password:"
  );


  if (confirmPassword === null) {
    return;
  }


  if (newPassword !== confirmPassword) {
    alert(
      "❌ Passwords do not match."
    );

    return;
  }


  admin.password = newPassword;

  saveAll();


  alert(
    "✅ Admin password changed successfully.\n\nYou can now log in with your new password."
  );


  showLogin();
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
    KEYS.current
  );


  showLogin();
}


/* =========================================================
   USER INTERFACE
========================================================= */

function updateUserInterface() {
  if (!currentUser) {
    return;
  }


  setText(
    "loggedInUser",
    currentUser.name
  );


  setText(
    "loggedInRole",
    isAdmin()
      ? "Administrator"
      : "Sales Staff"
  );


  document
    .querySelectorAll(".admin-only")
    .forEach(function (element) {
      element.classList.toggle(
        "hidden",
        !isAdmin()
      );
    });


  setText(
    "buyingPriceStatus",
    isAdmin()
      ? "👑 Admin can view buying prices."
      : "🔒 Buying prices are hidden from sales staff."
  );
}


/* =========================================================
   APPLICATION INITIALIZATION
========================================================= */

function initializeApplication() {
  displayProducts();

  updateSaleProducts();

  displayPhoneRecords();

  displayPOSRecords();

  displaySales();

  displayStaff();

  updateDashboard();

  setDefaultDates();
}


/* =========================================================
   DEFAULT DATES
========================================================= */

function setDefaultDates() {
  const phoneDate =
    document.getElementById(
      "phoneDate"
    );

  const posDate =
    document.getElementById(
      "posDate"
    );


  if (phoneDate && !phoneDate.value) {
    phoneDate.value = today();
  }


  if (posDate && !posDate.value) {
    posDate.value = today();
  }
}


/* =========================================================
   NAVIGATION
========================================================= */

function showSection(
  sectionId,
  button
) {
  if (!currentUser) {
    showLogin();
    return;
  }


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
    document.getElementById(
      sectionId
    );


  if (section) {
    section.classList.add(
      "active"
    );
  }


  if (button) {
    button.classList.add(
      "active"
    );
  }


  if (sectionId === "dashboard") {
    updateDashboard();
  }


  if (sectionId === "products") {
    displayProducts();
  }


  if (sectionId === "sales") {
    updateSaleProducts();
    updateSalePreview();
  }


  if (sectionId === "phoneRecords") {
    displayPhoneRecords();
  }


  if (sectionId === "pos") {
    displayPOSRecords();
  }


  if (sectionId === "history") {
    displaySales();
  }


  if (sectionId === "admin") {
    displayStaff();
  }
}


/* =========================================================
   QUICK ACTIONS
========================================================= */

function openSaleForm() {
  showSection(
    "sales",
    document.querySelector(
      '.nav-btn[onclick*="sales"]'
    )
  );


  const select =
    document.getElementById(
      "saleProduct"
    );


  if (select) {
    select.focus();
  }
}


function openPhoneRecordForm() {
  showSection(
    "phoneRecords",
    document.querySelector(
      '.nav-btn[onclick*="phoneRecords"]'
    )
  );


  const container =
    document.getElementById(
      "phoneRecordFormContainer"
    );


  if (container) {
    container.classList.remove(
      "hidden"
    );

    container.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}


function openPOSForm() {
  showSection(
    "pos",
    document.querySelector(
      '.nav-btn[onclick*="pos"]'
    )
  );


  const container =
    document.getElementById(
      "posFormContainer"
    );


  if (container) {
    container.classList.remove(
      "hidden"
    );

    container.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {
  const totalSales =
    sales.reduce(function (
      total,
      sale
    ) {
      return (
        total +
        Number(sale.total || 0)
      );
    }, 0);


  const salesProfit =
    sales.reduce(function (
      total,
      sale
    ) {
      return (
        total +
        Number(sale.profit || 0)
      );
    }, 0);


  const phoneProfit =
    phoneRecords.reduce(function (
      total,
      record
    ) {
      return (
        total +
        Number(record.profit || 0)
      );
    }, 0);


  const posProfit =
    posRecords.reduce(function (
      total,
      record
    ) {
      return (
        total +
        Number(record.profit || 0)
      );
    }, 0);


  const totalBusinessProfit =
    salesProfit +
    phoneProfit +
    posProfit;


  const totalStock =
    products.reduce(function (
      total,
      product
    ) {
      return (
        total +
        Number(product.quantity || 0)
      );
    }, 0);


  const lowStockProducts =
    products.filter(function (
      product
    ) {
      return (
        Number(product.quantity || 0) <= 5
      );
    });


  setText(
    "totalProducts",
    products.length
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
    money(salesProfit)
  );


  setText(
    "phoneProfit",
    money(phoneProfit)
  );


  setText(
    "posProfit",
    money(posProfit)
  );


  setText(
    "totalBusinessProfit",
    money(totalBusinessProfit)
  );


  setText(
    "lowStock",
    lowStockProducts.length
  );


  const lowStockList =
    document.getElementById(
      "lowStockList"
    );


  if (!lowStockList) {
    return;
  }


  if (
    lowStockProducts.length === 0
  ) {
    lowStockList.innerHTML = `
      <p class="empty-message">
        No low-stock products.
      </p>
    `;

    return;
  }


  lowStockList.innerHTML =
    lowStockProducts
      .map(function (product) {
        return `
          <div class="record-card">

            <div class="record-head">

              <b>
                ${escapeHTML(product.name)}
              </b>

              <span class="stock-low">
                ${Number(product.quantity || 0)} left
              </span>

            </div>

            <div class="record-meta">
              ${escapeHTML(product.category || "Other")}
            </div>

          </div>
        `;
      })
      .join("");
}


/* =========================================================
   PRODUCTS
========================================================= */

function openProductForm(
  productId = null
) {
  if (!isAdmin()) {
    alert(
      "Only the Admin can add or edit products."
    );

    return;
  }


  const container =
    document.getElementById(
      "productFormContainer"
    );


  const form =
    document.getElementById(
      "productForm"
    );


  if (!container || !form) {
    return;
  }


  container.classList.remove(
    "hidden"
  );


  form.reset();


  const product =
    productId
      ? products.find(function (
          item
        ) {
          return item.id === productId;
        })
      : null;


  setText(
    "productFormTitle",
    product
      ? "Edit Product"
      : "Add New Product"
  );


  const editId =
    document.getElementById(
      "editProductId"
    );


  if (editId) {
    editId.value =
      product
        ? product.id
        : "";
  }


  if (product) {
    document.getElementById(
      "productName"
    ).value = product.name || "";


    document.getElementById(
      "productCategory"
    ).value =
      product.category || "Other";


    document.getElementById(
      "buyingPrice"
    ).value =
      Number(product.buyingPrice || 0);


    document.getElementById(
      "sellingPrice"
    ).value =
      Number(product.sellingPrice || 0);


    document.getElementById(
      "productQuantity"
    ).value =
      Number(product.quantity || 0);
  }


  container.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


function closeProductForm() {
  const container =
    document.getElementById(
      "productFormContainer"
    );


  if (container) {
    container.classList.add(
      "hidden"
    );
  }


  const form =
    document.getElementById(
      "productForm"
    );


  if (form) {
    form.reset();
  }


  const editId =
    document.getElementById(
      "editProductId"
    );


  if (editId) {
    editId.value = "";
  }
}


function saveProduct(event) {
  event.preventDefault();


  if (!isAdmin()) {
    alert(
      "Admin access required."
    );

    return;
  }


  const name =
    document
      .getElementById(
        "productName"
      )
      .value
      .trim();


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
    !Number.isFinite(buyingPrice) ||
    buyingPrice < 0
  ) {
    alert(
      "Please enter a valid buying price."
    );

    return;
  }


  if (
    !Number.isFinite(sellingPrice) ||
    sellingPrice < 0
  ) {
    alert(
      "Please enter a valid selling price."
    );

    return;
  }


  if (
    !Number.isFinite(quantity) ||
    quantity < 0
  ) {
    alert(
      "Please enter a valid quantity."
    );

    return;
  }


  const editId =
    document.getElementById(
      "editProductId"
    ).value;


  if (editId) {
    const product =
      products.find(function (
        item
      ) {
        return item.id === editId;
      });


    if (!product) {
      alert(
        "Product could not be found."
      );

      return;
    }


    product.name = name;
    product.category = category;
    product.buyingPrice =
      buyingPrice;
    product.sellingPrice =
      sellingPrice;
    product.quantity = quantity;
    product.updatedAt =
      new Date().toISOString();


    alert(
      "✅ Product updated successfully."
    );
  } else {
    products.push({
      id: makeId("product"),
      name: name,
      category: category,
      buyingPrice: buyingPrice,
      sellingPrice: sellingPrice,
      quantity: quantity,
      createdAt:
        new Date().toISOString()
    });


    alert(
      "✅ Product added successfully."
    );
  }


  saveAll();

  closeProductForm();

  displayProducts();

  updateSaleProducts();

  updateDashboard();
}


function displayProducts() {
  const list =
    document.getElementById(
      "productList"
    );


  if (!list) {
    return;
  }


  const searchInput =
    document.getElementById(
      "productSearch"
    );


  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  const filtered =
    products.filter(function (
      product
    ) {
      return (
        !search ||
        String(
          product.name || ""
        )
          .toLowerCase()
          .includes(search) ||
        String(
          product.category || ""
        )
          .toLowerCase()
          .includes(search)
      );
    });


  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="product-card">
        <p class="empty-message">
          ${
            products.length === 0
              ? "No products added yet."
              : "No products match your search."
          }
        </p>
      </div>
    `;

    return;
  }


  list.innerHTML =
    filtered
      .map(function (product) {
        const quantity =
          Number(product.quantity || 0);


        const lowStock =
          quantity <= 5;


        return `
          <div class="product-card">

            <div class="product-head">

              <div>
                <h3>
                  ${escapeHTML(product.name)}
                </h3>

                <span class="badge">
                  ${escapeHTML(
                    product.category || "Other"
                  )}
                </span>
              </div>

              <span class="${
                lowStock
                  ? "stock-low"
                  : "stock-good"
              }">

                ${
                  lowStock
                    ? `⚠️ ${quantity} left`
                    : `✓ ${quantity} in stock`
                }

              </span>

            </div>


            <div class="product-meta">

              <span>
                Selling:
                <b>
                  ${money(
                    product.sellingPrice
                  )}
                </b>
              </span>

              ${
                isAdmin() &&
                buyingPricesVisible
                  ? `
                    <span>
                      Buying:
                      <b>
                        ${money(
                          product.buyingPrice
                        )}
                      </b>
                    </span>
                  `
                  : ""
              }

            </div>


            ${
              isAdmin()
                ? `
                  <div class="product-actions">

                    <button
                      class="secondary-btn"
                      onclick="openProductForm('${product.id}')">

                      ✏️ Edit

                    </button>

                    <button
                      class="danger-link"
                      onclick="deleteProduct('${product.id}')">

                      🗑️ Delete

                    </button>

                  </div>
                `
                : ""
            }

          </div>
        `;
      })
      .join("");
}


function deleteProduct(productId) {
  if (!isAdmin()) {
    alert(
      "Only the Admin can delete products."
    );

    return;
  }


  const product =
    products.find(function (
      item
    ) {
      return item.id === productId;
    });


  if (!product) {
    return;
  }


  const confirmed = confirm(
    `Delete "${product.name}"?\n\nThe sales history will remain saved.`
  );


  if (!confirmed) {
    return;
  }


  products =
    products.filter(function (
      item
    ) {
      return item.id !== productId;
    });


  saveAll();

  displayProducts();

  updateSaleProducts();

  updateDashboard();
}


function toggleBuyingPrices() {
  if (!isAdmin()) {
    return;
  }


  buyingPricesVisible =
    !buyingPricesVisible;


  const button =
    document.querySelector(
      '[onclick="toggleBuyingPrices()"]'
    );


  if (button) {
    button.textContent =
      buyingPricesVisible
        ? "🔓 Hide Buying Prices"
        : "🔐 View Buying Prices";
  }


  displayProducts();
}


/* =========================================================
   SALES
========================================================= */

function updateSaleProducts(
  searchTerm = null
) {
  const select =
    document.getElementById(
      "saleProduct"
    );


  if (!select) {
    return;
  }


  const searchInput =
    document.getElementById(
      "saleProductSearch"
    );


  const search =
    searchTerm !== null
      ? searchTerm
      : searchInput
        ? searchInput.value
            .trim()
            .toLowerCase()
        : "";


  const previousValue =
    select.value;


  const availableProducts =
    products.filter(function (
      product
    ) {
      return (
        Number(product.quantity || 0) > 0 &&
        (
          !search ||
          String(
            product.name || ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            product.category || ""
          )
            .toLowerCase()
            .includes(search)
        )
      );
    });


  select.innerHTML = `
    <option value="">
      ${
        availableProducts.length
          ? "Select a product"
          : "No products available"
      }
    </option>
  `;


  availableProducts.forEach(
    function (product) {
      const option =
        document.createElement(
          "option"
        );


      option.value = product.id;


      option.textContent =
        `${product.name} — Stock: ${product.quantity} — ${money(product.sellingPrice)}`;


      select.appendChild(option);
    }
  );


  if (
    availableProducts.some(
      function (product) {
        return product.id === previousValue;
      }
    )
  ) {
    select.value = previousValue;
  }


  updateSalePrice();
}


function filterSaleProducts() {
  const searchInput =
    document.getElementById(
      "saleProductSearch"
    );


  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  updateSaleProducts(search);
}


function clearSaleProductSearch() {
  const input =
    document.getElementById(
      "saleProductSearch"
    );


  if (input) {
    input.value = "";
  }


  updateSaleProducts("");
}


function updateSalePrice() {
  const productId =
    document.getElementById(
      "saleProduct"
    )?.value;


  const priceInput =
    document.getElementById(
      "salePrice"
    );


  if (!productId) {
    if (priceInput) {
      priceInput.value = "";
    }

    updateSalePreview();

    return;
  }


  const product =
    products.find(function (
      item
    ) {
      return item.id === productId;
    });


  if (!product) {
    return;
  }


  if (priceInput) {
    priceInput.value =
      Number(
        product.sellingPrice || 0
      );
  }


  updateSalePreview();
}


function updateSalePreview() {
  const preview =
    document.getElementById(
      "salePricePreview"
    );


  if (!preview) {
    return;
  }


  const productId =
    document.getElementById(
      "saleProduct"
    )?.value;


  const quantity =
    Number(
      document.getElementById(
        "saleQuantity"
      )?.value || 0
    );


  const sellingPrice =
    Number(
      document.getElementById(
        "salePrice"
      )?.value || 0
    );


  if (!productId) {
    preview.innerHTML =
      "Select a product to see sale details.";

    return;
  }


  const product =
    products.find(function (
      item
    ) {
      return item.id === productId;
    });


  if (!product) {
    preview.innerHTML =
      "Product not found.";

    return;
  }


  const total =
    sellingPrice * quantity;


  const profit =
    (
      sellingPrice -
      Number(product.buyingPrice || 0)
    ) * quantity;


  preview.innerHTML = `
    <strong>Sale Preview</strong>

    <br><br>

    Product:
    <b>${escapeHTML(product.name)}</b>

    <br>

    Available stock:
    <b>${Number(product.quantity || 0)}</b>

    <br>

    Quantity:
    <b>${quantity}</b>

    <br>

    Total:
    <b>${money(total)}</b>

    ${
      isAdmin()
        ? `
          <br>

          Estimated profit:
          <b>${money(profit)}</b>
        `
        : ""
    }
  `;
}


function recordSale(event) {
  event.preventDefault();


  if (!currentUser) {
    showLogin();
    return;
  }


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


  const sellingPrice =
    Number(
      document.getElementById(
        "salePrice"
      ).value
    );


  const customer =
    document
      .getElementById(
        "customerName"
      )
      .value
      .trim();


  const note =
    document
      .getElementById(
        "saleNote"
      )
      .value
      .trim();


  const product =
    products.find(function (
      item
    ) {
      return item.id === productId;
    });


  if (!product) {
    alert(
      "Please select a valid product."
    );

    return;
  }


  if (
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    alert(
      "Please enter a valid quantity."
    );

    return;
  }


  if (
    quantity >
    Number(product.quantity || 0)
  ) {
    alert(
      `Only ${product.quantity} unit(s) are available.`
    );

    return;
  }


  if (
    !Number.isFinite(sellingPrice) ||
    sellingPrice < 0
  ) {
    alert(
      "Please enter a valid selling price."
    );

    return;
  }


  const total =
    sellingPrice * quantity;


  const profit =
    (
      sellingPrice -
      Number(product.buyingPrice || 0)
    ) * quantity;


  const sale = {
    id: makeId("sale"),

    productId:
      product.id,

    productName:
      product.name,

    quantity:
      quantity,

    sellingPrice:
      sellingPrice,

    buyingPrice:
      Number(
        product.buyingPrice || 0
      ),

    total:
      total,

    profit:
      profit,

    customer:
      customer,

    customerName:
      customer,

    note:
      note,

    date:
      today(),

    soldBy:
      currentUser.name,

    soldByUsername:
      currentUser.username,

    createdAt:
      new Date().toISOString()
  };


  sales.unshift(sale);


  product.quantity =
    Number(product.quantity || 0) -
    quantity;


  saveAll();


  const form =
    document.getElementById(
      "saleForm"
    );


  if (form) {
    form.reset();
  }


  const searchInput =
    document.getElementById(
      "saleProductSearch"
    );


  if (searchInput) {
    searchInput.value = "";
  }


  updateSaleProducts();

  displayProducts();

  displaySales();

  updateDashboard();


  alert(
    `✅ Sale recorded successfully.\n\nTotal: ${money(total)}`
  );
}


/* =========================================================
   PHONE / DATA RECORDS
========================================================= */

function openPhoneRecordForm() {
  const container =
    document.getElementById(
      "phoneRecordFormContainer"
    );


  if (!container) {
    return;
  }


  container.classList.remove(
    "hidden"
  );


  const dateInput =
    document.getElementById(
      "phoneDate"
    );


  if (dateInput && !dateInput.value) {
    dateInput.value = today();
  }


  container.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


function closePhoneRecordForm() {
  const container =
    document.getElementById(
      "phoneRecordFormContainer"
    );


  if (container) {
    container.classList.add(
      "hidden"
    );
  }


  const form =
    document.getElementById(
      "phoneRecordForm"
    );


  if (form) {
    form.reset();
  }


  const dateInput =
    document.getElementById(
      "phoneDate"
    );


  if (dateInput) {
    dateInput.value = today();
  }
}


function savePhoneRecord(event) {
  event.preventDefault();


  if (!currentUser) {
    showLogin();
    return;
  }


  const type =
    document.getElementById(
      "phoneRecordType"
    ).value;


  const network =
    document.getElementById(
      "phoneNetwork"
    ).value;


  const description =
    document
      .getElementById(
        "phoneDescription"
      )
      .value
      .trim();


  const amount =
    Number(
      document.getElementById(
        "phoneAmount"
      ).value
    );


  const profit =
    Number(
      document.getElementById(
        "phoneProfit"
      ).value
    );


  const date =
    document.getElementById(
      "phoneDate"
    ).value;


  const note =
    document
      .getElementById(
        "phoneNote"
      )
      .value
      .trim();


  if (!date) {
    alert(
      "Please select a date."
    );

    return;
  }


  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    alert(
      "Please enter a valid amount."
    );

    return;
  }


  if (
    !Number.isFinite(profit) ||
    profit < 0
  ) {
    alert(
      "Please enter a valid profit."
    );

    return;
  }


  phoneRecords.unshift({
    id: makeId("phone"),

    type:
      type,

    network:
      network,

    description:
      description,

    amount:
      amount,

    profit:
      profit,

    date:
      date,

    note:
      note,

    recordedBy:
      currentUser.name,

    recordedByUsername:
      currentUser.username,

    createdAt:
      new Date().toISOString()
  });


  saveAll();


  closePhoneRecordForm();

  displayPhoneRecords();

  updateDashboard();


  alert(
    "✅ Phone/Data record saved successfully."
  );
}


function displayPhoneRecords() {
  const list =
    document.getElementById(
      "phoneRecordsList"
    );


  if (!list) {
    return;
  }


  const filter =
    document.getElementById(
      "phoneFilterDate"
    )?.value || "";


  const filtered =
    phoneRecords.filter(function (
      record
    ) {
      return (
        !filter ||
        record.date === filter
      );
    });


  const totalAmount =
    filtered.reduce(function (
      total,
      record
    ) {
      return (
        total +
        Number(record.amount || 0)
      );
    }, 0);


  const totalProfit =
    filtered.reduce(function (
      total,
      record
    ) {
      return (
        total +
        Number(record.profit || 0)
      );
    }, 0);


  setText(
    "phoneTotalAmount",
    money(totalAmount)
  );


  setText(
    "phoneTotalProfit",
    money(totalProfit)
  );


  setText(
    "phoneTotalRecords",
    filtered.length
  );


  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="record-card">
        <p class="empty-message">
          No Phone/Data records found.
        </p>
      </div>
    `;

    return;
  }


  const sorted =
    [...filtered].sort(function (
      a,
      b
    ) {
      return (
        String(
          b.createdAt || b.date || ""
        ).localeCompare(
          String(
            a.createdAt || a.date || ""
          )
        )
      );
    });


  list.innerHTML =
    sorted
      .map(function (record) {
        return `
          <div class="record-card">

            <div class="record-head">

              <div>
                <strong>
                  ${escapeHTML(
                    record.description ||
                    record.type ||
                    "Phone/Data Record"
                  )}
                </strong>

                <div class="staff-role">
                  ${escapeHTML(
                    record.type || "Other"
                  )}
                  •
                  ${escapeHTML(
                    record.network || "Other"
                  )}
                </div>
              </div>

              <strong>
                ${money(record.amount)}
              </strong>

            </div>


            <div class="record-meta">

              <span>
                📅 ${formatDate(record.date)}
              </span>

              <span>
                💰 Profit:
                <b>${money(record.profit)}</b>
              </span>

              ${
                record.note
                  ? `
                    <span>
                      📝 ${escapeHTML(record.note)}
                    </span>
                  `
                  : ""
              }

              ${
                record.recordedBy
                  ? `
                    <span>
                      👤 ${escapeHTML(record.recordedBy)}
                    </span>
                  `
                  : ""
              }

            </div>


            ${
              isAdmin()
                ? `
                  <div class="product-actions">

                    <button
                      class="danger-link"
                      onclick="deletePhoneRecord('${record.id}')">

                      🗑️ Delete

                    </button>

                  </div>
                `
                : ""
            }

          </div>
        `;
      })
      .join("");
}


function clearPhoneFilter() {
  const input =
    document.getElementById(
      "phoneFilterDate"
    );


  if (input) {
    input.value = "";
  }


  displayPhoneRecords();
}


function deletePhoneRecord(id) {
  if (!isAdmin()) {
    alert(
      "Only the Admin can delete records."
    );

    return;
  }


  const confirmed = confirm(
    "Delete this Phone/Data record?"
  );


  if (!confirmed) {
    return;
  }


  phoneRecords =
    phoneRecords.filter(function (
      record
    ) {
      return record.id !== id;
    });


  saveAll();

  displayPhoneRecords();

  updateDashboard();
}


/* =========================================================
   POS
========================================================= */

function openPOSForm() {
  const container =
    document.getElementById(
      "posFormContainer"
    );


  if (!container) {
    return;
  }


  container.classList.remove(
    "hidden"
  );


  const dateInput =
    document.getElementById(
      "posDate"
    );


  if (dateInput && !dateInput.value) {
    dateInput.value = today();
  }


  container.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


function closePOSForm() {
  const container =
    document.getElementById(
      "posFormContainer"
    );


  if (container) {
    container.classList.add(
      "hidden"
    );
  }


  const form =
    document.getElementById(
      "posForm"
    );


  if (form) {
    form.reset();
  }


  const dateInput =
    document.getElementById(
      "posDate"
    );


  if (dateInput) {
    dateInput.value = today();
  }
}


function savePOSRecord(event) {
  event.preventDefault();


  if (!currentUser) {
    showLogin();
    return;
  }


  const type =
    document.getElementById(
      "posType"
    ).value;


  const amount =
    Number(
      document.getElementById(
        "posAmount"
      ).value
    );


  const profit =
    Number(
      document.getElementById(
        "posProfit"
      ).value
    );


  const date =
    document.getElementById(
      "posDate"
    ).value;


  const customer =
    document
      .getElementById(
        "posCustomer"
      )
      ?.value
      .trim() || "";


  const note =
    document
      .getElementById(
        "posNote"
      )
      ?.value
      .trim() || "";


  if (!date) {
    alert(
      "Please select a date."
    );

    return;
  }


  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    alert(
      "Please enter a valid amount."
    );

    return;
  }


  if (
    !Number.isFinite(profit) ||
    profit < 0
  ) {
    alert(
      "Please enter a valid profit."
    );

    return;
  }


  posRecords.unshift({
    id: makeId("pos"),

    type:
      type,

    amount:
      amount,

    profit:
      profit,

    date:
      date,

    customer:
      customer,

    reference:
      customer,

    note:
      note,

    recordedBy:
      currentUser.name,

    recordedByUsername:
      currentUser.username,

    createdAt:
      new Date().toISOString()
  });


  saveAll();


  closePOSForm();

  displayPOSRecords();

  updateDashboard();


  alert(
    "✅ POS record saved successfully."
  );
}


function displayPOSRecords() {
  const list =
    document.getElementById(
      "posRecordsList"
    );


  if (!list) {
    return;
  }


  const filter =
    document.getElementById(
      "posFilterDate"
    )?.value || "";


  const filtered =
    posRecords.filter(function (
      record
    ) {
      return (
        !filter ||
        record.date === filter
      );
    });


  const totalAmount =
    filtered.reduce(function (
      total,
      record
    ) {
      return (
        total +
        Number(record.amount || 0)
      );
    }, 0);


  const totalProfit =
    filtered.reduce(function (
      total,
      record
    ) {
      return (
        total +
        Number(record.profit || 0)
      );
    }, 0);


  setText(
    "posTotalAmount",
    money(totalAmount)
  );


  setText(
    "posTotalProfit",
    money(totalProfit)
  );


  setText(
    "posTotalRecords",
    filtered.length
  );


  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="record-card">
        <p class="empty-message">
          No POS records found.
        </p>
      </div>
    `;

    return;
  }


  const sorted =
    [...filtered].sort(function (
      a,
      b
    ) {
      return (
        String(
          b.createdAt || b.date || ""
        ).localeCompare(
          String(
            a.createdAt || a.date || ""
          )
        )
      );
    });


  list.innerHTML =
    sorted
      .map(function (record) {
        return `
          <div class="record-card">

            <div class="record-head">

              <div>

                <strong>
                  ${escapeHTML(
                    record.type || "POS"
                  )}
                </strong>

                <div class="staff-role">
                  POS Transaction
                </div>

              </div>

              <strong>
                ${money(record.amount)}
              </strong>

            </div>


            <div class="record-meta">

              <span>
                📅 ${formatDate(record.date)}
              </span>

              <span>
                💰 Profit:
                <b>${money(record.profit)}</b>
              </span>

              ${
                record.customer ||
                record.reference
                  ? `
                    <span>
                      👤 ${escapeHTML(
                        record.customer ||
                        record.reference
                      )}
                    </span>
                  `
                  : ""
              }

              ${
                record.note
                  ? `
                    <span>
                      📝 ${escapeHTML(record.note)}
                    </span>
                  `
                  : ""
              }

              ${
                record.recordedBy
                  ? `
                    <span>
                      👤 ${escapeHTML(record.recordedBy)}
                    </span>
                  `
                  : ""
              }

            </div>


            ${
              isAdmin()
                ? `
                  <div class="product-actions">

                    <button
                      class="danger-link"
                      onclick="deletePOSRecord('${record.id}')">

                      🗑️ Delete

                    </button>

                  </div>
                `
                : ""
            }

          </div>
        `;
      })
      .join("");
}


function clearPOSFilter() {
  const input =
    document.getElementById(
      "posFilterDate"
    );


  if (input) {
    input.value = "";
  }


  displayPOSRecords();
}


function deletePOSRecord(id) {
  if (!isAdmin()) {
    alert(
      "Only the Admin can delete records."
    );

    return;
  }


  const confirmed = confirm(
    "Delete this POS record?"
  );


  if (!confirmed) {
    return;
  }


  posRecords =
    posRecords.filter(function (
      record
    ) {
      return record.id !== id;
    });


  saveAll();

  displayPOSRecords();

  updateDashboard();
}


/* =========================================================
   SALES HISTORY
========================================================= */

function displaySales() {
  const list =
    document.getElementById(
      "salesHistory"
    );


  if (!list) {
    return;
  }


  const filter =
    document.getElementById(
      "salesFilterDate"
    )?.value || "";


  const filtered =
    sales.filter(function (
      sale
    ) {
      return (
        !filter ||
        sale.date === filter
      );
    });


  const totalSales =
    filtered.reduce(function (
      total,
      sale
    ) {
      return (
        total +
        Number(sale.total || 0)
      );
    }, 0);


  const totalProfit =
    filtered.reduce(function (
      total,
      sale
    ) {
      return (
        total +
        Number(sale.profit || 0)
      );
    }, 0);


  setText(
    "historyTotalSales",
    money(totalSales)
  );


  setText(
    "historyTotalProfit",
    money(totalProfit)
  );


  setText(
    "historyTotalRecords",
    filtered.length
  );


  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="sale-card">
        <p class="empty-message">
          No sales history found.
        </p>
      </div>
    `;

    return;
  }


  const sorted =
    [...filtered].sort(function (
      a,
      b
    ) {
      return (
        String(
          b.createdAt || b.date || ""
        ).localeCompare(
          String(
            a.createdAt || a.date || ""
          )
        )
      );
    });


  list.innerHTML =
    sorted
      .map(function (sale) {
        return `
          <div class="sale-card">

            <div class="sale-head">

              <div>

                <strong>
                  ${escapeHTML(
                    sale.productName ||
                    "Product"
                  )}
                </strong>

                <div class="staff-role">
                  ${Number(
                    sale.quantity || 0
                  )} unit(s)
                </div>

              </div>

              <strong>
                ${money(sale.total)}
              </strong>

            </div>


            <div class="record-meta">

              <span>
                📅 ${formatDate(sale.date)}
              </span>

              <span>
                💵 Unit Price:
                <b>
                  ${money(
                    sale.sellingPrice
                  )}
                </b>
              </span>

              ${
                sale.customer ||
                sale.customerName
                  ? `
                    <span>
                      👤 Customer:
                      ${escapeHTML(
                        sale.customer ||
                        sale.customerName
                      )}
                    </span>
                  `
                  : ""
              }

              ${
                sale.note
                  ? `
                    <span>
                      📝 ${escapeHTML(
                        sale.note
                      )}
                    </span>
                  `
                  : ""
              }

              ${
                sale.soldBy
                  ? `
                    <span>
                      👤 Sold by:
                      ${escapeHTML(
                        sale.soldBy
                      )}
                    </span>
                  `
                  : ""
              }

              ${
                isAdmin()
                  ? `
                    <span>
                      📈 Profit:
                      <b>
                        ${money(sale.profit)}
                      </b>
                    </span>
                  `
                  : ""
              }

            </div>


            ${
              isAdmin()
                ? `
                  <div class="product-actions">

                    <button
                      class="danger-link"
                      onclick="deleteSale('${sale.id}')">

                      🗑️ Delete Sale

                    </button>

                  </div>
                `
                : ""
            }

          </div>
        `;
      })
      .join("");
}


function clearSalesFilter() {
  const input =
    document.getElementById(
      "salesFilterDate"
    );


  if (input) {
    input.value = "";
  }


  displaySales();
}


/* =========================================================
   DELETE ONE SALE
========================================================= */

function deleteSale(id) {
  if (!isAdmin()) {
    alert(
      "Only the Admin can delete sales."
    );

    return;
  }


  const sale =
    sales.find(function (
      item
    ) {
      return item.id === id;
    });


  if (!sale) {
    return;
  }


  const confirmed = confirm(
    `Delete this sale of "${sale.productName}"?\n\nThe sold quantity will be returned to stock if the product still exists.`
  );


  if (!confirmed) {
    return;
  }


  const product =
    products.find(function (
      item
    ) {
      return (
        item.id === sale.productId
      );
    });


  if (product) {
    product.quantity =
      Number(product.quantity || 0) +
      Number(sale.quantity || 0);
  }


  sales =
    sales.filter(function (
      item
    ) {
      return item.id !== id;
    });


  saveAll();

  displaySales();

  displayProducts();

  updateSaleProducts();

  updateDashboard();
}


/* =========================================================
   CLEAR ALL SALES HISTORY
========================================================= */

function clearSalesHistory() {
  if (!isAdmin()) {
    alert(
      "Only the Admin can clear sales history."
    );

    return;
  }


  if (sales.length === 0) {
    alert(
      "There is no sales history to clear."
    );

    return;
  }


  const confirmed = confirm(
    "⚠️ CLEAR ALL SALES HISTORY?\n\n" +
    "All recorded sales will be deleted.\n\n" +
    "The quantities sold will be returned to stock where the products still exist.\n\n" +
    "This cannot be undone."
  );


  if (!confirmed) {
    return;
  }


  sales.forEach(function (sale) {
    const product =
      products.find(function (
        item
      ) {
        return (
          item.id ===
          sale.productId
        );
      });


    if (product) {
      product.quantity =
        Number(product.quantity || 0) +
        Number(sale.quantity || 0);
    }
  });


  sales = [];


  saveAll();

  displaySales();

  displayProducts();

  updateSaleProducts();

  updateDashboard();


  alert(
    "✅ Sales history cleared successfully."
  );
}


/* =========================================================
   ADMIN — STAFF ACCOUNTS
========================================================= */

function createStaff(event) {
  event.preventDefault();


  if (!isAdmin()) {
    alert(
      "Only the Admin can create staff accounts."
    );

    return;
  }


  const name =
    document
      .getElementById(
        "staffName"
      )
      .value
      .trim();


  const username =
    document
      .getElementById(
        "staffUsername"
      )
      .value
      .trim();


  const password =
    document.getElementById(
      "staffPassword"
    ).value;


  const confirmPassword =
    document.getElementById(
      "staffPasswordConfirm"
    ).value;


  if (name.length < 2) {
    alert(
      "Please enter the staff member's name."
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


  if (userExists(username)) {
    alert(
      "That username is already being used."
    );

    return;
  }


  users.push({
    id: makeId("staff"),

    name:
      name,

    username:
      username,

    password:
      password,

    role:
      "staff",

    active:
      true,

    createdAt:
      new Date().toISOString()
  });


  saveAll();


  const form =
    document.getElementById(
      "staffForm"
    );


  if (form) {
    form.reset();
  }


  displayStaff();


  alert(
    `✅ Sales staff account created.\n\nUsername: ${username}`
  );
}


function displayStaff() {
  const list =
    document.getElementById(
      "staffList"
    );


  if (!list) {
    return;
  }


  if (!isAdmin()) {
    list.innerHTML = "";
    return;
  }


  const staff =
    users.filter(function (
      user
    ) {
      return user.role === "staff";
    });


  if (staff.length === 0) {
    list.innerHTML = `
      <p class="empty-message">
        No sales staff accounts created yet.
      </p>
    `;

    return;
  }


  list.innerHTML =
    staff
      .map(function (user) {
        const active =
          user.active !== false;


        return `
          <div class="staff-row">

            <div>

              <strong>
                ${escapeHTML(user.name)}
              </strong>

              <div class="staff-role">
                @${escapeHTML(user.username)}
                •
                ${
                  active
                    ? "Active"
                    : "Disabled"
                }
              </div>

            </div>


            <div class="product-actions">

              <button
                class="secondary-btn"
                onclick="toggleStaff('${user.id}')">

                ${
                  active
                    ? "Disable"
                    : "Enable"
                }

              </button>

              <button
                class="danger-link"
                onclick="deleteStaff('${user.id}')">

                Delete

              </button>

            </div>

          </div>
        `;
      })
      .join("");
}


function toggleStaff(id) {
  if (!isAdmin()) {
    return;
  }


  const staff =
    users.find(function (
      user
    ) {
      return (
        user.id === id &&
        user.role === "staff"
      );
    });


  if (!staff) {
    return;
  }


  staff.active =
    staff.active === false;


  saveAll();

  displayStaff();


  alert(
    staff.active
      ? "✅ Staff account enabled."
      : "🔒 Staff account disabled."
  );
}


function deleteStaff(id) {
  if (!isAdmin()) {
    return;
  }


  const staff =
    users.find(function (
      user
    ) {
      return (
        user.id === id &&
        user.role === "staff"
      );
    });


  if (!staff) {
    return;
  }


  const confirmed = confirm(
    `Delete the account for "${staff.name}"?\n\nThis cannot be undone.`
  );


  if (!confirmed) {
    return;
  }


  users =
    users.filter(function (
      user
    ) {
      return user.id !== id;
    });


  saveAll();

  displayStaff();
}


/* =========================================================
   CHANGE ADMIN PASSWORD
========================================================= */

function changeAdminPassword(event) {
  event.preventDefault();


  if (!isAdmin()) {
    alert(
      "Only the Admin can change the Admin password."
    );

    return;
  }


  const currentPassword =
    document.getElementById(
      "currentAdminPassword"
    ).value;


  const newPassword =
    document.getElementById(
      "newAdminPassword"
    ).value;


  const confirmPassword =
    document.getElementById(
      "confirmAdminPassword"
    ).value;


  const admin =
    getAdminUser();


  if (!admin) {
    alert(
      "Admin account not found."
    );

    return;
  }


  if (
    currentPassword !==
    admin.password
  ) {
    alert(
      "❌ Current Admin password is incorrect."
    );

    return;
  }


  if (newPassword.length < 6) {
    alert(
      "New password must be at least 6 characters."
    );

    return;
  }


  if (
    newPassword !==
    confirmPassword
  ) {
    alert(
      "New passwords do not match."
    );

    return;
  }


  admin.password =
    newPassword;


  saveAll();


  const form =
    document.getElementById(
      "adminPasswordForm"
    );


  if (form) {
    form.reset();
  }


  alert(
    "✅ Admin password changed successfully."
  );
}


/* =========================================================
   ADMIN SECURITY CHECK
========================================================= */

function requireAdmin() {
  if (!isAdmin()) {
    alert(
      "Only the Admin can access this feature."
    );

    return false;
  }

  return true;
}


/* =========================================================
   EXTRA SAFETY:
   PREVENT STAFF FROM OPENING ADMIN MANUALLY
========================================================= */

document.addEventListener(
  "click",
  function () {
    if (!currentUser) {
      return;
    }

    /*
       If a staff member somehow reaches
       the Admin section, immediately hide it.
    */

    if (
      !isAdmin()
    ) {
      const adminSection =
        document.getElementById(
          "admin"
        );

      if (
        adminSection &&
        adminSection.classList.contains(
          "active"
        )
      ) {
        adminSection.classList.remove(
          "active"
        );

        const dashboard =
          document.getElementById(
            "dashboard"
          );

        if (dashboard) {
          dashboard.classList.add(
            "active"
          );
        }
      }
    }
  }
);
