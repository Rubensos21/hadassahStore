import { useEffect, useState } from 'react'
import { CookingPot, Image as ImageIcon } from 'lucide-react'
import type { Product } from '../../data/products'

interface SmartProductImageProps {
  product: Pick<Product, 'name' | 'model' | 'category' | 'image'>
  src?: string | null
  alt?: string
  className?: string
  imageClassName?: string
}

const categoryTone: Record<Product['category'], string> = {
  Mesa: 'tone-mesa',
  'Café y Té': 'tone-cafe',
  Kids: 'tone-kids',
  Cocina: 'tone-cocina',
  Baterías: 'tone-baterias',
  Hogar: 'tone-hogar',
}

export function SmartProductImage({ product, src, alt, className = '', imageClassName = '' }: SmartProductImageProps) {
  const [failed, setFailed] = useState(false)
  const imageSource = src ?? product.image
  const showImage = Boolean(imageSource) && !failed

  useEffect(() => { setFailed(false) }, [imageSource])

  return (
    <div className={`smart-image ${categoryTone[product.category]} ${className}`}>
      {showImage ? (
        <img
          src={imageSource ?? undefined}
          alt={alt ?? product.name}
          className={imageClassName}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="image-placeholder" aria-label={`Imagen de ${product.name} pendiente de asignación`}>
          <span className="placeholder-orbit" />
          <span className="placeholder-icon"><CookingPot size={30} strokeWidth={1.25} /><ImageIcon size={13} /></span>
          <span className="placeholder-name">{product.name}</span>
          <span className="sku-label">mod. {product.model || 'por identificar'}</span>
        </div>
      )}
    </div>
  )
}
