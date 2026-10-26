# 🏐 Zona de Ataque – Reserva de canchas de vóley

Sitio web para reservar las canchas de voleibol de **Zona de Ataque**
(Calle Piura 837, Punchana, Iquitos).

## Archivos

| Archivo      | Qué contiene                                         |
|--------------|------------------------------------------------------|
| `index.html` | Estructura de la página (secciones)                 |
| `styles.css` | Diseño, colores y versión para celular               |
| `app.js`     | Lógica de reservas. **Arriba está `CONFIG`**         |

## 1. Personaliza los datos (obligatorio)

Abre `app.js` y edita el objeto `CONFIG`:

- `whatsapp`: número del local con `51` adelante, ej. `51987654321`.
- `horaApertura`, `horaCierre`, `horaNoche`: horario y desde qué hora rige la tarifa nocturna.
- `canchas`: nombre y descripción de cada cancha (agrega o quita las que necesites).
- `precios`: tarifas en soles.

## 2. Cómo funciona la reserva

1. El cliente elige día, cancha y horas (las horas pasadas y las ya reservadas se bloquean).
2. Llena nombre y celular.
3. Al confirmar se abre WhatsApp con el mensaje de la reserva listo para enviar al local.
4. La reserva queda guardada en "Mis reservas" en su dispositivo y puede cancelarla.

> Nota: las reservas se guardan en el navegador de cada cliente. Para que **todos** vean
> las horas ocupadas en tiempo real hace falta una base de datos (por ejemplo Firebase o Supabase).
> Es la siguiente mejora recomendada.

## 3. Publicarlo en internet (gratis) con GitHub Pages

1. En GitHub entra al repositorio → **Settings** → **Pages**.
2. En *Source* elige **Deploy from a branch**, rama `main`, carpeta `/ (root)` → **Save**.
3. En 1–2 minutos estará en:
   `https://jhanslazo.github.io/zona-de-ataque/`

## 4. Ponerle un dominio propio (ej. `zonadeataque.com` o `zonadeataque.pe`)

1. Compra el dominio: `.pe` en [punto.pe](https://punto.pe) o `.com` en Namecheap, GoDaddy, Hostinger, etc.
2. Este repositorio ya tiene los archivos en la raíz, así que el dominio abrirá directo la página.
3. En este repositorio: **Settings → Pages → Custom domain** → escribe tu dominio → Save.
4. En el panel donde compraste el dominio crea estos registros DNS:
   - 4 registros **A** para `@` con: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - 1 registro **CNAME** para `www` apuntando a `jhanslazo.github.io`
5. Espera la propagación (minutos a 24 h) y activa **Enforce HTTPS**.
