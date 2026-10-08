/**
 * User Billing API endpoints: monthly statement.
 */

import { apiClient } from './client'
import type { BillingStatement } from '@/types'

export async function getStatement(year: number, month: number): Promise<BillingStatement> {
  const { data } = await apiClient.get<BillingStatement>('/billing/statement', {
    params: { year, month }
  })
  return data
}

export const billingAPI = {
  statement: getStatement
}

export default billingAPI
