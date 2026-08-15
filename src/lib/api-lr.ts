import { api } from './api';

export interface LorryReceipt {
  id: string;
  number: string;
  customerId?: string;
  invoiceId?: string;
  vehicleId?: string;
  driverId?: string;
  lrNumber?: string;
  lrDate: string;
  riskType?: string;
  vehicleNo?: string;
  driverName?: string;
  driverMobile?: string;
  driverLicence?: string;
  consignorName: string;
  consignorPhone?: string;
  consignorGstin?: string;
  fromState?: string;
  fromCity?: string;
  fromAddress?: string;
  consigneeName?: string;
  consigneePhone?: string;
  consigneeGstin?: string;
  toState?: string;
  toCity?: string;
  toAddress?: string;
  noOfPackage?: number;
  actualWeight?: number;
  actualWeightUnit?: string;
  chargedWeight?: number;
  chargedWeightUnit?: string;
  packageCondition?: string;
  packageDescription?: string;
  remark?: string;
  freightToBeBilled: number;
  freightPaid: number;
  freightToPay: number;
  totalBasicFreight: number;
  loadingCharge: number;
  unloadingCharge: number;
  stCharge: number;
  otherCharges: number;
  lrCnCharges: number;
  gstPercent: number;
  gstPaidBy?: string;
  gstCharge: number;
  total: number;
  materialInsurance?: string;
  insuranceCompany?: string;
  policyNumber?: string;
  insuranceDate?: string;
  insuredAmount?: string;
  insuranceRisk?: string;
  demurrageCharge: number;
  demurrageUnit?: string;
  demurrageAfter?: string;
  status: string;
  createdAt: string;
}

export type LrInput = Omit<
  LorryReceipt,
  'id' | 'number' | 'gstCharge' | 'total' | 'createdAt'
>;

export async function listLrs(search?: string): Promise<LorryReceipt[]> {
  const { data } = await api.get('/lr', { params: { search } });
  return data;
}

export async function getLr(id: string): Promise<LorryReceipt> {
  const { data } = await api.get(`/lr/${id}`);
  return data;
}

export async function createLr(input: LrInput): Promise<LorryReceipt> {
  const { data } = await api.post('/lr', input);
  return data;
}

export async function updateLr(id: string, input: Partial<LrInput>) {
  const { data } = await api.patch(`/lr/${id}`, input);
  return data;
}

export async function deleteLr(id: string) {
  const { data } = await api.delete(`/lr/${id}`);
  return data;
}

/** Advance the consignment (Issued / In Transit / Delivered / Cancelled). */
export async function setLrStatus(id: string, status: string) {
  const { data } = await api.patch(`/lr/${id}/status`, { status });
  return data;
}

export const RISK_TYPES = ["AT OWNER'S RISK", "AT CARRIER'S RISK"];
export const WEIGHT_UNITS = ['KG', 'MT', 'LTR', 'CBM', 'CFT', 'FTL', 'None'];
export const GST_PERCENT_OPTIONS = [0, 5, 12, 18, 28];
export const GST_PAID_BY = ['Consignee', 'Consignor', 'Transporter', 'Exempted'];
export const INSURANCE_OPTIONS = ['Insured', 'Not Insured'];
export const DEMURRAGE_UNITS = ['Per Day', 'Per Hour'];
export const DEMURRAGE_AFTER = [
  '1 Hour',
  '2 Hour',
  '4 Hour',
  '8 Hour',
  '12 Hour',
  '1 Day',
  '2 Day',
  '3 Day',
  '4 Day',
  'More Than 5 Day',
];
