import { ArrowDownWideNarrow, SlidersHorizontal } from 'lucide-react'

export type IntentFilter = 'Todos' | 'Regalos < $400' | 'Sets 12 a 20 pzas' | 'Apto inducción' | 'Libre de BPA' | 'Acero inoxidable' | 'Filo de oro'
export type PriceSort = 'featured' | 'low-high' | 'high-low'

const filters: IntentFilter[] = ['Todos', 'Regalos < $400', 'Sets 12 a 20 pzas', 'Apto inducción', 'Libre de BPA', 'Acero inoxidable', 'Filo de oro']

interface IntentFilterBarProps {
  active: IntentFilter
  onChange: (value: IntentFilter) => void
  sort: PriceSort
  onSort: (value: PriceSort) => void
}

export function IntentFilterBar({ active, onChange, sort, onSort }: IntentFilterBarProps) {
  return (
    <div className="intent-bar">
      <div className="intent-title"><SlidersHorizontal size={15} /><span>Encuentra lo tuyo</span></div>
      <div className="intent-pills" role="group" aria-label="Filtros por intención">
        {filters.map((filter) => (
          <button key={filter} type="button" onClick={() => onChange(filter)} className={`intent-pill${active === filter ? ' selected' : ''}`}>{filter}</button>
        ))}
      </div>
      <label className="sort-control"><ArrowDownWideNarrow size={15} /><span>Ordenar</span>
        <select value={sort} onChange={(event) => onSort(event.target.value as PriceSort)} aria-label="Ordenar productos por precio">
          <option value="featured">Destacados</option>
          <option value="low-high">Menor precio</option>
          <option value="high-low">Mayor precio</option>
        </select>
      </label>
    </div>
  )
}
