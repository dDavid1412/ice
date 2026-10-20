import { useEffect, useMemo, useRef, useState } from 'react'
import { ApiConfigError, fetchProducts } from './lib/api'
import {
  ALL_PRICES,
  applyFilters,
  formatCLP,
  PLATFORM_OPTIONS,
  PRICE_RANGES,
  SORT_OPTIONS,
} from './lib/filters'
import type { FilterState, Platform, Product } from './types'
import './home.css'

const PLATFORM_LABELS: Record<Platform, string> = {
  switch: 'Switch',
  playstation: 'PlayStation',
  xbox: 'Xbox',
}

const DEFAULT_FILTERS: FilterState = {
  priceRange: ALL_PRICES,
  platform: 'all',
  sort: 'discount-desc',
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const catalogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let active = true

    fetchProducts()
      .then((data) => {
        if (!active) return
        setProducts(data)
        setStatus('ready')
      })
      .catch((error: unknown) => {
        if (!active) return
        if (error instanceof ApiConfigError) {
          setErrorMessage(error.message)
        } else if (error instanceof Error) {
          setErrorMessage(error.message)
        } else {
          setErrorMessage('Ocurrió un error inesperado')
        }
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [])

  const visibleProducts = useMemo(
    () => applyFilters(products, filters),
    [products, filters],
  )

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="hero__eyebrow">Juegos físicos en oferta</p>
        <h1 className="hero__title">Bienvenido a Ice</h1>
        <p className="hero__subtitle">
          Las mejores ofertas de juegos físicos en tiendas reales, comparadas en
          un solo lugar.
        </p>
        <button type="button" className="hero__cta" onClick={scrollToCatalog}>
          Ver juegos
        </button>
      </header>

      <main ref={catalogRef} id="catalogo" className="catalog">
        <section className="filters" aria-label="Filtros">
          <div className="filters__field">
            <label htmlFor="price-range">Rango de precio</label>
            <select
              id="price-range"
              value={filters.priceRange}
              onChange={(event) =>
                updateFilter('priceRange', event.target.value)
              }
            >
              <option value={ALL_PRICES}>Todos los precios</option>
              {PRICE_RANGES.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filters__field">
            <label htmlFor="platform">Plataforma</label>
            <select
              id="platform"
              value={filters.platform}
              onChange={(event) =>
                updateFilter(
                  'platform',
                  event.target.value as FilterState['platform'],
                )
              }
            >
              {PLATFORM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filters__field">
            <label htmlFor="sort">Ordenar por</label>
            <select
              id="sort"
              value={filters.sort}
              onChange={(event) =>
                updateFilter('sort', event.target.value as FilterState['sort'])
              }
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <p className="filters__count" role="status">
            {status === 'ready' && (
              <>
                {visibleProducts.length}{' '}
                {visibleProducts.length === 1 ? 'juego' : 'juegos'}
              </>
            )}
          </p>
        </section>

        {status === 'loading' && (
          <p className="state" role="status">
            Cargando juegos…
          </p>
        )}

        {status === 'error' && (
          <p className="state state--error" role="alert">
            {errorMessage}
          </p>
        )}

        {status === 'ready' && visibleProducts.length === 0 && (
          <p className="state">No hay juegos que coincidan con los filtros.</p>
        )}

        {status === 'ready' && visibleProducts.length > 0 && (
          <section className="grid" aria-label="Lista de juegos">
            {visibleProducts.map((product) => (
              <article key={product.id} className="card">
                <div className="card__media">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="card__image"
                    />
                  ) : (
                    <div className="card__placeholder">Sin imagen</div>
                  )}
                  {product.discount != null && product.discount > 0 && (
                    <span className="card__badge">-{product.discount}%</span>
                  )}
                </div>
                <div className="card__body">
                  <div className="card__heading">
                    <h2 className="card__title">{product.name}</h2>
                    <span className="card__platform">
                      {PLATFORM_LABELS[product.platform] ??
                        product.platform}
                    </span>
                  </div>
                  <p className="card__price">
                    {formatCLP(product.discount_price)}
                    {product.price != null && (
                      <span className="card__price-original">
                        {formatCLP(product.price)}
                      </span>
                    )}
                  </p>
                  <dl className="card__stats">
                    <div>
                      <dt>Precio usual</dt>
                      <dd>{formatCLP(product.usual_price)}</dd>
                    </div>
                    <div>
                      <dt>Mejor precio</dt>
                      <dd>{formatCLP(product.best_price)}</dd>
                    </div>
                  </dl>
                  <div className="card__actions">
                    {product.url ? (
                      <a
                        className="card__button"
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver producto
                      </a>
                    ) : (
                      <button type="button" className="card__button" disabled>
                        Ver producto
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Ice · Ofertas de juegos físicos en tiendas físicas</p>
        <p>Datos obtenidos de Knasta</p>
      </footer>
    </div>
  )
}
