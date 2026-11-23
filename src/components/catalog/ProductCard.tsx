import { useState } from 'react'
import { Check, Heart, Plus } from 'lucide-react'
import type { Product } from '../../data/products'
import { formatPrice } from '../../config/store'
import { SmartProductImage } from './SmartProductImage'

interface ProductCardProps {
  product: Product
  onQuickView: (product: Product) => void
  onAdd: (product: Product) => void
}

export function ProductCard({ product, onQuickView, onAdd }: ProductCardProps) {
  const [added, setAdded] = useState(false)
  const badges = [product.pieces ? `Set ${product.pieces} pzas` : '', product.measurements[0] ?? '', product.attributes[0] ?? ''].filter(Boolean).slice(0, 2)

  const handleAdd = () => {
    onAdd(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1300)
  }

  return (
    <article className="product-card">
      <div className="product-visual">
        <button type="button" className="product-image-trigger" onClick={() => onQuickView(product)} aria-label={`Ver detalles de ${product.name}`}>
          <SmartProductImage product={product} className="product-photo" imageClassName="product-photo-img" />
          {product.images.length > 1 && <SmartProductImage product={product} src={product.images[1]} className="product-photo product-photo-hover" imageClassName="product-photo-img" />}
        </button>
        <div className="product-badges">
          {badges.map((badge) => <span key={badge}>{badge}</span>)}
        </div>
        <button type="button" className="save-product" aria-label={`Guardar ${product.name} en favoritos`}><Heart size={16} strokeWidth={1.5} /></button>
        <button type="button" className={`quick-add${added ? ' added' : ''}`} onClick={handleAdd}>
          {added ? <><Check size={15} /> Agregado</> : <><Plus size={15} /> Agregar</>}
        </button>
      </div>
      <div className="product-info">
        <button type="button" className="product-name" onClick={() => onQuickView(product)}>{product.name}</button>
        <span className="sku-label">mod. {product.model}</span>
        <div className="product-price-row"><strong>{formatPrice(product.price)}</strong><button type="button" onClick={() => onQuickView(product)}>Ver detalles <span>↗</span></button></div>
      </div>
    </article>
  )
}
