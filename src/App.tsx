import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUpRight, Search } from 'lucide-react'
import { CatalogNavbar, type CatalogSection } from './components/layout/CatalogNavbar'
import { EditorialBentoHero } from './components/home/EditorialBentoHero'
import { ShopTheLook } from './components/home/ShopTheLook'
import { IntentFilterBar, type IntentFilter, type PriceSort } from './components/catalog/IntentFilterBar'
import { ProductCard } from './components/catalog/ProductCard'
import { QuickViewModal } from './components/catalog/QuickViewModal'
import { WhatsAppDrawer } from './components/cart/WhatsAppDrawer'
import { Footer } from './components/layout/Footer'
import { categories, products, type Product } from './data/products'
import { useCartStore } from './store/useCartStore'

const emptyCopy: Record<CatalogSection, { eyebrow: string; title: string; copy: string }> = {
  Inicio: { eyebrow: 'OBJETOS PARA EL HOGAR', title: 'Encuentra tu próxima pieza favorita.', copy: 'Diseño pensado para reunirse, cocinar y compartir un poco más.' },
  Mesa: { eyebrow: 'MESA · HECHO PARA COMPARTIR', title: 'Todos los días merecen una mesa bonita.', copy: 'Vajillas, cristalería y detalles para invitar sin esperar una ocasión.' },
  'Café y Té': { eyebrow: 'CAFÉ Y TÉ · RITUALES LENTOS', title: 'Un momento solo para ti.', copy: 'Tazas, prensas y termos para acompañar tu manera favorita de hacer pausa.' },
  Kids: { eyebrow: 'KIDS · PEQUEÑOS GRANDES MOMENTOS', title: 'Detalles que crecen con ellos.', copy: 'Color y diversión para cada comida, juego y aventura.' },
  Cocina: { eyebrow: 'COCINA · UN GUSTO DE TODOS LOS DÍAS', title: 'Lo que hace rico el camino.', copy: 'Accesorios y herramientas para cocinar con más ganas.' },
  Baterías: { eyebrow: 'COCINA PRO · HERRAMIENTAS QUE INSPIRAN', title: 'El placer de hacerlo bien.', copy: 'Materiales de confianza, calor parejo y espacio para tus mejores recetas.' },
  Hogar: { eyebrow: 'HOGAR · OBJETOS QUE HACEN CASA', title: 'Un poco más de calma, en cada rincón.', copy: 'Pequeñas mejoras que se sienten en tu día a día.' },
}

function matchesIntent(product: Product, intent: IntentFilter) {
  const attrs = product.attributes.join(' ').toLocaleLowerCase('es-MX')
  const text = `${product.name} ${product.description ?? ''} ${attrs}`.toLocaleLowerCase('es-MX')
  switch (intent) {
    case 'Regalos < $400': return product.price !== null && product.price < 400
    case 'Sets 12 a 20 pzas': return product.pieces !== null && product.pieces >= 12 && product.pieces <= 20
    case 'Apto inducción': return text.includes('inducción') || text.includes('induccion')
    case 'Libre de BPA': return text.includes('bpa')
    case 'Acero inoxidable': return text.includes('acero inoxidable')
    case 'Filo de oro': return text.includes('filo de oro') || text.includes('oro real')
    default: return true
  }
}

function App() {
  const [activeCategory, setActiveCategory] = useState<CatalogSection>('Inicio')
  const [searchTerm, setSearchTerm] = useState('')
  const [intent, setIntent] = useState<IntentFilter>('Todos')
  const [sort, setSort] = useState<PriceSort>('featured')
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toast, setToast] = useState('')
  const cartItems = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const copy = emptyCopy[activeCategory]
  const isBattery = activeCategory === 'Baterías'

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('es-MX')
    const filtered = products.filter((product) => {
      const inCategory = activeCategory === 'Inicio' || product.category === activeCategory
      const searchable = `${product.name} ${product.model} mod. ${product.model} ${product.category} ${product.description ?? ''} ${product.attributes.join(' ')}`.toLocaleLowerCase('es-MX')
      return inCategory && (!query || searchable.includes(query)) && matchesIntent(product, intent)
    })
    if (sort === 'low-high') return [...filtered].sort((a, b) => (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY))
    if (sort === 'high-low') return [...filtered].sort((a, b) => (b.price ?? -1) - (a.price ?? -1))
    return filtered
  }, [activeCategory, intent, searchTerm, sort])

  const addToOrder = (product: Product, quantity = 1) => {
    addItem(product, quantity)
    setToast(`${product.name} · agregado a tu pedido`)
    window.setTimeout(() => setToast(''), 2300)
  }

  return (
    <div className={`storefront${isBattery ? ' battery-section' : ''}`}>
      <CatalogNavbar
        activeCategory={activeCategory}
        onChange={(category) => { setActiveCategory(category); setSearchTerm(''); setIntent('Todos'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onCartOpen={() => setDrawerOpen(true)}
        itemCount={itemCount}
      />

      <main>
        {activeCategory === 'Inicio' && <EditorialBentoHero products={products} onNavigate={setActiveCategory} />}
        {(activeCategory === 'Inicio' || activeCategory === 'Mesa') && <ShopTheLook products={products} onAdd={addToOrder} />}

        <section className="catalog-section section-wrap" id="catalogo">
          {activeCategory !== 'Inicio' && <div className="category-intro">
            <span className="eyebrow"><i /> {copy.eyebrow}</span>
            <h1>{copy.title}</h1>
            <p>{copy.copy}</p>
          </div>}
          {activeCategory === 'Inicio' && <div className="section-heading catalog-heading">
            <div><span className="eyebrow">PARA EL HOGAR</span><h2>Encuentra <em>tu pieza.</em></h2></div>
            <p>Una selección para lo que<br />viene y lo de todos los días.</p>
          </div>}

          <IntentFilterBar active={intent} onChange={setIntent} sort={sort} onSort={setSort} />
          <div className="catalog-meta"><span><strong>{filteredProducts.length}</strong> piezas para descubrir</span><span>Precios en MXN · sujetos a disponibilidad</span></div>
          {filteredProducts.length ? <div className="product-grid">
            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} onAdd={addToOrder} />)}
          </div> : <div className="no-results"><span className="no-results-icon"><Search size={20} /></span><h3>No encontramos esa pieza.</h3><p>Prueba con otra palabra, modelo o filtro.</p><button type="button" onClick={() => { setSearchTerm(''); setIntent('Todos') }}>Ver todo el catálogo <ArrowUpRight size={15} /></button></div>}
          {activeCategory === 'Inicio' && <div className="catalog-end-note"><span>—</span><p>Hay algo especial en encontrar<br />justo lo que estabas buscando.</p><ArrowDown size={16} /></div>}
        </section>

        <section className="catalog-signoff"><span className="eyebrow">HADASSAH STORE</span><p>Un hogar se hace de pequeños momentos.</p></section>
      </main>
      <Footer />
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onAdd={addToOrder} />
      <WhatsAppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {toast && <div className="toast-message" role="status"><span>✓</span>{toast}<button type="button" onClick={() => setDrawerOpen(true)}>Ver pedido</button></div>}
      <span className="sr-only">Secciones del catálogo disponibles: {categories.join(', ')}</span>
    </div>
  )
}

export default App
