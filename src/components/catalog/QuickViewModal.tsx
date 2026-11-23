import { useEffect, useState } from 'react'
import { CircleDot, Flame, Minus, Plus, ShieldCheck, Sparkles, X, Zap } from 'lucide-react'
import type { Product } from '../../data/products'
import { formatPrice } from '../../config/store'
import { SmartProductImage } from './SmartProductImage'

interface QuickViewModalProps {
  product: Product | null
  onClose: () => void
  onAdd: (product: Product, quantity: number) => void
}

export function QuickViewModal({ product, onClose, onAdd }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1)

  useEffect(() => { setQuantity(1) }, [product?.id])
  useEffect(() => {
    if (!product) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.classList.remove('modal-open'); window.removeEventListener('keydown', onKeyDown) }
  }, [product, onClose])

  if (!product) return null
  const isBattery = product.category === 'Baterías'
  const isCandle = product.category === 'Hogar' && /vela/i.test(product.name)
  const stoveTypes = [
    { Icon: Flame, label: 'Gas' },
    { Icon: Zap, label: 'Eléctrica' },
    { Icon: Sparkles, label: 'Vitrocerámica' },
    { Icon: CircleDot, label: 'Inducción' },
  ]

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="quick-view" role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar"><X size={19} /></button>
        <div className="quick-view-photo"><SmartProductImage product={product} className="quick-view-image" imageClassName="quick-view-img" /></div>
        <div className="quick-view-content">
          <span className="eyebrow">{product.category.toUpperCase()} · PÁGINA {product.page}</span>
          <h2 id="quick-view-title">{product.name}</h2>
          <span className="sku-label">mod. {product.model}</span>
          <strong className="quick-view-price">{formatPrice(product.price)}</strong>
          {product.description && <p className="quick-view-description">{product.description}</p>}

          <div className="detail-facts">
            {product.pieces && <div className="detail-fact"><span>Contenido</span><b>{product.pieces} piezas</b></div>}
            {product.measurements.length > 0 && <div className="detail-fact"><span>Medidas / capacidad</span><b>{product.measurements.join(' · ')}</b></div>}
          </div>
          {product.includedPieces.length > 0 && <div className="piece-breakdown"><span>INCLUYE</span><ul>{product.includedPieces.map((piece, index) => <li key={`${piece}-${index}`}>{piece}</li>)}</ul></div>}
          {product.attributes.length > 0 && <div className="attribute-list">{product.attributes.map((attribute) => <span key={attribute}><ShieldCheck size={14} />{attribute}</span>)}</div>}
          {isBattery && <div className="compatibility-box"><span>COMPATIBILIDAD</span><div className="compatibility-grid">{stoveTypes.map(({ Icon, label }) => <i key={label}><Icon size={13} />{label}</i>)}</div></div>}
          {isCandle && <div className="scent-box"><Flame size={18} /><span>Notas olfativas</span><div className="scent-pyramid"><i>Salida</i><i>Corazón</i><i>Fondo</i></div><p>{product.description}</p></div>}

          <div className="quick-view-actions">
            <div className="quantity-stepper"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Quitar una unidad"><Minus size={14} /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Agregar una unidad"><Plus size={14} /></button></div>
            <button type="button" className="primary-button" onClick={() => { onAdd(product, quantity); onClose() }}>Agregar al pedido <Plus size={16} /></button>
          </div>
        </div>
      </section>
    </div>
  )
}
