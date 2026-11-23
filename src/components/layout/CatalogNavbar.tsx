import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Search, ShoppingBag } from 'lucide-react'
import type { ProductCategory } from '../../data/products'
import hadassahImagotipo from '../../assets/brand/hadassah-imagotipo.svg'
import hadassahIsotipo from '../../assets/brand/hadassah-isotipo.svg'

export type CatalogSection = 'Inicio' | ProductCategory

interface CatalogNavbarProps {
  activeCategory: CatalogSection
  onChange: (category: CatalogSection) => void
  searchTerm: string
  onSearch: (value: string) => void
  onCartOpen: () => void
  itemCount: number
}

const tabs: { title: CatalogSection; label: string; tone: string }[] = [
  { title: 'Inicio', label: 'Hadassah Store', tone: 'home' },
  { title: 'Mesa', label: 'MESA', tone: 'mesa' },
  { title: 'Café y Té', label: 'CAFÉ Y TÉ', tone: 'cafe' },
  { title: 'Kids', label: 'KIDS', tone: 'kids' },
  { title: 'Cocina', label: 'COCINA', tone: 'cocina' },
  { title: 'Baterías', label: 'BATERÍAS', tone: 'baterias' },
  { title: 'Hogar', label: 'HOGAR', tone: 'hogar' },
]

export function CatalogNavbar({ activeCategory, onChange, searchTerm, onSearch, onCartOpen, itemCount }: CatalogNavbarProps) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
  const searchRef = useRef<HTMLInputElement | null>(null)
  const activeIndex = tabs.findIndex((tab) => tab.title === activeCategory)

  useEffect(() => {
    const selectedTab = tabsRef.current[activeIndex]
    if (selectedTab) gsap.fromTo(selectedTab, { y: -3, scaleY: 0.96, transformOrigin: 'top center' }, { y: 0, scaleY: 1, duration: 0.35, ease: 'power2.out' })
  }, [activeIndex])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  return (
    <header className="site-header">
      <div className="nav-topline">
        <a className="wordmark" href="#inicio" onClick={(event) => { event.preventDefault(); onChange('Inicio') }} aria-label="Hadassah Store, inicio">
          <img className="wordmark-logo" src={hadassahImagotipo} alt="Hadassah Store" />
        </a>
        <div className="nav-utility">
          <label className="search-field">
            <Search size={17} strokeWidth={1.7} aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              placeholder="Buscar nombre o mod."
              value={searchTerm}
              onChange={(event) => onSearch(event.target.value)}
              aria-label="Buscar productos por nombre, colección o modelo"
            />
            <kbd>Ctrl K</kbd>
          </label>
          <button type="button" className="order-button" onClick={onCartOpen} aria-label={`Abrir mi pedido, ${itemCount} artículos`}>
            <ShoppingBag size={18} strokeWidth={1.7} />
            <span>Mi pedido</span>
            <b className={itemCount ? 'count-badge has-items' : 'count-badge'}>{itemCount}</b>
          </button>
        </div>
      </div>
      <nav className="catalog-tabs" aria-label="Secciones del catálogo">
        <div className="catalog-tabs-track">
          {tabs.map((tab, index) => {
            const active = activeCategory === tab.title
            return (
              <button
                key={tab.title}
                ref={(element) => { tabsRef.current[index] = element }}
                type="button"
                className={`catalog-tab tab-${tab.tone}${active ? ' active' : ''}`}
                aria-label={tab.title === 'Inicio' ? 'Hadassah Store · Inicio' : tab.label}
                aria-current={active ? 'page' : undefined}
                onClick={() => onChange(tab.title)}
                onMouseEnter={() => {
                  if (!active && tabsRef.current[index]) gsap.to(tabsRef.current[index], { y: 5, duration: 0.32, ease: 'power2.out' })
                }}
                onMouseLeave={() => {
                  if (tabsRef.current[index]) gsap.to(tabsRef.current[index], { y: 0, duration: 0.38, ease: 'power2.out' })
                }}
              >
                {tab.title === 'Inicio' ? <img className="tab-brand-mark" src={hadassahIsotipo} alt="" /> : tab.label}
              </button>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
