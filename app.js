// ===================== CONFIGURACIÓN =====================
// Cambia estos datos por los reales del local.
const CONFIG = {
    // Número de WhatsApp del local con código de país (51 = Perú), sin "+" ni espacios.
    whatsapp: '51900000000',
    horaApertura: 8,   // 8:00 a. m.
    horaCierre: 22,    // 10:00 p. m.
    horaNoche: 18,     // desde esta hora se cobra tarifa nocturna
    diasVisibles: 14,  // cuántos días a futuro se pueden reservar
    canchas: [
        { id: 'c1', nombre: 'Cancha 1', descripcion: 'Cancha principal techada, piso de losa y malla reglamentaria.', icono: '🏐' },
        { id: 'c2', nombre: 'Cancha 2', descripcion: 'Ideal para entrenamientos, partidos amistosos y vóley mixto.', icono: '🔥' }
    ],
    precios: [
        { nombre: 'Tarifa día', monto: 30, detalle: '8:00 a. m. – 6:00 p. m.' },
        { nombre: 'Tarifa noche', monto: 40, detalle: '6:00 p. m. – 10:00 p. m. · con iluminación', destacado: true },
        { nombre: 'Campeonatos', monto: null, detalle: 'Precio especial por paquete de horas. Consúltanos.' }
    ]
};

// ===================== UTILIDADES =====================
const $ = (sel) => document.querySelector(sel);
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
const CLAVE = 'zda_reservas';

const fechaISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const formatoHora = (h) => {
    const sufijo = h < 12 ? 'a. m.' : 'p. m.';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:00 ${sufijo}`;
};
const formatoFecha = (iso) => {
    const [a, m, d] = iso.split('-').map(Number);
    const f = new Date(a, m - 1, d);
    return `${DIAS[f.getDay()]} ${d} ${MESES[m - 1]} ${a}`;
};
const precioHora = (h) => (h >= CONFIG.horaNoche ? CONFIG.precios[1].monto : CONFIG.precios[0].monto);
const nombreCancha = (id) => CONFIG.canchas.find((c) => c.id === id)?.nombre ?? id;

function leerReservas() {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { return []; }
}
function guardarReservas(lista) {
    try { localStorage.setItem(CLAVE, JSON.stringify(lista)); } catch { /* sin almacenamiento */ }
}

function avisar(texto) {
    const el = $('#aviso');
    el.textContent = texto;
    el.classList.add('visible');
    clearTimeout(avisar.t);
    avisar.t = setTimeout(() => el.classList.remove('visible'), 3500);
}

// ===================== ESTADO =====================
const estado = {
    fecha: fechaISO(new Date()),
    cancha: CONFIG.canchas[0].id,
    horas: []
};

// ===================== SECCIONES ESTÁTICAS =====================
function pintarCanchas() {
    $('#listaCanchas').innerHTML = CONFIG.canchas.map((c) => `
        <article class="tarjeta">
            <div class="tarjeta-img">${c.icono}</div>
            <div class="tarjeta-cuerpo">
                <h3>${c.nombre}</h3>
                <p>${c.descripcion}</p>
            </div>
        </article>`).join('');
    $('#datoCanchas').textContent = CONFIG.canchas.length;
    $('#datoHorario').textContent = `${CONFIG.horaApertura}–${CONFIG.horaCierre} h`;
    $('#textoHorario').textContent = `${formatoHora(CONFIG.horaApertura)} – ${formatoHora(CONFIG.horaCierre)}`;
}

function pintarPrecios() {
    $('#listaPrecios').innerHTML = CONFIG.precios.map((p) => `
        <div class="precio ${p.destacado ? 'destacado' : ''}">
            <h3>${p.nombre}</h3>
            <div class="monto">${p.monto === null ? 'Consultar' : `<small>S/</small> ${p.monto}`}</div>
            <p>${p.detalle}</p>
        </div>`).join('');
}

// ===================== RESERVA =====================
function pintarDias() {
    const hoy = new Date();
    let html = '';
    for (let i = 0; i < CONFIG.diasVisibles; i++) {
        const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
        const iso = fechaISO(d);
        html += `<button type="button" class="dia ${iso === estado.fecha ? 'activo' : ''}" data-fecha="${iso}">
                    <small>${i === 0 ? 'Hoy' : DIAS[d.getDay()]}</small>
                    <strong>${d.getDate()}</strong>
                    <small>${MESES[d.getMonth()]}</small>
                 </button>`;
    }
    $('#dias').innerHTML = html;
}

function pintarSelectorCancha() {
    $('#selectorCancha').innerHTML = CONFIG.canchas.map((c) =>
        `<button type="button" class="chip ${c.id === estado.cancha ? 'activo' : ''}" data-cancha="${c.id}">${c.nombre}</button>`
    ).join('');
}

function horasOcupadas() {
    return leerReservas()
        .filter((r) => r.fecha === estado.fecha && r.cancha === estado.cancha)
        .flatMap((r) => r.horas);
}

function pintarHoras() {
    const ocupadas = horasOcupadas();
    const ahora = new Date();
    const esHoy = estado.fecha === fechaISO(ahora);
    let html = '';
    for (let h = CONFIG.horaApertura; h < CONFIG.horaCierre; h++) {
        const pasada = esHoy && h <= ahora.getHours();
        const ocupada = ocupadas.includes(h);
        const elegida = estado.horas.includes(h);
        html += `<button type="button" class="hora ${elegida ? 'elegido' : ''}" data-hora="${h}" ${pasada || ocupada ? 'disabled' : ''}>
                    ${formatoHora(h)}<small>S/ ${precioHora(h)}</small>
                 </button>`;
    }
    $('#horas').innerHTML = html;
}

function pintarResumen() {
    if (estado.horas.length === 0) {
        $('#resumen').innerHTML = '<p>Aún no has elegido horas.</p>';
        return;
    }
    const horas = [...estado.horas].sort((a, b) => a - b);
    const total = horas.reduce((s, h) => s + precioHora(h), 0);
    $('#resumen').innerHTML = `
        <p><strong>${nombreCancha(estado.cancha)}</strong> · ${formatoFecha(estado.fecha)}</p>
        <p>${horas.map((h) => `${formatoHora(h)} – ${formatoHora(h + 1)}`).join('<br>')}</p>
        <p class="total">Total: S/ ${total}</p>`;
}

function refrescarReserva() {
    pintarDias();
    pintarSelectorCancha();
    pintarHoras();
    pintarResumen();
}

$('#dias').addEventListener('click', (e) => {
    const btn = e.target.closest('.dia');
    if (!btn) return;
    estado.fecha = btn.dataset.fecha;
    estado.horas = [];
    refrescarReserva();
});

$('#selectorCancha').addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    estado.cancha = btn.dataset.cancha;
    estado.horas = [];
    refrescarReserva();
});

$('#horas').addEventListener('click', (e) => {
    const btn = e.target.closest('.hora');
    if (!btn || btn.disabled) return;
    const h = Number(btn.dataset.hora);
    estado.horas = estado.horas.includes(h) ? estado.horas.filter((x) => x !== h) : [...estado.horas, h];
    pintarHoras();
    pintarResumen();
});

$('#formReserva').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = $('#nombre').value.trim();
    const celular = $('#celular').value.trim();
    const jugadores = $('#jugadores').value;
    const comentario = $('#comentario').value.trim();
    const error = $('#error');

    if (estado.horas.length === 0) { error.textContent = 'Elige al menos una hora.'; return; }
    if (nombre.length < 3) { error.textContent = 'Escribe tu nombre completo.'; return; }
    if (!/^9\d{8}$/.test(celular)) { error.textContent = 'Ingresa un celular válido de 9 dígitos que empiece con 9.'; return; }
    error.textContent = '';

    const horas = [...estado.horas].sort((a, b) => a - b);
    const total = horas.reduce((s, h) => s + precioHora(h), 0);
    const reserva = {
        id: Date.now().toString(36),
        fecha: estado.fecha,
        cancha: estado.cancha,
        horas, total, nombre, celular, jugadores, comentario
    };

    guardarReservas([...leerReservas(), reserva]);

    const mensaje = [
        '🏐 *Nueva reserva – Zona de Ataque*',
        `Código: ${reserva.id.toUpperCase()}`,
        `Nombre: ${nombre}`,
        `Celular: ${celular}`,
        `Cancha: ${nombreCancha(reserva.cancha)}`,
        `Fecha: ${formatoFecha(reserva.fecha)}`,
        `Horario: ${horas.map((h) => `${formatoHora(h)} – ${formatoHora(h + 1)}`).join(', ')}`,
        `Jugadores: ${jugadores}`,
        comentario ? `Comentario: ${comentario}` : '',
        `Total: S/ ${total}`
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensaje)}`, '_blank');

    estado.horas = [];
    e.target.reset();
    refrescarReserva();
    pintarMisReservas();
    avisar('¡Reserva registrada! Envía el mensaje de WhatsApp para confirmarla.');
});

// ===================== MIS RESERVAS =====================
function pintarMisReservas() {
    const hoy = fechaISO(new Date());
    const lista = leerReservas()
        .filter((r) => r.fecha >= hoy)
        .sort((a, b) => (a.fecha + a.horas[0]).localeCompare(b.fecha + b.horas[0]));

    if (lista.length === 0) {
        $('#misReservas').innerHTML = '<p class="vacio">No tienes reservas próximas. ¡Anímate a jugar! 🏐</p>';
        return;
    }
    $('#misReservas').innerHTML = lista.map((r) => `
        <div class="item-reserva">
            <div>
                <strong>${nombreCancha(r.cancha)} · ${formatoFecha(r.fecha)}</strong>
                <p>${formatoHora(r.horas[0])} – ${formatoHora(r.horas[r.horas.length - 1] + 1)} · S/ ${r.total} · Código ${r.id.toUpperCase()}</p>
            </div>
            <button class="btn-cancelar" data-id="${r.id}">Cancelar</button>
        </div>`).join('');
}

$('#misReservas').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-cancelar');
    if (!btn || !confirm('¿Seguro que deseas cancelar esta reserva?')) return;
    const r = leerReservas().find((x) => x.id === btn.dataset.id);
    guardarReservas(leerReservas().filter((x) => x.id !== btn.dataset.id));
    pintarMisReservas();
    pintarHoras();
    if (r) {
        const texto = `Hola, deseo *cancelar* mi reserva ${r.id.toUpperCase()} de la ${nombreCancha(r.cancha)} el ${formatoFecha(r.fecha)}.`;
        window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank');
    }
    avisar('Reserva cancelada.');
});

// ===================== MENÚ Y ARRANQUE =====================
$('#menuBtn').addEventListener('click', () => $('#menu').classList.toggle('abierto'));
$('#menu').addEventListener('click', (e) => { if (e.target.tagName === 'A') $('#menu').classList.remove('abierto'); });

$('#enlaceWhatsapp').href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Hola, quisiera información sobre las canchas de Zona de Ataque 🏐')}`;
$('#anio').textContent = new Date().getFullYear();

pintarCanchas();
pintarPrecios();
refrescarReserva();
pintarMisReservas();
