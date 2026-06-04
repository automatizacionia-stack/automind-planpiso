/* Automind · Definición de tenants (agencias)
   Cada agencia tiene: id, nombre, ciudad, color de acento, sidebar, financieras propias,
   seed determinista, credenciales demo y usuarios del equipo.
   Los datos se generan lazy (primera vez que se accede). */

(function () {
  "use strict";

  const TENANTS_CONFIG = [
    {
      id:       "demo",
      nombre:   "Agencia Demo",
      ciudad:   "Ciudad de México",
      iniciales:"AD",
      accent:   "#2f6fed",
      sidebar:  "#1b2a57",
      email:    "demo@automind.mx",
      password: "demo1234",
      seed:     20260529,
      financieras: [
        { nombre:"NR Finance",        tasa:0.14, plazo:120 },
        { nombre:"BBVA Crédito Auto", tasa:0.14, plazo:120 },
        { nombre:"Banorte Plan Piso", tasa:0.15, plazo:90  },
        { nombre:"GM Financial",      tasa:0.14, plazo:150 },
        { nombre:"Cygnus Finance",    tasa:0.16, plazo:90  },
        { nombre:"Auto Capital",      tasa:0.15, plazo:120 },
      ],
      perfilesDias: [
        18,24,9,31,27,14,22,38,12,44,35,29,41,16,33,
        58,64,71,55,67,61,74,
        96,88,102,91,84,99,108,86,94,112,89,97,105,83,118,
        132,121,145,
      ],
      idPrefix: "V", idBase: 1001, invBase: 7600,
      usuarios: [
        { id:"D1", nombre:"Carlos Mendoza",    email:"cmendoza@agenciademo.mx",  tel:"55 1234 5678", rol:"director",  reportaA:null, fechaIngreso:"2022-01-10" },
        { id:"G1", nombre:"Ana Torres",         email:"atorres@agenciademo.mx",   tel:"55 2345 6789", rol:"gerente",   reportaA:"D1", fechaIngreso:"2022-03-15" },
        { id:"G2", nombre:"Roberto García",     email:"rgarcia@agenciademo.mx",   tel:"55 3456 7890", rol:"gerente",   reportaA:"D1", fechaIngreso:"2022-06-01" },
        { id:"V1", nombre:"Luis Pérez",          email:"lperez@agenciademo.mx",    tel:"55 4567 8901", rol:"vendedor",  reportaA:"G1", fechaIngreso:"2023-01-20" },
        { id:"V2", nombre:"María López",         email:"mlopez@agenciademo.mx",    tel:"55 5678 9012", rol:"vendedor",  reportaA:"G1", fechaIngreso:"2023-04-05" },
        { id:"V3", nombre:"Juan Sánchez",        email:"jsanchez@agenciademo.mx",  tel:"55 6789 0123", rol:"vendedor",  reportaA:"G1", fechaIngreso:"2023-07-12" },
        { id:"V4", nombre:"Sofía Martínez",      email:"smartinez@agenciademo.mx", tel:"55 7890 1234", rol:"vendedor",  reportaA:"G2", fechaIngreso:"2023-02-28" },
        { id:"V5", nombre:"David Hernández",     email:"dhernandez@agenciademo.mx",tel:"55 8901 2345", rol:"vendedor",  reportaA:"G2", fechaIngreso:"2024-01-08" },
      ],
      usuarioActualId: "G1",  // Ana Torres es quien inicia sesión con demo@automind.mx
    },
    {
      id:       "norte",
      nombre:   "Grupo Automotriz Norte",
      ciudad:   "Monterrey, NL",
      iniciales:"GN",
      accent:   "#1f9d57",
      sidebar:  "#0f3d27",
      email:    "norte@automind.mx",
      password: "norte2024",
      seed:     11223344,
      financieras: [
        { nombre:"Banorte Plan Piso", tasa:0.15, plazo:90  },
        { nombre:"BBVA Crédito Auto", tasa:0.14, plazo:120 },
        { nombre:"Santander Auto",    tasa:0.155,plazo:120 },
        { nombre:"HSBC Fleet",        tasa:0.145,plazo:105 },
      ],
      perfilesDias: [
        12,20,8,25,19,30,15,42,10,36,28,22,48,17,38,
        55,62,70,50,65,59,72,
        90,82,98,87,80,95,104,83,91,109,86,94,101,80,115,
        128,119,140,
      ],
      idPrefix: "N", idBase: 2001, invBase: 4400,
      usuarios: [
        { id:"D1", nombre:"Jorge Ramírez",       email:"jramirez@grupanorte.mx",   tel:"81 1234 5678", rol:"director",  reportaA:null, fechaIngreso:"2021-06-01" },
        { id:"G1", nombre:"Patricia Flores",      email:"pflores@grupanorte.mx",    tel:"81 2345 6789", rol:"gerente",   reportaA:"D1", fechaIngreso:"2021-09-15" },
        { id:"G2", nombre:"Eduardo Vargas",       email:"evargas@grupanorte.mx",    tel:"81 3456 7890", rol:"gerente",   reportaA:"D1", fechaIngreso:"2022-02-10" },
        { id:"V1", nombre:"Carlos Ruiz",          email:"cruiz@grupanorte.mx",      tel:"81 4567 8901", rol:"vendedor",  reportaA:"G1", fechaIngreso:"2022-08-01" },
        { id:"V2", nombre:"Diana Castro",         email:"dcastro@grupanorte.mx",    tel:"81 5678 9012", rol:"vendedor",  reportaA:"G1", fechaIngreso:"2023-01-16" },
        { id:"V3", nombre:"Fernando Morales",     email:"fmorales@grupanorte.mx",   tel:"81 6789 0123", rol:"vendedor",  reportaA:"G1", fechaIngreso:"2023-05-22" },
        { id:"V4", nombre:"Isabel Ortega",        email:"iortega@grupanorte.mx",    tel:"81 7890 1234", rol:"vendedor",  reportaA:"G2", fechaIngreso:"2023-03-07" },
        { id:"V5", nombre:"Alejandro Reyes",      email:"areyes@grupanorte.mx",     tel:"81 8901 2345", rol:"vendedor",  reportaA:"G2", fechaIngreso:"2024-02-14" },
      ],
      usuarioActualId: "G1",
    },
    {
      id:       "bajio",
      nombre:   "Distribuidora del Bajío",
      ciudad:   "León, Gto.",
      iniciales:"DB",
      accent:   "#7a4ef0",
      sidebar:  "#2a1d52",
      email:    "bajio@automind.mx",
      password: "bajio2024",
      seed:     99887766,
      financieras: [
        { nombre:"Auto Capital",      tasa:0.15, plazo:120 },
        { nombre:"NR Finance",        tasa:0.14, plazo:120 },
        { nombre:"Cygnus Finance",    tasa:0.16, plazo:90  },
        { nombre:"GM Financial",      tasa:0.14, plazo:150 },
        { nombre:"Mifel Auto",        tasa:0.155,plazo:120 },
      ],
      perfilesDias: [
        22,15,11,28,33,18,25,45,14,39,31,26,52,20,35,
        60,68,75,58,70,64,78,
        100,92,106,95,88,103,112,90,98,116,93,101,109,87,122,
        136,125,148,
      ],
      idPrefix: "B", idBase: 3001, invBase: 5500,
      usuarios: [
        { id:"D1", nombre:"Marcela Gutiérrez",   email:"mgutierrez@disbajio.mx",   tel:"47 1234 5678", rol:"director",  reportaA:null, fechaIngreso:"2020-11-01" },
        { id:"G1", nombre:"Ricardo Delgado",      email:"rdelgado@disbajio.mx",     tel:"47 2345 6789", rol:"gerente",   reportaA:"D1", fechaIngreso:"2021-02-20" },
        { id:"G2", nombre:"Alejandra Vega",       email:"avega@disbajio.mx",        tel:"47 3456 7890", rol:"gerente",   reportaA:"D1", fechaIngreso:"2021-07-05" },
        { id:"V1", nombre:"Pablo Navarro",        email:"pnavarro@disbajio.mx",     tel:"47 4567 8901", rol:"vendedor",  reportaA:"G1", fechaIngreso:"2022-03-14" },
        { id:"V2", nombre:"Carmen Rivera",        email:"crivera@disbajio.mx",      tel:"47 5678 9012", rol:"vendedor",  reportaA:"G1", fechaIngreso:"2022-09-01" },
        { id:"V3", nombre:"Sergio Torres",        email:"storres@disbajio.mx",      tel:"47 6789 0123", rol:"vendedor",  reportaA:"G1", fechaIngreso:"2023-01-30" },
        { id:"V4", nombre:"Valentina Cruz",       email:"vcruz@disbajio.mx",        tel:"47 7890 1234", rol:"vendedor",  reportaA:"G2", fechaIngreso:"2023-06-19" },
        { id:"V5", nombre:"Andrés Jiménez",       email:"ajimenez@disbajio.mx",     tel:"47 8901 2345", rol:"vendedor",  reportaA:"G2", fechaIngreso:"2024-03-04" },
      ],
      usuarioActualId: "G1",
    },
  ];

  // Cache de datos generados por tenant (lazy)
  const _cache = {};

  function getDatos(tenantId) {
    if (!_cache[tenantId]) {
      const cfg = TENANTS_CONFIG.find(t => t.id === tenantId);
      if (!cfg) throw new Error("Tenant no encontrado: " + tenantId);
      _cache[tenantId] = window.generarDatos(cfg);
    }
    return _cache[tenantId];
  }

  function login(email, password) {
    const cfg = TENANTS_CONFIG.find(
      t => t.email.toLowerCase() === email.toLowerCase() && t.password === password
    );
    if (!cfg) return null;
    // Activar datos del tenant
    window.AUTOMIND = getDatos(cfg.id);
    // Añadir usuarioActual al cfg que se retorna
    const usuarioActual = cfg.usuarios.find(u => u.id === cfg.usuarioActualId) || cfg.usuarios[0];
    return { ...cfg, usuarioActual };
  }

  function logout() {
    window.AUTOMIND = null;
  }

  window.TENANTS = { configs: TENANTS_CONFIG, login, logout, getDatos };
})();
