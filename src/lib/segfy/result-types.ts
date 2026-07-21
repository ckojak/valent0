export interface SegfyResult {
  id: string;
  result_id: string;
  company: SegfyCompany;
  quotation: string;
  business: string;
  time: number;
  commission: number;
  premium?: number;
  franchise?: number;
  status: string;
  messages?: string;
  adjustments: string;
  company_reference: string;
  company_data: SegfyCompanyData;
  company_coverages: SegfyCompanyCoverages;
  company_franchises: SegfyCompanyFranchises;
  company_prices: SegfyCompanyPrices;
  installments: SegfyInstallments;
  product: string;
  reference: string;
  lead_like: boolean;
  insured_object: SegfyInsuredObject;
  customization: SegfyCustomization;
  advantages: SegfyAdvantages;
  has_copy_quotation: boolean;
  has_transmission: boolean;
  index_company: number;
  best_installment: string;
  rating: unknown;
  selected_payment: unknown;
  attachment: unknown;
  created_at: string;
  updated_at: string;
  additional_products: SegfyResult[];
  disabled_card: boolean;
}

export interface SegfyAdvantages {
  offers: SegfyOffer[];
  original_value: number;
  total_value: number;
  company_reference?: string;
  discount_options: SegfyDiscountOptions;
}

export interface SegfyDiscountOptions {
  value: number;
  best_installment: string;
  percent: number;
}

export interface SegfyOffer {
  offers_code: string;
  checkbox: { applied: boolean; visible: boolean };
  title: string;
  tooltip: string;
  percent: number;
  layout: string;
  offers_value: number;
  icon: string;
  messages: { title: string; text: string }[];
  exclusivity?: SegfyLayout2 | SegfyLayout3 | SegfyLayout4;
}

export interface SegfyLayout2 {
  fields: {
    label: string;
    text: string;
    select_label: string;
    options: {
      description: string;
      code: number;
      checked: boolean;
      more_details: SegfyMoreDetails[];
    }[];
  }[];
}

export interface SegfyLayout3 {
  limit_percent: number;
  limit_value: number;
  value: string;
  type: string;
}

export interface SegfyLayout4 {
  options: { value: string; checked: boolean; points: string }[];
}

export interface SegfyMoreDetails {
  code: number;
  description: string;
  value: string;
  visible: boolean;
}

export interface SegfyCompany {
  id: string;
  name: string;
  business: string;
  full_name: string;
  status: string | null;
  message: string;
}

export interface SegfyCompanyCoverages {
  moral_damage?: number;
  body_injuries?: number;
  material_damage?: number;
  death?: number;
  invalidity?: string;
  glasses?: string;
  assistence?: string;
  rental_car?: string;
  workshop?: string;
  assistence_type?: string;
  franchise_type?: string;
  fipe_percentage?: string;
  fire_cover?: boolean;
  thieft_cover?: boolean;
  vehicle_damage_cover?: boolean;
  coverage_type?: string;
  body_shop_repair?: string;
  dmh?: string;
  dmh_net_value?: string;
}

export interface SegfyCompanyData {
  pdf?: string;
  code?: number;
  period: string;
  interface: string;
  custom_logo?: string;
  payment_link: string;
  product_info: string;
  vehicle_value?: number;
  operation_number: string;
  best_payment_date: string;
  calculated_commission: number;
}

export interface SegfyCompanyFranchises {
  armor: number;
  gas_kit: number;
  quick_repairs: number;
  body_shop_repair: number;
}

export interface SegfyCompanyPrices {
  dmh: number;
  armor: number;
  death: number;
  gas_kit: number;
  glasses: number;
  zero_km: number;
  bodywork: number;
  expenses: number;
  equipment: number;
  assistance: number;
  invalidity: number;
  rental_car: number;
  accessories: number;
  moral_damage: number;
  body_injuries: number;
  quick_repairs: number;
  material_damage: number;
  body_shop_repair: number;
}

export interface SegfyCustomization {
  items: SegfyCustomizationItem[];
}

export interface SegfyCustomizationItem {
  attributes: {
    options: {
      text: string;
      value: string;
      selected: boolean;
    }[];
    value: string;
    required: boolean;
  };
  description: string;
  element: string;
  format: string;
  name: string;
  text: string;
}

export interface SegfyInstallments {
  [key: string]: unknown;
}

export interface SegfyInsuredObject {
  vehicle: string;
  type_vehicle: string;
}
