import { formatMemberSince as baseFormatMemberSince } from '../../../utils/format/date'
import { formatCurrency } from '../../../utils/format/number'

export function formatMemberSince(value) {
  return baseFormatMemberSince(value, { locale: 'en-GB' })
}

export function formatMoney(value) {
  return formatCurrency(value, { locale: 'en-NO', currency: 'NOK' })
}
