import type { Product } from '../types'

export class ApiConfigError extends Error {
  constructor() {
    super('La variable de entorno VITE_API_URL no está configurada')
    this.name = 'ApiConfigError'
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const apiUrl = import.meta.env.VITE_API_URL

  if (!apiUrl) {
    throw new ApiConfigError()
  }

  const response = await fetch(apiUrl)

  if (!response.ok) {
    throw new Error(
      `No se pudieron obtener los juegos (error ${response.status})`,
    )
  }

  const data: unknown = await response.json()

  if (!Array.isArray(data)) {
    throw new Error('La respuesta de la API no tiene el formato esperado')
  }

  return data as Product[]
}
