import { useEffect } from 'react'
import { MessageCircle, Minus, Plus, Trash2, X } from 'lucide-react'
import { formatPrice, STORE_NAME, WHATSAPP_PHONE } from '../../config/store'
import { useCartStore } from '../../store/useCartStore'
import { SmartProductImage } from '../catalog/SmartProductImage'

interface WhatsAppDrawerProps {
  open: boolean
  onClose: () => void
}

export function WhatsAppDrawer({ open, onClose }: WhatsAppDrawerProps) {
  const items = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  const decreaseItem = useCartStore((state) => state.decreaseItem)
  const removeItem = useCartStore((state) => state.removeItem)
  const setItemNote = useCartStore((state) => state.setItemNote)
  const customerName = useCartStore((state) => state.customerName)
  const customerCity = useCartStore((state) => state.customerCity)
  const setCustomerName = useCartStore((state) => state.setCustomerName)
  const setCustomerCity = useCartStore((state) => state.setCustomerCity)
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.body.classList.add('drawer-open')
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.classList.remove('drawer-open'); window.removeEventListener('keydown', onKeyDown) }
  }, [open, onClose])

  if (!open) return null

  const sendOrder = () => {
    if (!items.length) return
    const lines = items.map(({ product, quantity, note }) =>
      `• [${quantity}x] ${product.name} (mod. ${product.model}) — ${formatPrice(product.price)} c/u${note ? `\n  Nota: ${note}` : ''}`,
    )
    const message = [
      `Hola! Me gustaría hacer el siguiente pedido del catálogo ${STORE_NAME}:`,
      '',
      ...lines,
      '',
      `Total estimado: ${formatPrice(subtotal)} MXN`,
      `Nombre: ${customerName || 'Por confirmar'}`,
      `Ciudad / C.P.: ${customerCity || 'Por confirmar'}`,
    ].join('\n')
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <aside className="order-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer-head"><div><span className="eyebrow">TU SELECCIÓN</span><h2 id="drawer-title">Mi pedido <span>({totalCount})</span></h2></div><button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar pedido"><X size={19} /></button></div>
        {items.length ? <>
          <div className="cart-items">
            {items.map(({ product, quantity, note }) => (
              <article className="cart-item" key={product.id}>
                <SmartProductImage product={product} className="cart-thumb" imageClassName="cart-thumb-img" />
                <div className="cart-item-info"><span className="sku-label">mod. {product.model}</span><b>{product.name}</b><strong>{formatPrice(product.price)}</strong>
                  <div className="cart-quantity"><button type="button" onClick={() => decreaseItem(product.id)} aria-label="Disminuir"><Minus size={12} /></button><span>{quantity}</span><button type="button" onClick={() => addItem(product)} aria-label="Aumentar"><Plus size={12} /></button><button className="remove-item" type="button" onClick={() => removeItem(product.id)} aria-label="Eliminar"><Trash2 size={14} /></button></div>
                  <input className="item-note" value={note} onChange={(event) => setItemNote(product.id, event.target.value)} placeholder="Nota para este producto (opcional)" aria-label={`Nota para ${product.name}`} />
                </div>
              </article>
            ))}
          </div>
          <div className="customer-fields"><label>Tu nombre<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="¿Cómo te llamas?" /></label><label>Ciudad / código postal<input value={customerCity} onChange={(event) => setCustomerCity(event.target.value)} placeholder="Para cotizar tu envío" /></label></div>
          <div className="drawer-total"><span>Subtotal estimado</span><strong>{formatPrice(subtotal)} <small>MXN</small></strong><p>El envío se cotiza de forma personalizada por WhatsApp.</p></div>
          <button type="button" className="whatsapp-cta" onClick={sendOrder}><MessageCircle size={18} /> Enviar pedido por WhatsApp <span>↗</span></button>
          <div className="drawer-assurance">Confirmar disponibilidad y envío antes de pagar.</div>
        </> : <div className="empty-cart"><div className="empty-bag"><MessageCircle size={22} /></div><h3>Tu mesa está por comenzar.</h3><p>Guarda tus piezas favoritas y arma tu pedido a tu ritmo.</p><button type="button" onClick={onClose}>Explorar catálogo</button></div>}
      </aside>
    </div>
  )
}
