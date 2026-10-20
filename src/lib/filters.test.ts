import { describe, expect, it } from 'vitest'
import type { FilterState, Product } from '../types'
import {
  applyFilters,
  filterByPlatform,
  filterByPriceRange,
  formatCLP,
  PRICE_RANGES,
  sortProducts,
} from './filters'

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: 'Juego de prueba',
    price: 39990,
    platform: 'switch',
    usual_price: 35000,
    best_price: 34990,
    discount: 25,
    discount_price: 29990,
    image: 'https://example.com/juego.jpg',
    url: 'https://example.com/juego',
    ...overrides,
  }
}

describe('formatCLP', () => {
  it('formatea montos en pesos chilenos sin decimales', () => {
    expect(formatCLP(19990)).toBe('$19.990')
    expect(formatCLP(0)).toBe('$0')
  })

  it('agrupa miles con punto', () => {
    expect(formatCLP(1234567)).toBe('$1.234.567')
  })

  it('muestra un guion cuando el valor es nulo', () => {
    expect(formatCLP(null)).toBe('—')
  })
})

describe('PRICE_RANGES', () => {
  it('cubre de 0 a 9999 hasta 70000 o más', () => {
    expect(PRICE_RANGES.map((r) => r.id)).toEqual([
      '0-9999',
      '10000-19999',
      '20000-29999',
      '30000-39999',
      '40000-49999',
      '50000-59999',
      '60000-69999',
      '70000+',
    ])
  })
})

describe('filterByPriceRange', () => {
  const products = [
    product({ id: 1, discount_price: 0 }),
    product({ id: 2, discount_price: 9999 }),
    product({ id: 3, discount_price: 10000 }),
    product({ id: 4, discount_price: 69999 }),
    product({ id: 5, discount_price: 70000 }),
    product({ id: 6, discount_price: 120000 }),
  ]

  it('incluye los límites inferior y superior de cada rango', () => {
    const result = filterByPriceRange(products, '0-9999')
    expect(result.map((p) => p.id)).toEqual([1, 2])
  })

  it('no solapa rangos contiguos', () => {
    const result = filterByPriceRange(products, '10000-19999')
    expect(result.map((p) => p.id)).toEqual([3])
  })

  it('el rango final es abierto hacia arriba', () => {
    const result = filterByPriceRange(products, '70000+')
    expect(result.map((p) => p.id)).toEqual([5, 6])
  })

  it("la opción 'all' devuelve todo", () => {
    expect(filterByPriceRange(products, 'all')).toHaveLength(6)
  })

  it('excluye juegos sin precio de descuento de los rangos', () => {
    const withNull = [...products, product({ id: 7, discount_price: null })]
    expect(filterByPriceRange(withNull, '0-9999').map((p) => p.id)).toEqual([
      1, 2,
    ])
    expect(filterByPriceRange(withNull, 'all')).toHaveLength(7)
  })
})

describe('filterByPlatform', () => {
  const products = [
    product({ id: 1, platform: 'switch' }),
    product({ id: 2, platform: 'playstation' }),
    product({ id: 3, platform: 'xbox' }),
  ]

  it('filtra por plataforma', () => {
    expect(filterByPlatform(products, 'switch').map((p) => p.id)).toEqual([1])
    expect(filterByPlatform(products, 'xbox').map((p) => p.id)).toEqual([3])
  })

  it("la opción 'all' devuelve todo", () => {
    expect(filterByPlatform(products, 'all')).toHaveLength(3)
  })
})

describe('sortProducts', () => {
  const products = [
    product({ id: 1, discount: 10, discount_price: 30000 }),
    product({ id: 2, discount: 50, discount_price: 10000 }),
    product({ id: 3, discount: 30, discount_price: 20000 }),
  ]

  it('ordena por mayor descuento', () => {
    expect(sortProducts(products, 'discount-desc').map((p) => p.id)).toEqual([2, 3, 1])
  })

  it('ordena por precio de menor a mayor', () => {
    expect(sortProducts(products, 'price-asc').map((p) => p.id)).toEqual([2, 3, 1])
  })

  it('ordena por precio de mayor a menor', () => {
    expect(sortProducts(products, 'price-desc').map((p) => p.id)).toEqual([1, 3, 2])
  })

  it('no muta el arreglo original', () => {
    const original = [...products]
    sortProducts(products, 'discount-desc')
    expect(products).toEqual(original)
  })

  it('envía los valores nulos al final', () => {
    const withNull = [
      ...products,
      product({ id: 4, discount: null, discount_price: null }),
    ]
    expect(sortProducts(withNull, 'discount-desc').at(-1)?.id).toBe(4)
    expect(sortProducts(withNull, 'price-asc').at(-1)?.id).toBe(4)
    expect(sortProducts(withNull, 'price-desc').at(-1)?.id).toBe(4)
  })
})

describe('applyFilters', () => {
  const products = [
    product({ id: 1, platform: 'switch', discount: 40, discount_price: 15000 }),
    product({ id: 2, platform: 'xbox', discount: 60, discount_price: 8000 }),
    product({ id: 3, platform: 'switch', discount: 10, discount_price: 25000 }),
  ]

  it('combina rango de precio, plataforma y orden', () => {
    const filters: FilterState = {
      priceRange: '10000-19999',
      platform: 'switch',
      sort: 'discount-desc',
    }
    expect(applyFilters(products, filters).map((p) => p.id)).toEqual([1])
  })
})
