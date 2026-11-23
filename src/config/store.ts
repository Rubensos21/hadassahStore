export const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE ?? '521XXXXXXXXXX'

export const STORE_NAME = 'Hadassah Store'
export const CURRENCY = 'MXN'

export const formatPrice = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return 'Consultar precio'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount)
}
