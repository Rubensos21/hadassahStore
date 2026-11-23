# Whatshome / Crown Baccara — Tienda Digital Interactiva (Minimalismo Cálido Editorial)

## 🎯 Objetivo del Proyecto
Desarrollar una experiencia web e-commerce interactiva, moderna y altamente visual para la venta de productos **Whatshome / Crown Baccara**, tomando como fuente de datos e inspiración el catálogo PDF adjunto en el proyecto.

El diseño debe basarse en el estilo **Minimalismo Cálido Editorial** (inspirado en marcas D2C de menaje y cocina como *Fable Home*, *Our Place*, *Caraway*, *Material Kitchen* y *Fellow*), optimizado para conversión rápida vía **WhatsApp** desde dispositivos móviles y escritorio.

---

## 🛠️ Stack Tecnológico y Librerías a Instalar
El proyecto ya está inicializado con **Vite + React + TypeScript**. Antes de construir los componentes, instala y configura las siguientes dependencias:

```bash
npm install gsap @gsap/react lucide-react zustand clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

*(Nota: Si el proyecto ya utiliza Tailwind CSS v4 con `@tailwindcss/vite`, mantén la configuración nativa de v4 y adapta los tokens de color en `src/index.css`).*

---

## 📄 Paso 1: Extracción Automática del Catálogo PDF (Datos e Imágenes)
En D:\VisualStudioCode\hadassahStore\docs se encuentra el archivo PDF del catálogo de Whatshome. Ejecuta el siguiente flujo antes de construir la UI:

1. **Inspeccionar el PDF con Python:** Crea un script temporal `scripts/extract_catalog.py` usando `PyMuPDF` (`pip install pymupdf` si no está disponible) que:
   - Recorra todas las páginas del catálogo PDF.
   - Extraiga los textos identificando: **Categoría** (según la pestaña de sección), **Nombre del producto / Colección**, **Código de modelo** (patrón `mod. XXXXX`), **Precio** (`$XXX`), **Cantidad de piezas**, **Medidas/Capacidad** y **Atributos** (ej. *Libre de BPA*, *Apto inducción*, *Filo de oro real*, *Acero inoxidable*).
   - Extraiga las imágenes incrustadas con resolución mínima de `220x220 px` (descartando iconos diminutos o máscaras de recorte en escala de grises de 1 canal) y las guarde organizadas por página en `public/images/catalog/page_{num}_img_{idx}.png`.
2. **Generar la base de datos tipada:** Crea `src/data/products.ts` con la interfaz `Product` y exporta el arreglo completo de productos extraídos, vinculando cada producto con las imágenes extraídas de su misma página del PDF.
3. **Componente de imagen resiliente (`SmartProductImage.tsx`):** Crea un componente wrapper para `<img>` que, en caso de que una imagen no exista o esté en proceso de mapeo manual, muestre un contenedor editorial estilizado con el color de la categoría, un ícono minimalista de `lucide-react` y el código `mod.` del producto (nunca mostrar íconos de imagen rota del navegador).

---

## 🎨 Paso 2: Sistema de Diseño — "Minimalismo Cálido Editorial"

### 1. Paleta de Colores (Design Tokens)
Configura estos colores en Tailwind (`tailwind.config.js` o `@theme` en CSS):

- **Superficies Base:**
  - `ivory-bg`: `#FAF8F5` (Fondo principal de la aplicación, cálido y luminoso)
  - `sand-surface`: `#F2ECE4` (Secciones destacadas, bloques editoriales y filtros)
  - `card-white`: `#FFFFFF` (Tarjetas de producto con borde `#EAE4DC`)
  - `obsidian-pro`: `#1C1917` (Fondo de contraste oscuro exclusivo para la sección de *Baterías y Cocina Pro*)
- **Tipografía e Ink:**
  - `ink-primary`: `#231F20` (Texto principal carbón cálido)
  - `ink-muted`: `#6E655F` (Descripciones secundarias, medidas y notas)
  - `brand-crimson`: `#C8102E` (Acento institucional Whatshome para botones primarios y badges *"Nuevo"*)
- **Colores Oficiales de Pestañas del Catálogo (Navbar):**
  - `tab-home`: `#E3342F` (Rojo Whatshome - Pestaña Inicio `wh`)
  - `tab-mesa`: `#A62626` (Rojo vino / Terracota - Categoría *MESA*)
  - `tab-cafe`: `#C59B76` (Arena tostada / Latte - Categoría *CAFÉ Y TÉ*)
  - `tab-kids`: `#BFA8CE` (Lavanda pastel - Categoría *KIDS*)
  - `tab-cocina`: `#DFB458` (Ocre / Mostaza cálida - Categoría *COCINA*)
  - `tab-baterias`: `#5D859B` (Azul pizarra - Categoría *BATERÍAS*)
  - `tab-hogar`: `#558E8B` (Verde salvia / Teal - Categoría *HOGAR*)

### 2. Tipografía (Google Fonts en `index.html`)
Importa y configura tres familias tipográficas:
- **Display / Editorial (`font-serif`):** `Fraunces` o `Playfair Display` (Pesos 500, 600, Italic) — Para títulos de colecciones, héroes editoriales y nombres de líneas (*Soul*, *Clarisse*, *BoHostone*, *Atlixco*).
- **UI & Cuerpo (`font-sans`):** `Plus Jakarta Sans` (Pesos 400, 500, 600, 700) — Para navegación, descripciones, filtros y precios.
- **Códigos SKU (`font-mono`):** `JetBrains Mono` (Peso 500) — Para etiquetas `mod. 12345`.

---

## 🧭 Paso 3: Navbar Idéntico a las Pestañas del Catálogo PDF (`CatalogNavbar.tsx`)

Diseña una barra de navegación superior (`sticky top-0 z-50`) que replique fielmente el **sistema de pestañas separadoras colgantes** del catálogo impreso/PDF de Whatshome:

1. **Estructura Visual de las Pestañas:**
   - Las pestañas nacen pegadas al borde superior de la pantalla (`top-0`), alineadas horizontalmente sin separación excesiva entre ellas, con **esquinas inferiores redondeadas (`rounded-b-2xl`)** y sombra suave (`shadow-sm`).
   - Texto en mayúsculas (`uppercase`), tipografía sans-serif condensada/limpia, color blanco (`#FFFFFF`), alineado en la parte inferior de cada pestaña.
   - **Las 7 pestañas obligatorias en este orden exacto:**
     1. **`wh` (Inicio / Todo el catálogo):** Fondo `#E3342F`, con el monograma tipográfico blanco `"wh"` (la `w` ligeramente más arriba que la `h`, estilo editorial serif).
     2. **`MESA`:** Fondo `#A62626`
     3. **`CAFÉ Y TÉ`:** Fondo `#C59B76`
     4. **`KIDS`:** Fondo `#BFA8CE`
     5. **`COCINA`:** Fondo `#DFB458`
     6. **`BATERÍAS`:** Fondo `#5D859B`
     7. **`HOGAR`:** Fondo `#558E8B`
2. **Interactividad Física con GSAP:**
   - **Estado Activo:** La pestaña seleccionada sobresale físicamente hacia abajo (`height` / `padding-bottom` mayor, aprox. `+10px` a `+14px` más larga que las inactivas, igual que un separador de carpeta activo).
   - **Micro-interacción Hover:** Al pasar el cursor sobre una pestaña inactiva, usa `gsap.to()` con easing elástico suave (`power2.out`) para que la pestaña se deslice ligeramente hacia abajo (`y: 5`) invitando al clic.
   - **Barra utilitaria integrada:** A la derecha de las pestañas (o en una sub-barra minimalista translúcida con `backdrop-blur-md bg-[#FAF8F5]/90`), coloca:
     - Buscador instantáneo por nombre, colección o `mod.` (`Search` icon).
     - Botón de **Mi Lista / Pedido WhatsApp** con contador animado de artículos seleccionados (`ShoppingBag` icon).
   - **Responsive Mobile:** En pantallas `< 768px`, las 7 pestañas de colores deben mantenerse visibles como un carrusel horizontal táctil (`overflow-x-auto no-scrollbar snap-x`) pegado al borde superior para conservar la identidad icónica del catálogo en celular.

---

## 🧩 Paso 4: Secciones y Componentes Interactivos Clave

### 1. Hero Editorial en Bento Grid (`EditorialBentoHero.tsx`)
Al estar en la vista `Inicio (wh)`, muestra una cuadrícula asimétrica tipo **Bento Grid** con animaciones de entrada escalonadas (`GSAP ScrollTrigger` / `stagger`):
- **Bloque Principal (2x2):** Colección destacada de temporada (ej. *"La calidez de vestir tu mesa"*), fotografía *lifestyle*, tipografía serif grande y botón CTA hacia *Mesa*.
- **Bloque Secundario 1 (1x1):** Acceso directo a *Café y Té* (prensas francesas, tazas doble pared, termos *Mave*).
- **Bloque Secundario 2 (1x1):** Acceso directo a *Baterías & Cocina Pro* en contraste oscuro (`#1C1917`).
- **Franja Inferior Horizontal:** Indicadores de confianza (*Envíos a todo México*, *Atención personalizada por WhatsApp*, *Catálogo Oficial Crown Baccara*).

### 2. Sección Interactiva "Compra el Look" (`ShopTheLook.tsx`)
- Una escena fotográfica de una mesa completamente montada (vajilla, cubiertos dorados, cristalería y accesorios).
- Incluye **4 a 5 puntos interactivos pulsantes (Hotspots)** posicionados con porcentajes (`top`, `left`).
- Al hacer clic o hover en un punto, se despliega una tarjeta flotante con la foto mini, nombre, código `mod.`, precio y un botón **"Agregar al pedido"** de 1 clic.

### 3. Barra de Filtros Inteligentes por Intención (`IntentFilterBar.tsx`)
Debajo del Hero o al seleccionar una categoría, ofrece píldoras de filtrado rápido combinables con búsqueda y ordenamiento por precio:
- Filtros rápidos: `Todos`, `Regalos < $400`, `Sets 12 a 20 pzas`, `Apto Inducción`, `Libre de BPA`, `Acero Inoxidable`, `Filo de Oro`.

### 4. Tarjeta de Producto Interactiva (`ProductCard.tsx`) & Vista Rápida (`QuickViewModal.tsx`)
Inspirada en *Material Kitchen* y *Fable Home*:
- **Crossfade en Hover:** Si el producto tiene 2 imágenes (producto aislado + foto en uso), realiza una transición suave de opacidad al pasar el cursor.
- **Badges Semánticos:** Píldoras sutiles en la esquina superior izquierda (ej. `Set 16 pzas`, `1.5 L`, `Libre de BPA`).
- **Acción Rápida (Quick Add):** Botón flotante `+ Agregar` en la esquina inferior de la imagen que añade el producto al carrito con retroalimentación visual inmediata sin recargar ni abrir modales.
- **Modal de Detalle (`QuickViewModal.tsx`):** Al hacer clic en el título o imagen, abre un modal editorial limpio con:
  - Desglose visual de piezas incluidas (si es vajilla o batería).
  - Íconos de compatibilidad de estufa (*Gas, Eléctrica, Vitrocerámica, Inducción*) si pertenece a *Baterías*.
  - Pirámide de notas olfativas (*Salida, Corazón, Fondo*) si es una vela de la categoría *Hogar*.
  - Selector de cantidad y botón de agregar al pedido.

### 5. Carrito Lateral con Envío Directo a WhatsApp (`WhatsAppDrawer.tsx`)
El objetivo comercial principal de la tienda es cerrar ventas por WhatsApp sin fricción:
- **Estado persistente (`useCartStore.ts` con Zustand + `localStorage`):** Guarda productos, cantidades y notas.
- **Cálculo automático:** Muestra subtotal estimado y número total de artículos.
- **Datos opcionales del cliente:** Campos ligeros para *Nombre* y *Ciudad / Código Postal* (para cotizar envío).
- **Generador de Mensaje WhatsApp:** Al pulsar **"Enviar pedido por WhatsApp"**, construye una URL `https://wa.me/521XXXXXXXXXX?text=...` (usando una constante configurable `WHATSAPP_PHONE` en `src/config/store.ts`) con un mensaje estructurado y limpio:
  ```text
  Hola! Me gustaría hacer el siguiente pedido del catálogo Whatshome / Crown Baccara:

  • [2x] Vajilla Soul 16 pzas (mod. 45892) — $1,499 c/u
  • [1x] Prensa Francesa Almond-F (mod. 33104) — $429 c/u

  Total estimado: $3,427 MXN
  Nombre: [Nombre del cliente]
  Ciudad: [Ciudad]
  ```

---

## 📁 Estructura de Carpetas Recomendada

```text
src/
├── config/
│   └── store.ts                # Número de WhatsApp, moneda, redes sociales y metadatos
├── data/
│   └── products.ts             # Catálogo tipado extraído del PDF + categorías y colecciones
├── store/
│   └── useCartStore.ts         # Estado global del carrito (Zustand + persist)
├── components/
│   ├── layout/
│   │   ├── CatalogNavbar.tsx   # Navbar con las 7 pestañas de colores del catálogo + GSAP
│   │   └── Footer.tsx          # Pie de página editorial cálido
│   ├── home/
│   │   ├── EditorialBentoHero.tsx
│   │   └── ShopTheLook.tsx     # Escena interactiva con hotspots de mesa montada
│   ├── catalog/
│   │   ├── IntentFilterBar.tsx # Filtros por categoría, presupuesto y atributos
│   │   ├── ProductCard.tsx     # Tarjeta con crossfade, badges y Quick Add
│   │   ├── QuickViewModal.tsx  # Vista detallada con desglose de piezas/notas/estufas
│   │   └── SmartProductImage.tsx # Manejo de imágenes extraídas + fallback elegante
│   └── cart/
│       └── WhatsAppDrawer.tsx  # Cajón deslizable con resumen y link directo a WhatsApp
├── App.tsx
├── main.tsx
└── index.css                   # Tokens de color, fuentes y utilidades custom
```

---

## ✅ Criterios de Aceptación y Calidad
1. **Fidelidad Visual:** El Navbar debe reproducir con exactitud la estética, proporciones, bordes inferiores redondeados y paleta de colores de las pestañas del catálogo PDF (`wh`, `MESA`, `CAFÉ Y TÉ`, `KIDS`, `COCINA`, `BATERÍAS`, `HOGAR`), animándose fluidamente con GSAP al cambiar de pestaña.
2. **Contraste Estratégico:** Las secciones de *Mesa, Café y Té, Kids, Cocina y Hogar* deben respirar sobre el lienzo claro `#FAF8F5`, mientras que la sección *Baterías* debe activar una atmósfera editorial oscura (`#1C1917`) al estilo *Fellow / Our Place*.
3. **Cero Errores de Compilación:** Todo el código debe estar estrictamente tipado en TypeScript (`npm run build` debe pasar sin errores ni warnings críticos).
4. **Flujo Móvil Impecable:** Todas las interacciones (pestañas superiores, filtros, vista rápida y drawer de WhatsApp) deben funcionar con total fluidez en pantallas de `375px` de ancho.