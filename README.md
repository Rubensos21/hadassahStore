# Hadassah Store

Catálogo digital editorial de Whatshome / Crown Baccara para descubrir piezas
de mesa, cocina y hogar, crear una selección de productos y enviarla
directamente por WhatsApp.

## Qué ofrece la web

- **Inicio editorial:** hero en formato bento, accesos a Café y Té y Cocina
  Pro, indicadores de confianza y la sección interactiva **Compra el look**.
- **Siete secciones del catálogo:** Inicio, Mesa, Café y Té, Kids, Cocina,
  Baterías y Hogar. La navegación usa pestañas visuales inspiradas en el
  catálogo impreso y conserva el desplazamiento horizontal en pantallas
  pequeñas.
- **Búsqueda instantánea:** busca por nombre, colección, descripción,
  categoría, atributos o código `mod.`. El atajo `Ctrl + K` en Windows/Linux
  y `Cmd + K` en macOS enfoca el buscador.
- **Filtros por intención:** Todos, Regalos menores de $400, Sets de 12 a 20
  piezas, Apto inducción, Libre de BPA, Acero inoxidable y Filo de oro.
- **Ordenamiento:** productos destacados, precio menor a mayor y precio mayor
  a menor. Los precios se muestran en MXN y pueden estar sujetos a
  disponibilidad.
- **Tarjetas de producto:** fotografía, atributos, medidas, piezas incluidas,
  código de modelo, precio, fallback visual para imágenes no disponibles y
  acción rápida para agregar al pedido.
- **Vista rápida:** abre el detalle editorial de un producto sin abandonar el
  catálogo.
- **Compra el look:** escena de mesa montada con hotspots para consultar y
  agregar productos relacionados.
- **Pedido persistente:** el carrito conserva productos, cantidades, notas,
  nombre y ciudad/código postal en `localStorage`.
- **Cierre por WhatsApp:** el cajón “Mi pedido” calcula un subtotal estimado y
  genera un mensaje estructurado con productos, modelos, cantidades, notas y
  datos del cliente. El envío se cotiza de forma personalizada.
- **Responsive y accesible:** diseño adaptado a móvil, controles con estados
  de foco, etiquetas ARIA y cierre del cajón con `Escape`.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4 mediante `@tailwindcss/vite`
- Zustand 5 con persistencia en `localStorage`
- GSAP y `@gsap/react` para las interacciones de navegación
- `lucide-react` para iconografía
- ESLint y TypeScript para validación

## Requisitos

- Node.js compatible con el proyecto
- pnpm
- Python 3 para volver a extraer el catálogo

## Desarrollo local

```bash
pnpm install
pnpm dev
```

Vite mostrará la dirección local en la terminal. Para validar el código y
generar la versión de producción:

```bash
pnpm run lint
pnpm run build
pnpm run preview
```

## Identidad visual

La interfaz usa el enfoque **Minimalismo Cálido Editorial**: fondo marfil,
superficies arena, tipografía display Fraunces, cuerpo en Plus Jakarta Sans y
códigos de producto en JetBrains Mono. Las pestañas de categoría emplean
colores diferenciados y la sección **Baterías** activa una atmósfera oscura
de cocina profesional.

Las variantes de marca están en
[`src/assets/brand/`](src/assets/brand/): isotipo, logotipo, imagotipo e
isologo. Los archivos originales compartidos se conservan en
[`docs/brand-source/`](docs/brand-source/).
