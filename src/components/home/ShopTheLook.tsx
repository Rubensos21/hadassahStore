import { useState } from 'react'
import { ArrowUpRight, Plus } from 'lucide-react'
import type { Product } from '../../data/products'
import { formatPrice } from '../../config/store'
import { SmartProductImage } from '../catalog/SmartProductImage'

interface ShopTheLookProps {
  products: Product[]
  onAdd: (product: Product) => void
}

const points = [
  { top: '31%', left: '27%' },
  { top: '58%', left: '48%' },
  { top: '38%', left: '69%' },
  { top: '71%', left: '77%' },
]

export function ShopTheLook({ products, onAdd }: ShopTheLookProps) {
  const [active, setActive] = useState(0)
  const picks = products.filter((product) => product.category === 'Mesa' && product.page >= 24 && product.page <= 28).slice(0, points.length)
  if (!picks.length) return null

  const featured = picks[Math.min(active, picks.length - 1)]
  return (
    <section className="shop-look section-wrap">
      <div className="section-heading look-heading">
        <div><span className="eyebrow">PUNTO POR PUNTO</span><h2>Compra <em>el look.</em></h2></div>
        <p>Una mesa para compartir<br />los días que se quedan.</p>
      </div>
      <div className="look-scene">
        {featured.image ? (
          <img className="look-backdrop" src="/images/catalog/page_24_img_1.png" alt="Mesa servida con vajilla Soul, bowls, platos y cristalería" loading="lazy" />
        ) : (
          <SmartProductImage product={featured} className="look-backdrop-fallback" />
        )}
        <div className="look-wash" />
        <div className="look-scene-caption"><span>01 — MESA PARA TODOS LOS DÍAS</span><b>Texturas naturales, detalles que duran.</b></div>
        {picks.map((product, index) => (
          <button
            key={product.id}
            type="button"
            className={`look-hotspot${active === index ? ' selected' : ''}`}
            style={points[index]}
            onClick={() => setActive(index)}
            aria-label={`Ver ${product.name}`}
          ><span><Plus size={15} /></span></button>
        ))}
        {featured && (
          <div className="look-product-card">
            <div className="look-product-image"><SmartProductImage product={featured} /></div>
            <div className="look-product-copy">
              <span className="eyebrow">DETALLE {String(active + 1).padStart(2, '0')}</span>
              <b>{featured.name}</b>
              <span className="sku-label">mod. {featured.model}</span>
              <strong>{formatPrice(featured.price)}</strong>
              <button type="button" onClick={() => onAdd(featured)}>Agregar al pedido <ArrowUpRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
