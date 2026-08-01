export interface ApiResponse<TData> {
  data: TData;
  message?: string;
  requestId?: string;
}

export interface ApiPage<TItem> {
  items: TItem[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export type ApiQueryValue = string | number | boolean | null | undefined;

export type ApiQueryParams = Record<string, ApiQueryValue | ApiQueryValue[]>;

export interface ApiModuleContract {
  moduleName: string;
  contractStatus: "pending" | "confirmed";
  requiredEndpoints: string[];
  notes: string[];
}
