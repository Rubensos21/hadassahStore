import { ArrowDownRight, ArrowUpRight, PackageCheck, Sparkles, Truck } from 'lucide-react'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import type { Product, ProductCategory } from '../../data/products'
import { SmartProductImage } from '../catalog/SmartProductImage'
import type { CatalogSection } from '../layout/CatalogNavbar'

interface EditorialBentoHeroProps {
  products: Product[]
  onNavigate: (category: CatalogSection) => void
}

function CollectionPhoto({ product, label, src }: { product?: Product; label: string; src?: string }) {
  if (!product) return <div className="collection-photo-placeholder" aria-hidden="true"><Sparkles size={28} /></div>
  return <SmartProductImage product={product} src={src} alt={label} className="collection-photo" imageClassName="collection-photo-img" />
}

export function EditorialBentoHero({ products, onNavigate }: EditorialBentoHeroProps) {
  const heroRef = useRef<HTMLElement | null>(null)
  const byCategory = (category: ProductCategory) => products.find((product) => product.category === category && product.image)
  const mesa = byCategory('Mesa') ?? products.find((product) => product.category === 'Mesa')
  const cafe = byCategory('Café y Té') ?? products.find((product) => product.category === 'Café y Té')
  const batteries = byCategory('Baterías') ?? products.find((product) => product.category === 'Baterías')

  useGSAP(() => {
    const entrance = gsap.timeline()
    entrance.fromTo('.bento-main, .bento-side', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.72, stagger: 0.12, ease: 'power2.out' })
      .fromTo('.trust-strip > *', { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.07, ease: 'power2.out' }, '-=0.22')
  }, { scope: heroRef })

  return (
    <section className="home-intro" id="inicio" ref={heroRef}>
      <div className="editorial-bento">
        <button type="button" className="bento-main" onClick={() => onNavigate('Mesa')}>
          <CollectionPhoto product={mesa} label="Vajilla Soul sobre una mesa cálida" src="/images/catalog/page_24_img_1.png" />
          <div className="bento-main-shade" />
          <div className="bento-main-copy">
            <span className="eyebrow light-eyebrow"><i /> COLECCIÓN DE TEMPORADA</span>
            <h1>La calidez de<br /><em>vestir tu mesa.</em></h1>
            <p>Piezas hechas para volver especial lo cotidiano.</p>
            <span className="text-link light-link">Descubrir Mesa <ArrowUpRight size={16} /></span>
          </div>
          <span className="bento-photo-credit">HADASSAH STORE · NUEVA TEMPORADA</span>
        </button>

        <button type="button" className="bento-side bento-cafe" onClick={() => onNavigate('Café y Té')}>
          <CollectionPhoto product={cafe} label="Colección de café y té" />
          <span className="bento-side-label"><span>01 / MOMENTOS LENTOS</span><b>Rituales de<br /><em>café y té.</em></b><i>Explorar <ArrowUpRight size={14} /></i></span>
        </button>

        <button type="button" className="bento-side bento-pro" onClick={() => onNavigate('Baterías')}>
          {batteries && <CollectionPhoto product={batteries} label="Baterías de cocina profesional" />}
          <span className="pro-glow" />
          <span className="bento-side-label"><span>02 / COCINA PRO</span><b>El placer de<br /><em>hacerlo bien.</em></b><i>Ver baterías <ArrowUpRight size={14} /></i></span>
          <span className="pro-stamp"><Sparkles size={14} /> HERRAMIENTAS PARA EL DÍA A DÍA</span>
        </button>
      </div>
      <div className="trust-strip">
        <div><Truck size={17} strokeWidth={1.6} /><span>Envíos a todo México</span></div>
        <div><Sparkles size={16} strokeWidth={1.6} /><span>Atención personalizada por WhatsApp</span></div>
        <div><PackageCheck size={16} strokeWidth={1.6} /><span>Selección Hadassah Store</span></div>
        <button type="button" className="trust-browse" onClick={() => onNavigate('Inicio')}>Explorar catálogo <ArrowDownRight size={15} /></button>
      </div>
    </section>
  )
}
