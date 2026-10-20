export type Platform = 'switch' | 'playstation' | 'xbox'

export interface Product {
  id: number
  name: string
  price: number | null
  platform: Platform
  usual_price: number | null
  best_price: number | null
  discount: number | null
  discount_price: number | null
  image: string | null
  url: string | null
}

export type SortOption = 'discount-desc' | 'price-asc' | 'price-desc'

export interface FilterState {
  priceRange: string
  platform: Platform | 'all'
  sort: SortOption
}
