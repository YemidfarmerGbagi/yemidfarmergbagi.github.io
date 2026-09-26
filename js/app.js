/* =========================================================
   PHONE ACCESSORIES MANAGER
   COMPLETE APPLICATION
   =========================================================
   Features:
   - Admin login
   - Sales staff login
   - Admin creates/deletes/disables staff
   - Admin password change
   - Admin password recovery code: 2580
   - Products and stock
   - Buying/selling prices
   - Sales / POS
   - Phone/Data records
   - Dashboard
   - Sales history
   - Low-stock alerts
   - Date filters
   - LocalStorage database
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
   GLOBAL DATA
========================================================= */

let products = load(KEYS.products, []);

let sales = load(KEYS.sales, []);

let phoneRecords = load(KEYS.phone, []);

let posRecords = load(KEYS.pos, []);

let users = load(KEYS.users, []);

let currentUser = load(KEYS.current, null);

let buyingPricesVisible = false;


/* =========================================================
   DATA LOADER
========================================================= */

function load(key, fallback) {

  try {

    const stored = localStorage.getItem(key);

    if (stored === null) {
      return fallback;
    }

    return JSON.parse(stored);

  } catch (error) {

    console.error(
      "Storage error:",
      error
    );

    return fallback;

  }

}


/* Compatibility helper */
function loadData(key) {

  return load(key, []);

}


/* =========================================================
   SAVE ALL DATA
========================================================= */

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
   BASIC HELPERS
========================================================= */

function money(value) {

  return (
    "₦" +
    Number(value || 0).toLocaleString(
      "en-NG"
    )
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

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return (
    year +
    "-" +
    month +
    "-" +
    day
  );

}


function formatDate(dateString) {

  if (!dateString) {
    return "";
  }

  const date =
    new Date(
      dateString +
      "T00:00:00"
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

  const date =
    new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}


function setText(id, value) {

  const element =
    document.getElementById(id);

  if (element) {
    element.textContent = value;
  }

}


function escapeHTML(value) {

  return String(value ?? "")
    .replace(
      /[&<>"']/g,
      function(character) {

        const map = {

          "&": "&amp;",

          "<": "&lt;",

          ">": "&gt;",

          '"': "&quot;",

          "'": "&#039;"

        };

        return map[character];

      }
    );

}


function isAdmin() {

  return !!(
    currentUser &&
    currentUser.role === "admin"
  );

}


function requireLogin() {

  if (!currentUser) {

    showLogin();

    return false;

  }

  return true;

}


function requireAdmin() {

  if (!isAdmin()) {

    alert(
      "Only the Administrator can perform this action."
    );

    return false;

  }

  return true;

}


function userExists(username) {

  return users.some(
    function(user) {

      return (
        user.username &&
        user.username.toLowerCase() ===
        username.toLowerCase()
      );

    }
  );

}


/* =========================================================
   START APPLICATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    bindForms();

    initializeAuthentication();

  }
);


/* =========================================================
   FORM BINDING
========================================================= */

function bindForms() {

  /* LOGIN */

  const loginForm =
    document.getElementById(
      "loginForm"
    );

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      login
    );

  }


  /* FORGOT ADMIN LOGIN */

  const forgotAdminBtn =
    document.getElementById(
      "forgotAdminBtn"
    );

  if (forgotAdminBtn) {

    forgotAdminBtn.addEventListener(
      "click",
      recoverAdminLogin
    );

  }


  /* FIRST ADMIN SETUP */

  const setupForm =
    document.getElementById(
      "setupForm"
    );

  if (setupForm) {

    setupForm.addEventListener(
      "submit",
      createAdmin
    );

  }


  /* PRODUCTS */

  const productForm =
    document.getElementById(
      "productForm"
    );

  if (productForm) {

    productForm.addEventListener(
      "submit",
      saveProduct
    );

  }


  /* SALES */

  const saleForm =
    document.getElementById(
      "saleForm"
    );

  if (saleForm) {

    saleForm.addEventListener(
      "submit",
      recordSale
    );

  }


  const saleProduct =
    document.getElementById(
      "saleProduct"
    );

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
    document.getElementById(
      "salePrice"
    );

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


  /* PHONE / DATA */

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


  const phoneFilter =
    document.getElementById(
      "phoneFilterDate"
    );

  if (phoneFilter) {

    phoneFilter.addEventListener(
      "change",
      displayPhoneRecords
    );

  }


  /* POS */

  const posForm =
    document.getElementById(
      "posForm"
    );

  if (posForm) {

    posForm.addEventListener(
      "submit",
      savePOSRecord
    );

  }


  const posFilter =
    document.getElementById(
      "posFilterDate"
    );

  if (posFilter) {

    posFilter.addEventListener(
      "change",
      displayPOSRecords
    );

  }


  /* STAFF */

  const staffForm =
    document.getElementById(
      "staffForm"
    );

  if (staffForm) {

    staffForm.addEventListener(
      "submit",
      createStaff
    );

  }


  /* ADMIN PASSWORD */

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


  /* SALES HISTORY FILTER */

  const salesFilter =
    document.getElementById(
      "salesFilterDate"
    );

  if (salesFilter) {

    salesFilter.addEventListener(
      "change",
      displaySales
    );

  }

}


/* =========================================================
   AUTHENTICATION INITIALIZATION
========================================================= */

function initializeAuthentication() {

  const adminExists =
    users.some(
      function(user) {

        return user.role === "admin";

      }
    );


  if (!adminExists) {

    showSetup();

    return;

  }


  if (currentUser) {

    const savedUser =
      users.find(
        function(user) {

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
        JSON.stringify(
          currentUser
        )
      );


      showApplication();

      return;

    }

  }


  showLogin();

}


/* =========================================================
   SCREEN SWITCHING
========================================================= */

function toggleScreens(activeScreen) {

  [
    "loginScreen",
    "setupScreen",
    "app"

  ].forEach(
    function(id) {

      const element =
        document.getElementById(id);

      if (!element) {
        return;
      }

      element.classList.toggle(
        "hidden",
        id !== activeScreen
      );

    }
  );

}


function showLogin() {

  toggleScreens(
    "loginScreen"
  );

}


function showSetup() {

  toggleScreens(
    "setupScreen"
  );

}


function showApplication() {

  if (!currentUser) {

    showLogin();

    return;

  }

  toggleScreens(
    "app"
  );

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
      .getElementById(
        "setupUsername"
      )
      ?.value
      .trim();


  const password =
    document
      .getElementById(
        "setupPassword"
      )
      ?.value;


  const confirmPassword =
    document
      .getElementById(
        "setupPasswordConfirm"
      )
      ?.value;


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


  if (
    users.some(
      function(user) {
        return user.role === "admin";
      }
    )
  ) {

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

    createdAt:
      new Date().toISOString()

  };


  users.push(admin);

  saveAll();

  setCurrentUser(admin);


  document
    .getElementById(
      "setupForm"
    )
    ?.reset();


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
    JSON.stringify(
      currentUser
    )
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
      ?.value
      .trim();


  const password =
    document
      .getElementById(
        "loginPassword"
      )
      ?.value;


  if (!username || !password) {

    alert(
      "Please enter your username and password."
    );

    return;

  }


  const user =
    users.find(
      function(item) {

        return (

          item.username &&

          item.username.toLowerCase() ===
          username.toLowerCase() &&

          item.password ===
          password &&

          item.active !== false

        );

      }
    );


  if (!user) {

    const disabledUser =
      users.find(
        function(item) {

          return (
            item.username &&
            item.username.toLowerCase() ===
            username.toLowerCase()
          );

        }
      );


    if (
      disabledUser &&
      disabledUser.active === false
    ) {

      alert(
        "This account has been disabled by the Administrator."
      );

    } else {

      alert(
        "❌ Incorrect username or password."
      );

    }

    return;

  }


  setCurrentUser(user);


  document
    .getElementById(
      "loginForm"
    )
    ?.reset();


  showApplication();

}


/* =========================================================
   FORGOT ADMIN LOGIN
   RECOVERY CODE: 2580
========================================================= */

function recoverAdminLogin() {

  const code =
    prompt(
      "ADMIN PASSWORD RECOVERY\n\n" +
      "Enter the recovery code:"
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


  const admin =
    users.find(
      function(user) {

        return (
          user.role === "admin"
        );

      }
    );


  if (!admin) {

    alert(
      "No Admin account was found.\n\n" +
      "You will be taken to Admin setup."
    );

    showSetup();

    return;

  }


  const newPassword =
    prompt(
      "✅ Recovery code accepted.\n\n" +
      "Enter your new Admin password:"
    );


  if (newPassword === null) {

    return;

  }


  if (
    newPassword.trim().length < 6
  ) {

    alert(
      "❌ Password must be at least 6 characters."
    );

    return;

  }


  const confirmPassword =
    prompt(
      "Confirm your new Admin password:"
    );


  if (confirmPassword === null) {

    return;

  }


  if (
    newPassword !==
    confirmPassword
  ) {

    alert(
      "❌ Passwords do not match."
    );

    return;

  }


  admin.password =
    newPassword.trim();

  admin.active = true;


  saveAll();


  alert(
    "✅ Admin password changed successfully.\n\n" +
    "You can now log in with your new password."
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

  buyingPricesVisible = false;

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
    .querySelectorAll(
      ".admin-only"
    )
    .forEach(
      function(element) {

        element.classList.toggle(
          "hidden",
          !isAdmin()
        );

      }
    );


  setText(
    "buyingPriceStatus",
    isAdmin()
      ? "👑 Admin can view buying prices."
      : "🔒 Buying prices are hidden from sales staff."
  );


  if (!isAdmin()) {

    buyingPricesVisible = false;

  }


  updateBuyingPriceButton();

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
   NAVIGATION
========================================================= */

function showSection(
  sectionId,
  button
) {

  if (!requireLogin()) {
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
    .querySelectorAll(
      ".section"
    )
    .forEach(
      function(section) {

        section.classList.remove(
          "active"
        );

      }
    );


  document
    .querySelectorAll(
      ".nav-btn"
    )
    .forEach(
      function(navButton) {

        navButton.classList.remove(
          "active"
        );

      }
    );


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


  if (
    sectionId === "dashboard"
  ) {

    updateDashboard();

  }


  if (
    sectionId === "products"
  ) {

    displayProducts();

  }


  if (
    sectionId === "sales"
  ) {

    updateSaleProducts();

  }


  if (
    sectionId === "phoneRecords"
  ) {

    displayPhoneRecords();

  }


  if (
    sectionId === "pos"
  ) {

    displayPOSRecords();

  }


  if (
    sectionId === "history"
  ) {

    displaySales();

  }


  if (
    sectionId === "admin"
  ) {

    displayStaff();

  }


  updateDashboard();

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

  const totalSales =
    sales.reduce(
      function(total, sale) {

        return (
          total +
          Number(
            sale.total || 0
          )
        );

      },
      0
    );


  const salesProfit =
    sales.reduce(
      function(total, sale) {

        return (
          total +
          Number(
            sale.profit || 0
          )
        );

      },
      0
    );


  const phoneProfit =
    phoneRecords.reduce(
      function(total, record) {

        return (
          total +
          Number(
            record.profit || 0
          )
        );

      },
      0
    );


  const posProfit =
    posRecords.reduce(
      function(total, record) {

        return (
          total +
          Number(
            record.profit || 0
          )
        );

      },
      0
    );


  const totalBusinessProfit =
    salesProfit +
    phoneProfit +
    posProfit;


  const totalStock =
    products.reduce(
      function(total, product) {

        return (
          total +
          Number(
            product.quantity || 0
          )
        );

      },
      0
    );


  const lowStockProducts =
    products.filter(
      function(product) {

        return (
          Number(
            product.quantity || 0
          ) <= 5
        );

      }
    );


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

    lowStockList.innerHTML =
      `
      <p class="empty-message">
        No low-stock products.
      </p>
      `;

    return;

  }


  lowStockList.innerHTML =
    lowStockProducts
      .map(
        function(product) {

          return `
            <div class="record-card">

              <div>
                <strong>
                  ${escapeHTML(product.name)}
                </strong>

                <small>
                  ${escapeHTML(product.category || "Other")}
                </small>
              </div>

              <span class="stock-low">
                ${Number(product.quantity || 0)} left
              </span>

            </div>
          `;

        }
      )
      .join("");

}


/* =========================================================
   PRODUCTS
========================================================= */

function openProductForm(
  productId = null
) {

  if (!requireAdmin()) {
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


  form.reset();


  container.classList.remove(
    "hidden"
  );


  const product =
    productId
      ? products.find(
          function(item) {

            return (
              item.id === productId
            );

          }
        )
      : null;


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


  setText(
    "productFormTitle",
    product
      ? "Edit Product"
      : "Add New Product"
  );


  if (product) {

    const name =
      document.getElementById(
        "productName"
      );

    const category =
      document.getElementById(
        "productCategory"
      );

    const buying =
      document.getElementById(
        "buyingPrice"
      );

    const selling =
      document.getElementById(
        "sellingPrice"
      );

    const quantity =
      document.getElementById(
        "productQuantity"
      );


    if (name) {
      name.value =
        product.name || "";
    }

    if (category) {
      category.value =
        product.category || "Other";
    }

    if (buying) {
      buying.value =
        product.buyingPrice ?? "";
    }

    if (selling) {
      selling.value =
        product.sellingPrice ?? "";
    }

    if (quantity) {
      quantity.value =
        product.quantity ?? 0;
    }

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


  document
    .getElementById(
      "productForm"
    )
    ?.reset();


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


  if (!requireAdmin()) {
    return;
  }


  const name =
    document
      .getElementById(
        "productName"
      )
      ?.value
      .trim();


  const category =
    document
      .getElementById(
        "productCategory"
      )
      ?.value || "Other";


  const buyingPrice =
    Number(
      document
        .getElementById(
          "buyingPrice"
        )
        ?.value
    );


  const sellingPrice =
    Number(
      document
        .getElementById(
          "sellingPrice"
        )
        ?.value
    );


  const quantity =
    Number(
      document
        .getElementById(
          "productQuantity"
        )
        ?.value
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
    document
      .getElementById(
        "editProductId"
      )
      ?.value;


  if (editId) {

    const product =
      products.find(
        function(item) {

          return item.id === editId;

        }
      );


    if (!product) {

      alert(
        "Product could not be found."
      );

      return;

    }


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

    product.updatedAt =
      new Date().toISOString();


    alert(
      "✅ Product updated successfully."
    );

  } else {

    products.push({

      id:
        makeId("product"),

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


function editProduct(productId) {

  if (!requireAdmin()) {
    return;
  }

  openProductForm(productId);

}


function deleteProduct(productId) {

  if (!requireAdmin()) {
    return;
  }


  const product =
    products.find(
      function(item) {

        return item.id === productId;

      }
    );


  if (!product) {
    return;
  }


  const confirmed =
    confirm(
      "Delete this product?\n\n" +
      product.name +
      "\n\n" +
      "Old sales records will remain in History."
    );


  if (!confirmed) {
    return;
  }


  products =
    products.filter(
      function(item) {

        return item.id !== productId;

      }
    );


  saveAll();

  displayProducts();

  updateSaleProducts();

  updateDashboard();


  alert(
    "Product deleted."
  );

}


function displayProducts() {

  const list =
    document.getElementById(
      "productList"
    );


  if (!list) {
    return;
  }


  const search =
    document
      .getElementById(
        "productSearch"
      )
      ?.value
      .trim()
      .toLowerCase() || "";


  const filtered =
    products.filter(
      function(product) {

        return (
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

      }
    );


  if (filtered.length === 0) {

    list.innerHTML =
      `
      <div class="empty-message">
        ${
          products.length === 0
            ? "No products added yet."
            : "No products match your search."
        }
      </div>
      `;

    return;

  }


  list.innerHTML =
    filtered
      .map(
        function(product) {

          const quantity =
            Number(
              product.quantity || 0
            );


          const low =
            quantity <= 5;


          const buyingHTML =
            isAdmin() &&
            buyingPricesVisible
              ? `
                <div class="price-line">
                  <span>Buying price</span>
                  <strong>
                    ${money(product.buyingPrice)}
                  </strong>
                </div>
              `
              : "";


          const adminActions =
            isAdmin()
              ? `
                <div class="card-actions">

                  <button
                    type="button"
                    class="secondary-btn small-btn"
                    onclick="editProduct('${product.id}')">
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    class="danger-btn small-btn"
                    onclick="deleteProduct('${product.id}')">
                    🗑️ Delete
                  </button>

                </div>
              `
              : "";


          return `
            <div class="product-card">

              <div class="product-card-top">

                <div>

                  <h3>
                    ${escapeHTML(product.name)}
                  </h3>

                  <span class="category-label">
                    ${escapeHTML(product.category || "Other")}
                  </span>

                </div>

                <span class="${
                  low
                    ? "stock-low"
                    : "stock-good"
                }">
                  ${quantity} in stock
                </span>

              </div>


              <div class="price-line">

                <span>Selling price</span>

                <strong>
                  ${money(product.sellingPrice)}
                </strong>

              </div>


              ${buyingHTML}


              ${adminActions}

            </div>
          `;

        }
      )
      .join("");

}


/* =========================================================
   BUYING PRICE VISIBILITY
========================================================= */

function toggleBuyingPrices() {

  if (!requireAdmin()) {
    return;
  }


  buyingPricesVisible =
    !buyingPricesVisible;


  updateBuyingPriceButton();

  displayProducts();

}


function updateBuyingPriceButton() {

  const button =
    document.getElementById(
      "buyingPriceToggle"
    );


  if (!button) {
    return;
  }


  if (!isAdmin()) {

    button.classList.add(
      "hidden"
    );

    return;

  }


  button.classList.remove(
    "hidden"
  );


  button.textContent =
    buyingPricesVisible
      ? "🔒 Hide Buying Prices"
      : "👁️ View Buying Prices";

}


/* =========================================================
   SALES
========================================================= */

function openSaleForm() {

  if (!requireLogin()) {
    return;
  }


  showSection(
    "sales",
    document.querySelector(
      '[onclick*="sales"]'
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


function updateSaleProducts() {

  const select =
    document.getElementById(
      "saleProduct"
    );


  if (!select) {
    return;
  }


  const search =
    document
      .getElementById(
        "saleProductSearch"
      )
      ?.value
      .trim()
      .toLowerCase() || "";


  const currentValue =
    select.value;


  const available =
    products.filter(
      function(product) {

        return (
          Number(
            product.quantity || 0
          ) > 0 &&

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

      }
    );


  select.innerHTML =
    `<option value="">Select a product</option>`;


  available.forEach(
    function(product) {

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

    }
  );


  if (
    available.some(
      function(product) {
        return product.id === currentValue;
      }
    )
  ) {

    select.value =
      currentValue;

  }


  updateSalePrice();

}


function filterSaleProducts() {

  updateSaleProducts();

}


function updateSalePrice() {

  const productId =
    document
      .getElementById(
        "saleProduct"
      )
      ?.value;


  const product =
    products.find(
      function(item) {

        return item.id === productId;

      }
    );


  const priceInput =
    document.getElementById(
      "salePrice"
    );


  if (!product) {

    if (priceInput) {
      priceInput.value = "";
    }

    updateSalePreview();

    return;

  }


  if (priceInput) {

    priceInput.value =
      product.sellingPrice;

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
    document
      .getElementById(
        "saleProduct"
      )
      ?.value;


  const quantity =
    Number(
      document
        .getElementById(
          "saleQuantity"
        )
        ?.value || 0
    );


  const sellingPrice =
    Number(
      document
        .getElementById(
          "salePrice"
        )
        ?.value || 0
    );


  const product =
    products.find(
      function(item) {

        return item.id === productId;

      }
    );


  if (!product) {

    preview.innerHTML =
      "Select a product to see price.";

    return;

  }


  const total =
    sellingPrice * quantity;


  if (isAdmin()) {

    const profit =
      (
        sellingPrice -
        Number(product.buyingPrice || 0)
      ) * quantity;


    preview.innerHTML = `
      <div>
        <strong>Total:</strong>
        ${money(total)}
      </div>

      <div>
        <strong>Estimated Profit:</strong>
        ${money(profit)}
      </div>

      <div>
        <strong>Available Stock:</strong>
        ${Number(product.quantity || 0)}
      </div>
    `;

  } else {

    preview.innerHTML = `
      <div>
        <strong>Total:</strong>
        ${money(total)}
      </div>

      <div>
        <strong>Available Stock:</strong>
        ${Number(product.quantity || 0)}
      </div>
    `;

  }

}


function recordSale(event) {

  event.preventDefault();


  if (!requireLogin()) {
    return;
  }


  const productId =
    document
      .getElementById(
        "saleProduct"
      )
      ?.value;


  const quantity =
    Number(
      document
        .getElementById(
          "saleQuantity"
        )
        ?.value
    );


  const actualPrice =
    Number(
      document
        .getElementById(
          "salePrice"
        )
        ?.value
    );


  const customer =
    document
      .getElementById(
        "customerName"
      )
      ?.value
      .trim() || "Walk-in customer";


  const note =
    document
      .getElementById(
        "saleNote"
      )
      ?.value
      .trim() || "";


  const product =
    products.find(
      function(item) {

        return item.id === productId;

      }
    );


  if (!product) {

    alert(
      "Please select a product."
    );

    return;

  }


  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {

    alert(
      "Quantity must be at least 1."
    );

    return;

  }


  if (
    quantity >
    Number(product.quantity || 0)
  ) {

    alert(
      "There is not enough stock available."
    );

    return;

  }


  if (
    !Number.isFinite(actualPrice) ||
    actualPrice < 0
  ) {

    alert(
      "Please enter a valid selling price."
    );

    return;

  }


  const total =
    actualPrice * quantity;


  const buyingPrice =
    Number(
      product.buyingPrice || 0
    );


  const profit =
    (
      actualPrice -
      buyingPrice
    ) * quantity;


  const sale = {

    id:
      makeId("sale"),

    productId:
      product.id,

    productName:
      product.name,

    quantity:
      quantity,

    sellingPrice:
      actualPrice,

    unitPrice:
      actualPrice,

    buyingPrice:
      buyingPrice,

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


  sales.unshift(
    sale
  );


  product.quantity =
    Number(
      product.quantity || 0
    ) - quantity;


  saveAll();


  document
    .getElementById(
      "saleForm"
    )
    ?.reset();


  const quantityInput =
    document.getElementById(
      "saleQuantity"
    );


  if (quantityInput) {
    quantityInput.value = 1;
  }


  updateSaleProducts();

  updateSalePreview();

  displayProducts();

  displaySales();

  updateDashboard();


  alert(
    "✅ Sale recorded successfully."
  );

}


/* =========================================================
   DELETE INDIVIDUAL SALE
========================================================= */

function deleteSale(saleId) {

  if (!requireAdmin()) {
    return;
  }


  const sale =
    sales.find(
      function(item) {

        return item.id === saleId;

      }
    );


  if (!sale) {
    return;
  }


  const confirmed =
    confirm(
      "Delete this sale?\n\n" +
      "The sold quantity will be returned to stock if the product still exists."
    );


  if (!confirmed) {
    return;
  }


  const product =
    products.find(
      function(item) {

        return item.id === sale.productId;

      }
    );


  if (product) {

    product.quantity =
      Number(product.quantity || 0) +
      Number(sale.quantity || 0);

  }


  sales =
    sales.filter(
      function(item) {

        return item.id !== saleId;

      }
    );


  saveAll();

  displaySales();

  displayProducts();

  updateSaleProducts();

  updateDashboard();


  alert(
    "Sale deleted and stock adjusted."
  );

}


/* =========================================================
   HISTORY
========================================================= */

function displaySales() {

  const list =
    document.getElementById(
      "salesHistory"
    );


  if (!list) {
    return;
  }


  const filterDate =
    document
      .getElementById(
        "salesFilterDate"
      )
      ?.value || "";


  let filtered =
    sales.slice();


  if (filterDate) {

    filtered =
      filtered.filter(
        function(sale) {

          return sale.date === filterDate;

        }
      );

  }


  filtered.sort(
    function(a, b) {

      return (
        new Date(
          b.createdAt ||
          b.date ||
          0
        ) -
        new Date(
          a.createdAt ||
          a.date ||
          0
        )
      );

    }
  );


  const total =
    filtered.reduce(
      function(sum, sale) {

        return (
          sum +
          Number(
            sale.total || 0
          )
        );

      },
      0
    );


  const profit =
    filtered.reduce(
      function(sum, sale) {

        return (
          sum +
          Number(
            sale.profit || 0
          )
        );

      },
      0
    );


  setText(
    "historyTotalSales",
    money(total)
  );


  setText(
    "historyTotalProfit",
    money(profit)
  );


  if (filtered.length === 0) {

    list.innerHTML =
      `
      <div class="empty-message">
        No sales records found.
      </div>
      `;

    return;

  }


  list.innerHTML =
    filtered
      .map(
        function(sale) {

          const saleProfit =
            Number(
              sale.profit || 0
            );


          const adminDetails =
            isAdmin()
              ? `
                <div class="record-detail">
                  <span>Buying Price</span>
                  <strong>
                    ${money(sale.buyingPrice)}
                  </strong>
                </div>

                <div class="record-detail">
                  <span>Profit</span>
                  <strong class="profit-text">
                    ${money(saleProfit)}
                  </strong>
                </div>
              `
              : "";


          const deleteButton =
            isAdmin()
              ? `
                <button
                  type="button"
                  class="danger-btn small-btn"
                  onclick="deleteSale('${sale.id}')">
                  🗑️ Delete
                </button>
              `
              : "";


          return `
            <div class="record-card">

              <div class="record-card-header">

                <div>

                  <h3>
                    ${escapeHTML(
                      sale.productName ||
                      "Product"
                    )}
                  </h3>

                  <small>
                    ${formatDate(sale.date)}
                  </small>

                </div>

                <strong>
                  ${money(sale.total)}
                </strong>

              </div>


              <div class="record-details">

                <div class="record-detail">
                  <span>Quantity</span>
                  <strong>
                    ${Number(sale.quantity || 0)}
                  </strong>
                </div>

                <div class="record-detail">
                  <span>Selling Price</span>
                  <strong>
                    ${money(
                      sale.sellingPrice ??
                      sale.unitPrice
                    )}
                  </strong>
                </div>

                ${adminDetails}

                <div class="record-detail">
                  <span>Customer</span>
                  <strong>
                    ${escapeHTML(
                      sale.customer ||
                      sale.customerName ||
                      "Walk-in customer"
                    )}
                  </strong>
                </div>

                <div class="record-detail">
                  <span>Sold By</span>
                  <strong>
                    ${escapeHTML(
                      sale.soldBy ||
                      "Staff"
                    )}
                  </strong>
                </div>

              </div>


              ${
                sale.note
                  ? `
                    <p class="record-note">
                      📝 ${escapeHTML(sale.note)}
                    </p>
                  `
                  : ""
              }


              ${deleteButton}

            </div>
          `;

        }
      )
      .join("");

}


function clearSalesHistory() {

  if (!requireAdmin()) {
    return;
  }


  if (sales.length === 0) {

    alert(
      "There is no sales history to clear."
    );

    return;

  }


  const confirmed =
    confirm(
      "Clear ALL sales history?\n\n" +
      "Stock quantities will be restored for products that still exist."
    );


  if (!confirmed) {
    return;
  }


  sales.forEach(
    function(sale) {

      const product =
        products.find(
          function(item) {

            return (
              item.id ===
              sale.productId
            );

          }
        );


      if (product) {

        product.quantity =
          Number(
            product.quantity || 0
          ) +
          Number(
            sale.quantity || 0
          );

      }

    }
  );


  sales = [];


  saveAll();

  displaySales();

  displayProducts();

  updateSaleProducts();

  updateDashboard();


  alert(
    "✅ Sales history cleared."
  );

}


/* =========================================================
   PHONE / DATA RECORDS
========================================================= */

function savePhoneRecord(event) {

  event.preventDefault();


  if (!requireLogin()) {
    return;
  }


  const type =
    document
      .getElementById(
        "phoneRecordType"
      )
      ?.value;


  const network =
    document
      .getElementById(
        "phoneNetwork"
      )
      ?.value;


  const description =
    document
      .getElementById(
        "phoneDescription"
      )
      ?.value
      .trim();


  const amount =
    Number(
      document
        .getElementById(
          "phoneAmount"
        )
        ?.value
    );


  const profit =
    Number(
      document
        .getElementById(
          "phoneProfit"
        )
        ?.value
    );


  const date =
    document
      .getElementById(
        "phoneDate"
      )
      ?.value || today();


  const note =
    document
      .getElementById(
        "phoneNote"
      )
      ?.value
      .trim() || "";


  if (!type) {

    alert(
      "Please select a record type."
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
    !Number.isFinite(profit)
  ) {

    alert(
      "Please enter a valid profit."
    );

    return;

  }


  phoneRecords.unshift({

    id:
      makeId("phone"),

    type:
      type,

    network:
      network || "Other",

    description:
      description || type,

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

    createdAt:
      new Date().toISOString()

  });


  saveAll();


  document
    .getElementById(
      "phoneRecordForm"
    )
    ?.reset();


  setDefaultDates();

  displayPhoneRecords();

  updateDashboard();


  alert(
    "✅ Phone/Data record saved."
  );

}


function displayPhoneRecords() {

  const list =
    document.getElementById(
      "phoneRecordsList"
    );


  const filterDate =
    document
      .getElementById(
        "phoneFilterDate"
      )
      ?.value || "";


  let filtered =
    phoneRecords.slice();


  if (filterDate) {

    filtered =
      filtered.filter(
        function(record) {

          return (
            record.date ===
            filterDate
          );

        }
      );

  }


  filtered.sort(
    function(a, b) {

      return (
        new Date(
          b.createdAt ||
          b.date ||
          0
        ) -
        new Date(
          a.createdAt ||
          a.date ||
          0
        )
      );

    }
  );


  const totalAmount =
    filtered.reduce(
      function(total, record) {

        return (
          total +
          Number(
            record.amount || 0
          )
        );

      },
      0
    );


  const totalProfit =
    filtered.reduce(
      function(total, record) {

        return (
          total +
          Number(
            record.profit || 0
          )
        );

      },
      0
    );


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


  if (!list) {
    return;
  }


  if (filtered.length === 0) {

    list.innerHTML =
      `
      <div class="empty-message">
        No Phone/Data records found.
      </div>
      `;

    return;

  }


  list.innerHTML =
    filtered
      .map(
        function(record) {

          const deleteButton =
            isAdmin()
              ? `
                <button
                  type="button"
                  class="danger-btn small-btn"
                  onclick="deletePhoneRecord('${record.id}')">
                  🗑️ Delete
                </button>
              `
              : "";


          return `
            <div class="record-card">

              <div class="record-card-header">

                <div>

                  <h3>
                    ${escapeHTML(
                      record.type ||
                      "Phone/Data"
                    )}
                  </h3>

                  <small>
                    ${formatDate(record.date)}
                  </small>

                </div>

                <strong>
                  ${money(record.amount)}
                </strong>

              </div>


              <div class="record-details">

                <div class="record-detail">
                  <span>Network</span>
                  <strong>
                    ${escapeHTML(
                      record.network ||
                      "Other"
                    )}
                  </strong>
                </div>

                <div class="record-detail">
                  <span>Description</span>
                  <strong>
                    ${escapeHTML(
                      record.description ||
                      "-"
                    )}
                  </strong>
                </div>

                <div class="record-detail">
                  <span>Profit</span>
                  <strong class="profit-text">
                    ${money(record.profit)}
                  </strong>
                </div>

                <div class="record-detail">
                  <span>Recorded By</span>
                  <strong>
                    ${escapeHTML(
                      record.recordedBy ||
                      "Staff"
                    )}
                  </strong>
                </div>

              </div>


              ${
                record.note
                  ? `
                    <p class="record-note">
                      📝 ${escapeHTML(record.note)}
                    </p>
                  `
                  : ""
              }


              ${deleteButton}

            </div>
          `;

        }
      )
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

  if (!requireAdmin()) {
    return;
  }


  const confirmed =
    confirm(
      "Delete this Phone/Data record?"
    );


  if (!confirmed) {
    return;
  }


  phoneRecords =
    phoneRecords.filter(
      function(record) {

        return record.id !== id;

      }
    );


  saveAll();

  displayPhoneRecords();

  updateDashboard();


  alert(
    "Phone/Data record deleted."
  );

}


/* =========================================================
   POS RECORDS
========================================================= */

function savePOSRecord(event) {

  event.preventDefault();


  if (!requireLogin()) {
    return;
  }


  const type =
    document
      .getElementById(
        "posType"
      )
      ?.value;


  const amount =
    Number(
      document
        .getElementById(
          "posAmount"
        )
        ?.value
    );


  const profit =
    Number(
      document
        .getElementById(
          "posProfit"
        )
        ?.value
    );


  const date =
    document
      .getElementById(
        "posDate"
      )
      ?.value || today();


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


  if (!type) {

    alert(
      "Please select Withdrawal or Deposit."
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
    !Number.isFinite(profit)
  ) {

    alert(
      "Please enter a valid profit."
    );

    return;

  }


  posRecords.unshift({

    id:
      makeId("pos"),

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

    createdAt:
      new Date().toISOString()

  });


  saveAll();


  document
    .getElementById(
      "posForm"
    )
    ?.reset();


  setDefaultDates();

  displayPOSRecords();

  updateDashboard();


  alert(
    "✅ POS record saved."
  );

}


function displayPOSRecords() {

  const list =
    document.getElementById(
      "posRecordsList"
    );


  const filterDate =
    document
      .getElementById(
        "posFilterDate"
      )
      ?.value || "";


  let filtered =
    posRecords.slice();


  if (filterDate) {

    filtered =
      filtered.filter(
        function(record) {

          return (
            record.date ===
            filterDate
          );

        }
      );

  }


  filtered.sort(
    function(a, b) {

      return (
        new Date(
          b.createdAt ||
          b.date ||
          0
        ) -
        new Date(
          a.createdAt ||
          a.date ||
          0
        )
      );

    }
  );


  const totalAmount =
    filtered.reduce(
      function(total, record) {

        return (
          total +
          Number(
            record.amount || 0
          )
        );

      },
      0
    );


  const totalProfit =
    filtered.reduce(
      function(total, record) {

        return (
          total +
          Number(
            record.profit || 0
          )
        );

      },
      0
    );


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


  if (!list) {
    return;
  }


  if (filtered.length === 0) {

    list.innerHTML =
      `
      <div class="empty-message">
        No POS records found.
      </div>
      `;

    return;

  }


  list.innerHTML =
    filtered
      .map(
        function(record) {

          const deleteButton =
            isAdmin()
              ? `
                <button
                  type="button"
                  class="danger-btn small-btn"
                  onclick="deletePOSRecord('${record.id}')">
                  🗑️ Delete
                </button>
              `
              : "";


          return `
            <div class="record-card">

              <div class="record-card-header">

                <div>

                  <h3>
                    ${escapeHTML(
                      record.type ||
                      "POS"
                    )}
                  </h3>

                  <small>
                    ${formatDate(record.date)}
                  </small>

                </div>

                <strong>
                  ${money(record.amount)}
                </strong>

              </div>


              <div class="record-details">

                <div class="record-detail">
                  <span>Profit</span>
                  <strong class="profit-text">
                    ${money(record.profit)}
                  </strong>
                </div>

                <div class="record-detail">
                  <span>Customer / Reference</span>
                  <strong>
                    ${escapeHTML(
                      record.customer ||
                      record.reference ||
                      "-"
                    )}
                  </strong>
                </div>

                <div class="record-detail">
                  <span>Recorded By</span>
                  <strong>
                    ${escapeHTML(
                      record.recordedBy ||
                      "Staff"
                    )}
                  </strong>
                </div>

              </div>


              ${
                record.note
                  ? `
                    <p class="record-note">
                      📝 ${escapeHTML(record.note)}
                    </p>
                  `
                  : ""
              }


              ${deleteButton}

            </div>
          `;

        }
      )
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

  if (!requireAdmin()) {
    return;
  }


  const confirmed =
    confirm(
      "Delete this POS record?"
    );


  if (!confirmed) {
    return;
  }


  posRecords =
    posRecords.filter(
      function(record) {

        return record.id !== id;

      }
    );


  saveAll();

  displayPOSRecords();

  updateDashboard();


  alert(
    "POS record deleted."
  );

}


/* =========================================================
   STAFF MANAGEMENT
========================================================= */

function createStaff(event) {

  event.preventDefault();


  if (!requireAdmin()) {
    return;
  }


  const name =
    document
      .getElementById(
        "staffName"
      )
      ?.value
      .trim();


  const username =
    document
      .getElementById(
        "staffUsername"
      )
      ?.value
      .trim();


  const password =
    document
      .getElementById(
        "staffPassword"
      )
      ?.value;


  const confirmPassword =
    document
      .getElementById(
        "staffPasswordConfirm"
      )
      ?.value;


  if (!name) {

    alert(
      "Please enter the staff name."
    );

    return;

  }


  if (
    username.length < 3
  ) {

    alert(
      "Username must be at least 3 characters."
    );

    return;

  }


  if (
    password.length < 6
  ) {

    alert(
      "Password must be at least 6 characters."
    );

    return;

  }


  if (
    password !==
    confirmPassword
  ) {

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


  const staff = {

    id:
      makeId("staff"),

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
      new Date().toISOString(),

    createdBy:
      currentUser.username

  };


  users.push(
    staff
  );


  saveAll();


  document
    .getElementById(
      "staffForm"
    )
    ?.reset();


  displayStaff();


  alert(
    "✅ Sales staff account created successfully."
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
    users.filter(
      function(user) {

        return user.role === "staff";

      }
    );


  if (staff.length === 0) {

    list.innerHTML =
      `
      <div class="empty-message">
        No sales staff accounts have been created yet.
      </div>
      `;

    return;

  }


  list.innerHTML =
    staff
      .map(
        function(user) {

          const status =
            user.active !== false
              ? "Active"
              : "Disabled";


          const toggleText =
            user.active !== false
              ? "⛔ Disable"
              : "✅ Enable";


          return `
            <div class="staff-card">

              <div>

                <h3>
                  ${escapeHTML(user.name)}
                </h3>

                <p>
                  Username:
                  <strong>
                    ${escapeHTML(user.username)}
                  </strong>
                </p>

                <small>
                  Created:
                  ${formatDateTime(user.createdAt)}
                </small>

              </div>


              <div class="staff-status ${
                user.active !== false
                  ? "status-active"
                  : "status-disabled"
              }">
                ${status}
              </div>


              <div class="card-actions">

                <button
                  type="button"
                  class="secondary-btn small-btn"
                  onclick="toggleStaff('${user.id}')">
                  ${toggleText}
                </button>

                <button
                  type="button"
                  class="danger-btn small-btn"
                  onclick="deleteStaff('${user.id}')">
                  🗑️ Delete
                </button>

              </div>

            </div>
          `;

        }
      )
      .join("");

}


function toggleStaff(userId) {

  if (!requireAdmin()) {
    return;
  }


  const user =
    users.find(
      function(item) {

        return item.id === userId;

      }
    );


  if (!user) {
    return;
  }


  if (user.role === "admin") {

    alert(
      "The Admin account cannot be disabled here."
    );

    return;

  }


  user.active =
    user.active === false;


  saveAll();

  displayStaff();


  alert(
    user.active
      ? "Staff account enabled."
      : "Staff account disabled."
  );

}


function deleteStaff(userId) {

  if (!requireAdmin()) {
    return;
  }


  const user =
    users.find(
      function(item) {

        return item.id === userId;

      }
    );


  if (!user) {
    return;
  }


  if (user.role === "admin") {

    alert(
      "The Admin account cannot be deleted here."
    );

    return;

  }


  const confirmed =
    confirm(
      "Delete this staff account?\n\n" +
      user.name +
      "\n" +
      user.username
    );


  if (!confirmed) {
    return;
  }


  users =
    users.filter(
      function(item) {

        return item.id !== userId;

      }
    );


  saveAll();

  displayStaff();


  alert(
    "Staff account deleted."
  );

}


/* =========================================================
   CHANGE ADMIN PASSWORD
========================================================= */

function changeAdminPassword(event) {

  event.preventDefault();


  if (!requireAdmin()) {
    return;
  }


  const currentPassword =
    document
      .getElementById(
        "currentAdminPassword"
      )
      ?.value;


  const newPassword =
    document
      .getElementById(
        "newAdminPassword"
      )
      ?.value;


  const confirmPassword =
    document
      .getElementById(
        "confirmAdminPassword"
      )
      ?.value;


  const admin =
    users.find(
      function(user) {

        return (
          user.id === currentUser.id &&
          user.role === "admin"
        );

      }
    );


  if (!admin) {

    alert(
      "Admin account could not be found."
    );

    return;

  }


  if (
    admin.password !==
    currentPassword
  ) {

    alert(
      "❌ Current Admin password is incorrect."
    );

    return;

  }


  if (
    newPassword.length < 6
  ) {

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


  document
    .getElementById(
      "adminPasswordForm"
    )
    ?.reset();


  alert(
    "✅ Admin password changed successfully."
  );

}


/* =========================================================
   DEFAULT DATES
========================================================= */

function setDefaultDates() {

  const date =
    today();


  const phoneDate =
    document.getElementById(
      "phoneDate"
    );


  const posDate =
    document.getElementById(
      "posDate"
    );


  if (
    phoneDate &&
    !phoneDate.value
  ) {

    phoneDate.value =
      date;

  }


  if (
    posDate &&
    !posDate.value
  ) {

    posDate.value =
      date;

  }

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

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
   QUICK ACTIONS
========================================================= */

function openPhoneRecordForm() {

  if (!requireLogin()) {
    return;
  }


  const form =
    document.getElementById(
      "phoneRecordForm"
    );


  if (form) {

    form.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }

}


function openPOSForm() {

  if (!requireLogin()) {
    return;
  }


  const form =
    document.getElementById(
      "posForm"
    );


  if (form) {

    form.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }

}


/* =========================================================
   GLOBAL REFRESH
========================================================= */

function refreshAll() {

  products =
    load(KEYS.products, []);

  sales =
    load(KEYS.sales, []);

  phoneRecords =
    load(KEYS.phone, []);

  posRecords =
    load(KEYS.pos, []);

  users =
    load(KEYS.users, []);

  currentUser =
    load(KEYS.current, null);


  if (currentUser) {

    const user =
      users.find(
        function(item) {

          return (
            item.id ===
            currentUser.id &&
            item.active !== false
          );

        }
      );


    if (!user) {

      currentUser = null;

      localStorage.removeItem(
        KEYS.current
      );

      showLogin();

      return;

    }

  }


  if (currentUser) {
    showApplication();
  } else {
    initializeAuthentication();
  }

}
