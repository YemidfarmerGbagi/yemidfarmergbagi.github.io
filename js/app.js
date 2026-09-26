/* =========================================================
   PHONE ACCESSORIES MANAGER
   COMPLETE APPLICATION
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const KEYS = {

  products: "accessoryProducts",

  sales: "accessorySales",

  phone: "phoneRechargeRecords",

  pos: "posRecords",

  users: "accessoryUsers",

  current: "accessoryCurrentUser"

};


/*
   Admin recovery code.

   Login screen
   → Forgot Admin Login
   → enter 2580
*/

const ADMIN_RECOVERY_CODE = "2580";


/* =========================================================
   DATA
========================================================= */

let products =
  load(KEYS.products, []);

let sales =
  load(KEYS.sales, []);

let phoneRecords =
  load(KEYS.phone, []);

let posRecords =
  load(KEYS.pos, []);

let users =
  load(KEYS.users, []);

let currentUser =
  load(KEYS.current, null);

let buyingPricesVisible = false;


/* =========================================================
   HELPERS
========================================================= */

function load(key, fallback) {

  try {

    return (
      JSON.parse(
        localStorage.getItem(key)
      ) ?? fallback
    );

  } catch (error) {

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


function money(number) {

  return (
    "₦" +
    Number(number || 0)
      .toLocaleString("en-NG")
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
      .substring(2, 8)
  );

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

  return date.toLocaleDateString(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


function setText(id, value) {

  const element =
    document.getElementById(id);

  if (element) {

    element.textContent =
      value;

  }

}


function isAdmin() {

  return !!(
    currentUser &&
    currentUser.role === "admin"
  );

}


function userExists(username) {

  return users.some(
    function (user) {

      return (
        user.username &&
        user.username.toLowerCase() ===
        username.toLowerCase()
      );

    }
  );

}


/* =========================================================
   START
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
    document.getElementById(
      "loginForm"
    );

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      login
    );

  }


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
    document.getElementById(
      "posForm"
    );

  if (posForm) {

    posForm.addEventListener(
      "submit",
      savePOSRecord
    );

  }


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

}


/* =========================================================
   AUTHENTICATION
========================================================= */

function initializeAuthentication() {

  const adminExists =
    users.some(
      function (user) {

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

        username:
          savedUser.username,

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


function toggleScreens(activeScreen) {

  [
    "loginScreen",
    "setupScreen",
    "app"

  ].forEach(
    function (id) {

      const element =
        document.getElementById(id);

      if (!element) return;

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

  toggleScreens(
    "setupScreen"
  );

}


function showApplication() {

  toggleScreens(
    "app"
  );

  updateUserInterface();

  initializeApplication();

}


/* =========================================================
   CREATE ADMIN
========================================================= */

function createAdmin(event) {

  event.preventDefault();


  const username =
    document
      .getElementById(
        "setupUsername"
      )
      .value
      .trim();


  const password =
    document
      .getElementById(
        "setupPassword"
      )
      .value;


  const confirmPassword =
    document
      .getElementById(
        "setupPasswordConfirm"
      )
      .value;


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
      function (user) {

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

  saveAll();

  setCurrentUser(admin);


  document
    .getElementById(
      "setupForm"
    )
    .reset();


  alert(
    "Admin account created successfully."
  );


  showApplication();

}


function setCurrentUser(user) {

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
      .value
      .trim();


  const password =
    document
      .getElementById(
        "loginPassword"
      )
      .value;


  const user =
    users.find(
      function (item) {

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

    alert(
      "Incorrect username or password."
    );

    return;

  }


  setCurrentUser(user);


  document
    .getElementById(
      "loginForm"
    )
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
    KEYS.current
  );


  showLogin();

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


  if (
    code !==
    ADMIN_RECOVERY_CODE
  ) {

    alert(
      "Incorrect recovery code."
    );

    return;

  }


  const confirmed =
    confirm(
      "Reset login accounts only?\n\n" +
      "Your products, sales, Phone/Data " +
      "and POS records will remain."
    );


  if (!confirmed) {

    return;

  }


  users = [];

  currentUser = null;


  localStorage.removeItem(
    KEYS.users
  );

  localStorage.removeItem(
    KEYS.current
  );


  alert(
    "Login accounts have been reset."
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
      function (element) {

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

}


/* =========================================================
   APPLICATION
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
      function (section) {

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
      function (navButton) {

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
    sectionId ===
    "products"
  ) {

    displayProducts();

  }


  if (
    sectionId ===
    "sales"
  ) {

    updateSaleProducts();

  }


  if (
    sectionId ===
    "phoneRecords"
  ) {

    displayPhoneRecords();

  }


  if (
    sectionId ===
    "pos"
  ) {

    displayPOSRecords();

  }


  if (
    sectionId ===
    "history"
  ) {

    displaySales();

  }


  if (
    sectionId ===
    "admin"
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
      function (total, sale) {

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
      function (total, sale) {

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
      function (total, record) {

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
      function (total, record) {

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


  const lowStockProducts =
    products.filter(
      function (product) {

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

    products.reduce(
      function (total, product) {

        return (
          total +
          Number(
            product.quantity || 0
          )
        );

      },
      0
    )
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
        function (product) {

          return `
            <div class="record-card">

              <b>
                ${escapeHTML(product.name)}
              </b>

              <span class="stock-low">
                Only ${product.quantity} left
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


  container.classList.remove(
    "hidden"
  );


  const form =
    document.getElementById(
      "productForm"
    );


  form.reset();


  const product =
    productId
      ? products.find(
          function (item) {

            return (
              item.id ===
              productId
            );

          }
        )
      : null;


  document.getElementById(
    "editProductId"
  ).value =
    product
      ? product.id
      : "";


  document.getElementById(
    "productFormTitle"
  ).textContent =
    product
      ? "Edit Product"
      : "Add New Product";


  if (product) {

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


  document.getElementById(
    "editProductId"
  ).value = "";

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


  if (
    !name ||
    buyingPrice < 0 ||
    sellingPrice < 0 ||
    quantity < 0
  ) {

    alert(
      "Please enter valid product information."
    );

    return;

  }


  const editId =
    document.getElementById(
      "editProductId"
    ).value;


  if (editId) {

    const product =
      products.find(
        function (item) {

          return (
            item.id ===
            editId
          );

        }
      );


    if (!product) {

      return;

    }


    product.name =
      name;

    produc
