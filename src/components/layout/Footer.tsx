import { ArrowUpRight } from 'lucide-react'
import { STORE_NAME } from '../../config/store'
import hadassahImagotipo from '../../assets/brand/hadassah-imagotipo.svg'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top"><img className="footer-logo" src={hadassahImagotipo} alt={STORE_NAME} /><a href="#catalogo">Descubrir la colección <ArrowUpRight size={13} /></a></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} {STORE_NAME}</span><span>Objetos para hacer casa.</span><a href="#inicio">Volver arriba ↑</a></div>
    </footer>
  )
}
