// shared/utils/sharepoint/spfPriceRequests.ts
export const SPF = {
    // Legacy fields (internal names) used by dashboard normalizer
    PRODUCT: "Productesol_x00b7_licitat",
    PRODUCT_FALLBACK: "Producte_x0020_sol_x00B7_licitat",
  
    EMAIL: "Correuelectr_x00f2_nic",
    EMAIL_FALLBACK: "Correu_x0020_electr_x00f2_nic",
  
    PHONE: "Tel_x00e8_fon",
    COMPANY: "Empresa",
  
    REQUEST_DATE_FILTERABLE: "Datasollicitud",
    REQUEST_DATE: "Datasol_x00b7_licitud",
    REQUEST_DATE_FALLBACK: "Data_x0020_sol_x00b7_licitud",
  
    FOLLOWUP: "Seguiment",
    STATUS: "Estat",
    STATUS_CODE: "StatusCode",
  
    RESPONSABLE: "Responsable",
    RESPONSABLE_ID: "ResponsableLookupId",
  
    COMMENT: "Comentari",
  } as const
  