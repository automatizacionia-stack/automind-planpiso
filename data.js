/* Automind · Plan Piso — Motor de datos y fórmulas
   Expone window.generarDatos(cfg) para uso multi-tenant.
   cfg: { seed, financieras, perfilesDias, idPrefix, invBase } */

(function () {
  "use strict";

  // ── Catálogo compartido ────────────────────────────────────────────────────
  const CATALOGO = [
    ["Volkswagen", "Golf GTI", [620000, 760000]],
    ["Volkswagen", "Jetta Trendline", [430000, 510000]],
    ["Volkswagen", "Jetta Comfortline", [470000, 545000]],
    ["Volkswagen", "Jetta Sportline", [510000, 590000]],
    ["Volkswagen", "Jetta GLI", [560000, 650000]],
    ["Volkswagen", "Virtus Comfortline", [355000, 420000]],
    ["Volkswagen", "Tiguan Trendline", [560000, 670000]],
    ["Volkswagen", "Taos Comfortline", [510000, 600000]],
    ["Nissan", "Versa Sense", [255000, 320000]],
    ["Nissan", "Sentra Advance", [360000, 430000]],
    ["Nissan", "Kicks Exclusive", [400000, 470000]],
    ["Nissan", "Frontier LE", [560000, 690000]],
    ["Nissan", "X-Trail Advance", [620000, 740000]],
    ["Toyota", "Corolla LE", [410000, 490000]],
    ["Toyota", "Hilux SR", [620000, 760000]],
    ["Toyota", "RAV4 XLE", [690000, 820000]],
    ["Toyota", "Yaris Core", [285000, 340000]],
    ["Chevrolet", "Aveo LT", [255000, 300000]],
    ["Chevrolet", "Onix Premier", [330000, 395000]],
    ["Chevrolet", "Cavalier LT", [340000, 410000]],
    ["Chevrolet", "Tracker LT", [430000, 510000]],
    ["Chevrolet", "Silverado LT", [820000, 980000]],
    ["Kia", "Rio LX", [305000, 360000]],
    ["Kia", "Forte GT-Line", [430000, 500000]],
    ["Kia", "Sportage EX", [560000, 660000]],
    ["Kia", "Seltos EX", [470000, 545000]],
    ["Hyundai", "Grand i10 GLS", [255000, 305000]],
    ["Hyundai", "Accent GL", [320000, 375000]],
    ["Hyundai", "Creta Limited", [480000, 560000]],
    ["Hyundai", "Tucson Limited", [620000, 720000]],
    ["Mazda", "Mazda3 Grand Touring", [470000, 545000]],
    ["Mazda", "CX-5 Sport", [620000, 720000]],
    ["Mazda", "CX-30 Sport", [510000, 590000]],
    ["Mazda", "Mazda2 Touring", [320000, 375000]],
    ["Honda", "City Prime", [375000, 440000]],
    ["Honda", "Civic Sport", [560000, 650000]],
    ["Honda", "CR-V Turbo Plus", [690000, 800000]],
    ["Honda", "HR-V Prime", [490000, 575000]],
    ["Ford", "Ranger XLT", [620000, 740000]],
    ["Ford", "Bronco Sport", [690000, 810000]],
  ];

  const COLOR_EXT  = ["AZUL ANEMONA","AZUL MONTERREY","NEGRO PROFUNDO","ROJO KINGS","BLANCO PURO","GRIS FRANELA","PLATA REFLEX"];
  const COLOR_INT  = ["NEGRO","NEGRO","NEGRO","BEIGE","GRIS"];
  const TIPOS      = ["DA19ZZ","BU52MS","BU53MS","BU59UZ","AX41KK","MS22TT","CV30LT"];
  const OBSERVACIONES = ["","","","","","","","Apartado cliente","Demo gerencia","Pendiente de placas","Traslado a sucursal"];
  const VIN_CHARS  = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";

  const fmtFecha = (d) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

  // ── PRNG determinista ──────────────────────────────────────────────────────
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ── Columnas estándar de inventario ───────────────────────────────────────
  function buildCols() {
    return [
      { key:"vin",              titulo:"VIN",                      tipo:"dato", ftype:"text",    w:176, align:"left" },
      { key:"estatus",          titulo:"Estatus",                  tipo:"dato", ftype:"select",  w:116, align:"left" },
      { key:"inv",              titulo:"INV",                      tipo:"dato", ftype:"num",     w:76,  align:"right", sum:true },
      { key:"descripcion",      titulo:"Descripcion",              tipo:"dato", ftype:"text",    w:222, align:"left" },
      { key:"anio",             titulo:"Año",                      tipo:"dato", ftype:"num",     w:70,  align:"right" },
      { key:"tipo",             titulo:"Tipo",                     tipo:"dato", ftype:"text",    w:90,  align:"left" },
      { key:"colorExterior",    titulo:"Color_Exterior",           tipo:"dato", ftype:"text",    w:150, align:"left" },
      { key:"colorInterior",    titulo:"Color_Interior",           tipo:"dato", ftype:"text",    w:124, align:"left" },
      { key:"fechaFacturaTxt",  titulo:"Fecha_Factura",            tipo:"dato", ftype:"date",    w:122, align:"left" },
      { key:"fechaLlegadaTxt",  titulo:"Fecha_Llegada",            tipo:"dato", ftype:"date",    w:122, align:"left" },
      { key:"montoFinanciado",  titulo:"Monto_Financiado",         tipo:"dato", ftype:"money",   w:150, align:"right", fmt:"money2", sum:true },
      { key:"diasGraciaBase",   titulo:"Dias_Gracia_Base",         tipo:"dato", ftype:"num",     w:138, align:"right" },
      { key:"diasGraciaExtra",  titulo:"Dias_Gracia_Extra",        tipo:"dato", ftype:"num",     w:142, align:"right" },
      { key:"pctInteres",       titulo:"Porcentaje_Interes_Anual", tipo:"dato", ftype:"pct",     w:184, align:"right", fmt:"pct2" },
      { key:"plazoDias",        titulo:"Plazo_Dias",               tipo:"dato", ftype:"num",     w:102, align:"right" },
      { key:"financiera",       titulo:"Financiera",               tipo:"dato", ftype:"text",    w:158, align:"left" },
      { key:"observaciones",    titulo:"Observaciones",            tipo:"dato", ftype:"longtext",w:180, align:"left" },
      // ── Campos calculados (fórmulas reales) ──────────────────────────────
      { key:"diasEnPiso",       titulo:"Dias_en_Piso",             tipo:"calc", ftype:"calc",    w:116, align:"right",
        formula:"= DATETIME_DIFF(TODAY(), Fecha_Factura, 'days') - 1",
        desc:"Días desde la factura hasta hoy (menos 1 por convención)." },
      { key:"diasGraciaTotal",  titulo:"Dias_Gracia_Total",        tipo:"calc", ftype:"calc",    w:148, align:"right",
        formula:"= Dias_Gracia_Base + Dias_Gracia_Extra",
        desc:"Total de días libres de interés." },
      { key:"diasLibresRestantes",titulo:"Dias_Libres_Restantes",  tipo:"calc", ftype:"calc",    w:168, align:"right",
        formula:"= Dias_Gracia_Total - Dias_en_Piso",
        desc:"Días de gracia que aún quedan. Negativo = ya venció la gracia." },
      { key:"diasVencidos",     titulo:"Dias_Vencidos",            tipo:"calc", ftype:"calc",    w:128, align:"right",
        formula:"= IF(Dias_Libres_Restantes < 0, ABS(Dias_Libres_Restantes), 0)",
        desc:"Días fuera del período de gracia que generan interés." },
      { key:"interesDiario",    titulo:"Interes_Diario",           tipo:"calc", ftype:"calc",    w:138, align:"right", fmt:"money2",
        formula:"= (Monto_Financiado * Porcentaje_Interes_Anual) / 365",
        desc:"Interés que genera la unidad cada día (base 365)." },
      { key:"interesAcum",      titulo:"Interes_Acumulado",        tipo:"calc", ftype:"calc",    w:160, align:"right", fmt:"money2", sum:true,
        formula:"= Dias_Vencidos * Interes_Diario",
        desc:"Interés total acumulado fuera del período de gracia." },
      { key:"pctPlanConsumido", titulo:"Porcentaje_Plan_Consumido",tipo:"calc", ftype:"calc",    w:196, align:"right",
        formula:"= IF(Dias_Gracia_Total, ROUND((Dias_en_Piso / Dias_Gracia_Total) * 100, 0))",
        desc:"Porcentaje del plan de gracia consumido. >100 = en intereses." },
      { key:"semaforo",         titulo:"Semaforo",                 tipo:"calc", ftype:"calc",    w:200, align:"left",
        formula:'= IF({Pct_Plan}>100,"⚫ En intereses", IF({Pct_Plan}>86,"🔴 Próximo a vencer", IF({Pct_Plan}>76,"🟠 Margen comprometido", IF({Pct_Plan}>61,"🟡 Rotación media","🟢 Margen saludable"))))',
        desc:"5 niveles según el porcentaje del plan consumido." },
      // ── Jerarquía de asignación ──────────────────────────────────────────────
      { key:"vendedorNombre",   titulo:"Vendedor",                 tipo:"calc", ftype:"calc",    w:160, align:"left",
        formula:"= LOOKUP(Vendedor_ID, Colaboradores[ID], Colaboradores[Nombre])",
        desc:"Nombre del vendedor asignado a esta unidad." },
      { key:"vendedorEmail",    titulo:"Email vendedor",           tipo:"calc", ftype:"calc",    w:200, align:"left",
        formula:"= LOOKUP(Vendedor_ID, Colaboradores[ID], Colaboradores[Email])",
        desc:"Correo del vendedor asignado." },
      { key:"gerenteNombre",    titulo:"Gerente",                  tipo:"calc", ftype:"calc",    w:160, align:"left",
        formula:"= LOOKUP(Vendedor_ID, Colaboradores[ID], Colaboradores[Gerente])",
        desc:"Gerente que supervisa al vendedor asignado." },
      { key:"gerenteEmail",     titulo:"Email gerente",            tipo:"calc", ftype:"calc",    w:200, align:"left",
        formula:"= LOOKUP(Vendedor_ID, Colaboradores[ID], Colaboradores[Email_Gerente])",
        desc:"Correo del gerente del vendedor." },
      { key:"directorNombre",   titulo:"Director",                 tipo:"calc", ftype:"calc",    w:160, align:"left",
        formula:"= LOOKUP(Vendedor_ID, Colaboradores[ID], Colaboradores[Director])",
        desc:"Director de la agencia para esta unidad." },
      { key:"directorEmail",    titulo:"Email director",           tipo:"calc", ftype:"calc",    w:200, align:"left",
        formula:"= LOOKUP(Vendedor_ID, Colaboradores[ID], Colaboradores[Email_Director])",
        desc:"Correo del director." },
    ];
  }

  // ── Función pública: genera datos completos para un tenant ────────────────
  function generarDatos(cfg) {
    const {
      seed        = 20260529,
      financieras = [
        { nombre:"NR Finance",       tasa:0.14, plazo:120 },
        { nombre:"BBVA Crédito Auto",tasa:0.14, plazo:120 },
        { nombre:"Banorte Plan Piso",tasa:0.15, plazo:90  },
        { nombre:"GM Financial",     tasa:0.14, plazo:150 },
        { nombre:"Cygnus Finance",   tasa:0.16, plazo:90  },
        { nombre:"Auto Capital",     tasa:0.15, plazo:120 },
      ],
      perfilesDias = [
        18,24,9,31,27,14,22,38,12,44,35,29,41,16,33,
        58,64,71,55,67,61,74,
        96,88,102,91,84,99,108,86,94,112,89,97,105,83,118,
        132,121,145,
      ],
      idPrefix  = "V",
      idBase    = 1001,
      invBase   = 7600,
      usuarios  = [],
    } = cfg || {};

    const HOY     = new Date();
    const MS_DIA  = 86400000;
    const rnd     = mulberry32(seed);
    const pick    = (arr) => arr[Math.floor(rnd() * arr.length)];
    const between = (a,b) => a + rnd()*(b-a);
    const intBetween = (a,b) => Math.floor(between(a, b+1));

    function vinGen(marca) {
      let v = "3" + marca.slice(0,1).toUpperCase() + "W";
      for (let i = 0; i < 14; i++) v += VIN_CHARS[Math.floor(rnd() * VIN_CHARS.length)];
      return v;
    }

    function computar(v) {
      // Fórmulas reales del sistema
      const diasEnPiso          = Math.round((HOY - v.fechaFactura) / MS_DIA) - 1;
      const diasGraciaTotal     = v.diasGraciaBase + v.diasGraciaExtra;
      const diasLibresRestantes = diasGraciaTotal - diasEnPiso;
      const diasVencidos        = diasLibresRestantes < 0 ? Math.abs(diasLibresRestantes) : 0;
      const interesDiario       = Math.round((v.montoFinanciado * v.pctInteres / 365) * 100) / 100;
      const interesAcum         = Math.round(diasVencidos * interesDiario * 100) / 100;
      const pctPlanConsumido    = diasGraciaTotal > 0 ? Math.round((diasEnPiso / diasGraciaTotal) * 100) : 0;

      let semaforo;
      if      (pctPlanConsumido > 100) semaforo = "intereses";
      else if (pctPlanConsumido > 86)  semaforo = "vencer";
      else if (pctPlanConsumido > 76)  semaforo = "comprometido";
      else if (pctPlanConsumido > 61)  semaforo = "rotacion";
      else                             semaforo = "saludable";

      return {
        ...v,
        diasEnPiso, diasGraciaTotal, diasLibresRestantes,
        diasVencidos, interesDiario, interesAcum, pctPlanConsumido, semaforo,
        fechaFacturaTxt: fmtFecha(v.fechaFactura),
        fechaLlegadaTxt: fmtFecha(v.fechaLlegada),
      };
    }

    const VEHICULOS = [];
    for (let i = 0; i < perfilesDias.length; i++) {
      const cat  = CATALOGO[i % CATALOGO.length];
      const fin  = financieras[i % financieras.length];
      const dias = perfilesDias[i] + intBetween(-2, 2);
      const fechaLlegada = new Date(HOY.getTime() - dias * MS_DIA);
      const fechaFactura = new Date(fechaLlegada.getTime() - intBetween(2,16) * MS_DIA);
      const monto = Math.round(between(cat[2][0], cat[2][1]) / 1000) * 1000 - intBetween(0,999) * 0.1;
      const anio  = pick([2025,2026,2026,2026,2024,2023]);
      const estatus = anio >= 2025 ? "NUEVOS" : anio === 2024 ? "DEMO" : "SEMINUEVOS";
      VEHICULOS.push({
        id:  idPrefix + String(idBase + i),
        vin: vinGen(cat[0]),
        estatus,
        inv: invBase + i*9 + intBetween(0,5),
        descripcion: (estatus === "NUEVOS" ? "NUEVO " : "") + cat[1].toUpperCase(),
        marca: cat[0], modelo: cat[1], anio,
        tipo: pick(TIPOS),
        colorExterior: pick(COLOR_EXT),
        colorInterior: pick(COLOR_INT),
        fechaFactura, fechaLlegada,
        montoFinanciado: Math.round(monto * 100) / 100,
        diasGraciaBase: 30,
        diasGraciaExtra: rnd() < 0.5 ? 15 : 0,
        pctInteres: fin.tasa,
        financiera: fin.nombre,
        plazoDias: fin.plazo,
        observaciones: pick(OBSERVACIONES),
      });
    }

    // ── Enriquecer usuarios con campos relacionales ───────────────────────────
    const usuariosEnriquecidos = usuarios.map(u => {
      const superior  = usuarios.find(s => s.id === u.reportaA) || null;
      const gerente   = u.rol === "vendedor"  ? superior
                      : u.rol === "gerente"   ? u
                      : null;
      const director  = u.rol === "director"  ? u
                      : u.rol === "gerente"   ? (usuarios.find(s => s.id === u.reportaA) || null)
                      : u.rol === "vendedor"  ? (gerente ? (usuarios.find(s => s.id === gerente.reportaA) || null) : null)
                      : null;
      return {
        ...u,
        reportaNombre:  superior ? superior.nombre : "—",
        reportaEmail:   superior ? superior.email  : "—",
        gerenteName:    gerente  ? gerente.nombre  : "—",
        gerenteEmail:   gerente  ? gerente.email   : "—",
        directorName:   director ? director.nombre : "—",
        directorEmail:  director ? director.email  : "—",
      };
    });

    // ── Helper: enriquecer fila con datos de jerarquía según vendedorId ─────────
    function enrichRowVendedor(row, uList) {
      const vendedor = uList.find(u => u.id === row.vendedorId) || null;
      const gerente  = vendedor ? (uList.find(u => u.id === vendedor.reportaA) || null) : null;
      const director = gerente  ? (uList.find(u => u.id === gerente.reportaA)  || null) : null;
      row.vendedorNombre  = vendedor ? vendedor.nombre : "";
      row.vendedorEmail   = vendedor ? vendedor.email  : "";
      row.gerenteId       = gerente  ? gerente.id      : "";
      row.gerenteNombre   = gerente  ? gerente.nombre  : "";
      row.gerenteEmail    = gerente  ? gerente.email   : "";
      row.directorNombre  = director ? director.nombre : "";
      row.directorEmail   = director ? director.email  : "";
      return row;
    }

    // Asignar vendedores a ~60% de las unidades (determinista con PRNG)
    const vendedores = usuarios.filter(u => u.rol === "vendedor");
    const ROWS = VEHICULOS.map(v => {
      const row = computar(v);
      if (vendedores.length && rnd() < 0.62) {
        row.vendedorId = vendedores[Math.floor(rnd() * vendedores.length)].id;
      } else {
        row.vendedorId = null;
      }
      return enrichRowVendedor(row, usuariosEnriquecidos);
    });
    const COLS = buildCols();
    const sumR = (arr, f) => arr.reduce((a, x) => a + f(x), 0);

    const KPIS = {
      total:            ROWS.length,
      saludable:        ROWS.filter(r => r.semaforo === "saludable").length,
      rotacion:         ROWS.filter(r => r.semaforo === "rotacion").length,
      comprometido:     ROWS.filter(r => r.semaforo === "comprometido").length,
      vencer:           ROWS.filter(r => r.semaforo === "vencer").length,
      intereses:        ROWS.filter(r => r.semaforo === "intereses").length,
      enIntereses:      ROWS.filter(r => r.diasVencidos > 0).length,
      interesAcumulado: sumR(ROWS, r => r.interesAcum),
      diasPromedio:     Math.round(sumR(ROWS, r => r.diasEnPiso) / ROWS.length),
      montoTotal:       sumR(ROWS, r => r.montoFinanciado),
    };

    // Pivote semáforo × financiera (5 niveles)
    const fins   = financieras.map(f => f.nombre);
    const matriz = {};
    fins.forEach(fn => {
      matriz[fn] = { saludable:0, rotacion:0, comprometido:0, vencer:0, intereses:0, total:0, interes:0 };
      ROWS.filter(r => r.financiera === fn).forEach(r => {
        matriz[fn][r.semaforo]++;
        matriz[fn].total++;
        matriz[fn].interes += r.interesAcum;
      });
    });
    const PIVOTE = { fins, matriz };

    // Tabla Financieras derivada
    const finRows = financieras.map((f, i) => {
      const m     = PIVOTE.matriz[f.nombre] || { verde:0, amarillo:0, rojo:0, total:0, interes:0 };
      const monto = sumR(ROWS.filter(r => r.financiera === f.nombre), r => r.montoFinanciado);
      return { id:"F"+(i+1), financiera:f.nombre, tasaAnual:f.tasa, plazoDias:f.plazo,
               unidades:m.total,
               saludable:m.saludable, rotacion:m.rotacion, comprometido:m.comprometido,
               vencer:m.vencer, intereses:m.intereses,
               montoFinanciado:monto, interesAcum:m.interes,
               saludPct: m.total ? m.saludable / m.total : 0 };
    });
    const finCols = [
      { key:"financiera",    titulo:"Financiera",       tipo:"dato",ftype:"text",  w:170,align:"left" },
      { key:"tasaAnual",     titulo:"Tasa anual",       tipo:"dato",ftype:"pct",   w:104,align:"right",fmt:"pct2" },
      { key:"plazoDias",     titulo:"Plazo (d)",        tipo:"dato",ftype:"num",   w:92, align:"right" },
      { key:"unidades",      titulo:"Unidades",          tipo:"calc",ftype:"calc", w:100,align:"right",sum:true,
        formula:'= CONTAR.SI(Inventario[Financiera]; [@Financiera])', desc:"Unidades de esta financiera." },
      { key:"saludable",    titulo:"🟢 Saludable",      tipo:"calc",ftype:"calc", w:110,align:"right",sum:true,
        formula:'= CONTAR.SI.CONJUNTO(... Semaforo; "saludable")', desc:"Margen saludable." },
      { key:"rotacion",     titulo:"🟡 Rotación",       tipo:"calc",ftype:"calc", w:100,align:"right",sum:true,
        formula:'= CONTAR.SI.CONJUNTO(... Semaforo; "rotacion")', desc:"Rotación media." },
      { key:"comprometido", titulo:"🟠 Comprometido",   tipo:"calc",ftype:"calc", w:120,align:"right",sum:true,
        formula:'= CONTAR.SI.CONJUNTO(... Semaforo; "comprometido")', desc:"Margen comprometido." },
      { key:"vencer",       titulo:"🔴 Próx. vencer",   tipo:"calc",ftype:"calc", w:110,align:"right",sum:true,
        formula:'= CONTAR.SI.CONJUNTO(... Semaforo; "vencer")', desc:"Próximo a vencer." },
      { key:"intereses",    titulo:"⚫ En intereses",   tipo:"calc",ftype:"calc", w:110,align:"right",sum:true,
        formula:'= CONTAR.SI.CONJUNTO(... Semaforo; "intereses")', desc:"Unidades en intereses." },
      { key:"montoFinanciado",titulo:"Monto financiado",tipo:"calc",ftype:"calc",w:152,align:"right",fmt:"money",sum:true,
        formula:'= SUMAR.SI(Inventario[Financiera]; [@Financiera]; Inventario[Monto_Financiado])', desc:"Monto total de la financiera." },
      { key:"interesAcum",   titulo:"Interés acum.",    tipo:"calc",ftype:"calc",  w:132,align:"right",fmt:"money",sum:true,
        formula:'= SUMAR.SI(Inventario[Financiera]; [@Financiera]; Inventario[Interes_Acumulado])', desc:"Interés total acumulado." },
      { key:"saludPct",      titulo:"Salud %",          tipo:"calc",ftype:"calc",  w:96, align:"right",fmt:"pct",
        formula:'= [@Verde] / [@Unidades]', desc:"Proporción de unidades en verde." },
    ];

    const colabCols = [
      { key:"nombre",        titulo:"Nombre",          tipo:"dato", ftype:"text",   w:180, align:"left" },
      { key:"email",         titulo:"Email",            tipo:"dato", ftype:"text",   w:210, align:"left" },
      { key:"tel",           titulo:"Teléfono",         tipo:"dato", ftype:"text",   w:130, align:"left" },
      { key:"rol",           titulo:"Rol",              tipo:"dato", ftype:"select", w:100, align:"left" },
      { key:"reportaNombre", titulo:"Reporta a",        tipo:"calc", ftype:"calc",   w:170, align:"left",
        formula:"= LOOKUP(Reporta_A, Colaboradores[ID], Colaboradores[Nombre])",
        desc:"Nombre del superior directo." },
      { key:"reportaEmail",  titulo:"Email superior",   tipo:"calc", ftype:"calc",   w:210, align:"left",
        formula:"= LOOKUP(Reporta_A, Colaboradores[ID], Colaboradores[Email])",
        desc:"Correo del superior directo." },
      { key:"gerenteName",   titulo:"Gerente",          tipo:"calc", ftype:"calc",   w:170, align:"left",
        formula:"= IF(Rol='vendedor', LOOKUP(Reporta_A,...), IF(Rol='gerente', Nombre, '—'))",
        desc:"Gerente que supervisa este colaborador." },
      { key:"gerenteEmail",  titulo:"Email gerente",    tipo:"calc", ftype:"calc",   w:210, align:"left",
        formula:"= LOOKUP(Gerente_ID, Colaboradores[ID], Colaboradores[Email])",
        desc:"Correo del gerente." },
      { key:"directorName",  titulo:"Director",         tipo:"calc", ftype:"calc",   w:170, align:"left",
        formula:"= LOOKUP(Director_ID, Colaboradores[ID], Colaboradores[Nombre])",
        desc:"Director de la agencia para este colaborador." },
      { key:"directorEmail", titulo:"Email director",   tipo:"calc", ftype:"calc",   w:210, align:"left",
        formula:"= LOOKUP(Director_ID, Colaboradores[ID], Colaboradores[Email])",
        desc:"Correo del director." },
      { key:"fechaIngreso",  titulo:"Fecha ingreso",    tipo:"dato", ftype:"date",   w:120, align:"left" },
    ];

    const TABLAS = [
      { id:"inventario",  nombre:"Inventario",          sub: ROWS.length+" registros", cols:COLS,    rows:ROWS,    fichas:true  },
      { id:"financieras", nombre:"Financieras",         sub: financieras.length+" registros", cols:finCols, rows:finRows, fichas:false },
      { id:"colaboradores",nombre:"Colaboradores",      cols:colabCols, rows:usuariosEnriquecidos, fichas:false },
      { id:"roles",       nombre:"Roles de Colaboradores",cols:[],rows:[],fichas:false },
      { id:"clientes",    nombre:"Clientes",            cols:[],rows:[],fichas:false },
      { id:"proceso",     nombre:"Proceso de Venta",    cols:[],rows:[],fichas:false },
      { id:"prueba",      nombre:"Prueba de Manejo",    cols:[],rows:[],fichas:false },
      { id:"oportunidades",nombre:"Oportunidades",      cols:[],rows:[],fichas:false },
      { id:"tareas",      nombre:"Tareas",              cols:[],rows:[],fichas:false },
    ];

    return { HOY, ROWS, COLS, KPIS, FINANCIERAS: financieras, PIVOTE, TABLAS, USUARIOS: usuariosEnriquecidos, enrichRowVendedor, fmtFecha };
  }

  // Expone la función para uso en tenants.js
  window.generarDatos = generarDatos;

  // Datos por defecto (se sobreescribirán al hacer login)
  window.AUTOMIND = generarDatos({});
})();
