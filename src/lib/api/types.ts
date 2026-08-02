export type ApiQueryValue = string | number | boolean | null | undefined;

export type ApiQueryParams = object;

export interface ApiModuleContract {
  moduleName: string;
  contractStatus: "pending" | "confirmed";
  requiredEndpoints: string[];
  notes: string[];
}
