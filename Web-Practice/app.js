// Usuarios permitidos
let usuarios = [];
function cargarUsuarios() {
  const data = localStorage.getItem("usuariosFamilia");
  usuarios = data ? JSON.parse(data) : [];
}
function guardarUsuarios() {
  localStorage.setItem("usuariosFamilia", JSON.stringify(usuarios));
}
cargarUsuarios();

let usuarioActual = null;
let gastos = {};

// Cargar gastos desde localStorage
function cargarGastos() {
  const data = localStorage.getItem("gastosFamilia");
  gastos = data ? JSON.parse(data) : {};
}

function guardarGastos() {
  localStorage.setItem("gastosFamilia", JSON.stringify(gastos));
}

// Alternar entre login y registro
const registroSection = document.getElementById("registro-section");
const showRegistroBtn = document.getElementById("show-registro-btn");
const backLoginBtn = document.getElementById("back-login-btn");
showRegistroBtn.onclick = () => {
  loginSection.style.display = "none";
  registroSection.style.display = "block";
};
backLoginBtn.onclick = () => {
  registroSection.style.display = "none";
  loginSection.style.display = "block";
};

// Registro de usuario
const registroForm = document.getElementById("registro-form");
const registroError = document.getElementById("registro-error");
registroForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("new-username").value.trim();
  const password = document.getElementById("new-password").value;
  if (usuarios.find((u) => u.usuario === username)) {
    registroError.textContent = "El usuario ya existe.";
    return;
  }
  if (username.length < 3 || password.length < 4) {
    registroError.textContent = "Usuario o contraseña demasiado cortos.";
    return;
  }
  usuarios.push({ usuario: username, password });
  guardarUsuarios();
  registroError.textContent = "";
  registroForm.reset();
  registroSection.style.display = "none";
  loginSection.style.display = "block";
  loginError.textContent = "Usuario registrado. Ahora puedes iniciar sesión.";
});

// Login
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const loginSection = document.getElementById("login-section");
const appSection = document.getElementById("app-section");
const userGreeting = document.getElementById("user-greeting");
const logoutBtn = document.getElementById("logout-btn");

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  cargarUsuarios();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const user = usuarios.find(
    (u) => u.usuario === username && u.password === password
  );
  if (user) {
    usuarioActual = username;
    loginSection.style.display = "none";
    appSection.style.display = "block";
    userGreeting.textContent = `Hola, ${usuarioActual}`;
    mostrarGastos();
  } else {
    loginError.textContent = "Usuario o contraseña incorrectos.";
  }
});

logoutBtn.addEventListener("click", function () {
  usuarioActual = null;
  loginSection.style.display = "block";
  appSection.style.display = "none";
  loginForm.reset();
  loginError.textContent = "";
});

// Navegación entre secciones
const navBtns = document.querySelectorAll(".nav-btn");
const pages = {
  inicio: document.getElementById("inicio-section"),
  gastos: document.getElementById("gastos-section"),
  reportes: document.getElementById("reportes-section"),
  usuarios: document.getElementById("usuarios-section"),
};
navBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    Object.values(pages).forEach((p) => (p.style.display = "none"));
    pages[btn.dataset.section].style.display = "block";
    if (btn.dataset.section === "reportes") mostrarReporte();
    if (btn.dataset.section === "usuarios") mostrarUsuarios();
    if (btn.dataset.section === "gastos") mostrarGastos();
  });
});

// Gastos
const gastoForm = document.getElementById("gasto-form");
const gastosList = document.getElementById("gastos-list");
const categoriaGasto = document.getElementById("categoria-gasto");

gastoForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const desc = document.getElementById("desc-gasto").value;
  const monto = parseFloat(document.getElementById("monto-gasto").value);
  const categoria = categoriaGasto.value;
  if (!gastos[usuarioActual]) gastos[usuarioActual] = [];
  gastos[usuarioActual].push({
    desc,
    monto,
    categoria,
    fecha: new Date().toLocaleDateString(),
  });
  guardarGastos();
  mostrarGastos();
  gastoForm.reset();
});

function mostrarGastos() {
  cargarGastos();
  const lista = gastos[usuarioActual] || [];
  gastosList.innerHTML = "";
  let total = 0;
  lista.forEach((g, i) => {
    total += g.monto;
    const icono = obtenerIconoCategoria(g.categoria);
    const li = document.createElement("li");
    li.innerHTML = `<span>${icono} ${g.fecha} - ${g.desc} <small>(${
      g.categoria
    })</small></span><span>$${g.monto.toFixed(2)}</span>
      <button class='edit-btn' data-idx='${i}'>✏️</button>
      <button class='delete-btn' data-idx='${i}'>🗑️</button>`;
    gastosList.appendChild(li);
  });
  document.getElementById(
    "reporte-total"
  ).textContent = `Total: $${total.toFixed(2)}`;
  // Asignar eventos a los botones
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.onclick = editarGasto;
  });
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.onclick = eliminarGasto;
  });
}

function obtenerIconoCategoria(cat) {
  switch (cat) {
    case "Alimentación":
      return "🍔";
    case "Transporte":
      return "🚗";
    case "Salud":
      return "🩺";
    case "Educación":
      return "📚";
    case "Ocio":
      return "🎉";
    case "Otros":
      return "🛒";
    default:
      return "";
  }
}

function mostrarReporte() {
  cargarGastos();
  const lista = gastos[usuarioActual] || [];
  const categorias = {};
  let total = 0;
  lista.forEach((g) => {
    categorias[g.categoria] = (categorias[g.categoria] || 0) + g.monto;
    total += g.monto;
  });
  document.getElementById(
    "reporte-total"
  ).textContent = `Total: $${total.toFixed(2)}`;
  // Gráfico
  const ctx = document.getElementById("grafico-gastos").getContext("2d");
  if (window.graficoGastos) window.graficoGastos.destroy();
  window.graficoGastos = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categorias),
      datasets: [
        {
          data: Object.values(categorias),
          backgroundColor: [
            "#3498db",
            "#e67e22",
            "#2ecc71",
            "#e74c3c",
            "#9b59b6",
            "#95a5a6",
          ],
        },
      ],
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

function mostrarUsuarios() {
  const ul = document.getElementById("usuarios-list");
  ul.innerHTML = "";
  cargarUsuarios();
  usuarios.forEach((u) => {
    const li = document.createElement("li");
    li.innerHTML = `<i class="fa-solid fa-user"></i> ${u.usuario}`;
    ul.appendChild(li);
  });
}

function editarGasto(e) {
  const idx = e.target.dataset.idx;
  const gasto = gastos[usuarioActual][idx];
  document.getElementById("desc-gasto").value = gasto.desc;
  document.getElementById("monto-gasto").value = gasto.monto;
  gastos[usuarioActual].splice(idx, 1);
  guardarGastos();
  mostrarGastos();
}

function eliminarGasto(e) {
  const idx = e.target.dataset.idx;
  gastos[usuarioActual].splice(idx, 1);
  guardarGastos();
  mostrarGastos();
}

// Alternar modo claro/oscuro
const toggleDarkBtn = document.getElementById("toggle-dark-btn");
toggleDarkBtn.onclick = () => {
  document.body.classList.toggle("dark-mode");
  // Guardar preferencia en localStorage
  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("modoOscuro", "true");
    toggleDarkBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    localStorage.setItem("modoOscuro", "false");
    toggleDarkBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
};
// Al cargar, aplicar preferencia
if (localStorage.getItem("modoOscuro") === "true") {
  document.body.classList.add("dark-mode");
  toggleDarkBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
} else {
  toggleDarkBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
}

// Inicializar
cargarGastos();
