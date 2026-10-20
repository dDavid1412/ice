import type { FilterState, Platform, Product, SortOption } from '../types'

export interface PriceRange {
  id: string
  label: string
  min: number
  max: number
}

export const ALL_PRICES = 'all'

export const PRICE_RANGES: PriceRange[] = [
  { id: '0-9999', label: '$0 - $9.999', min: 0, max: 9999 },
  { id: '10000-19999', label: '$10.000 - $19.999', min: 10000, max: 19999 },
  { id: '20000-29999', label: '$20.000 - $29.999', min: 20000, max: 29999 },
  { id: '30000-39999', label: '$30.000 - $39.999', min: 30000, max: 39999 },
  { id: '40000-49999', label: '$40.000 - $49.999', min: 40000, max: 49999 },
  { id: '50000-59999', label: '$50.000 - $59.999', min: 50000, max: 59999 },
  { id: '60000-69999', label: '$60.000 - $69.999', min: 60000, max: 69999 },
  { id: '70000+', label: '$70.000 o más', min: 70000, max: Number.POSITIVE_INFINITY },
]

export const PLATFORM_OPTIONS: { value: Platform | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'switch', label: 'Switch' },
  { value: 'playstation', label: 'PlayStation' },
  { value: 'xbox', label: 'Xbox' },
]

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'discount-desc', label: 'Mayor descuento' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
]

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export function formatCLP(value: number | null): string {
  if (value === null) return '—'
  return clpFormatter.format(value)
}

export function filterByPriceRange(products: Product[], rangeId: string): Product[] {
  if (rangeId === ALL_PRICES) return products
  const range = PRICE_RANGES.find((r) => r.id === rangeId)
  if (!range) return products
  return products.filter(
    (p) =>
      p.discount_price !== null &&
      p.discount_price >= range.min &&
      p.discount_price <= range.max,
  )
}

export function filterByPlatform(
  products: Product[],
  platform: Platform | 'all',
): Product[] {
  if (platform === 'all') return products
  return products.filter((p) => p.platform === platform)
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products]
  switch (sort) {
    case 'discount-desc':
      return sorted.sort(
        (a, b) => (b.discount ?? -Infinity) - (a.discount ?? -Infinity),
      )
    case 'price-asc':
      return sorted.sort(
        (a, b) =>
          (a.discount_price ?? Infinity) - (b.discount_price ?? Infinity),
      )
    case 'price-desc':
      return sorted.sort(
        (a, b) =>
          (b.discount_price ?? -Infinity) - (a.discount_price ?? -Infinity),
      )
  }
}

export function applyFilters(products: Product[], filters: FilterState): Product[] {
  const byPrice = filterByPriceRange(products, filters.priceRange)
  const byPlatform = filterByPlatform(byPrice, filters.platform)
  return sortProducts(byPlatform, filters.sort)
}
