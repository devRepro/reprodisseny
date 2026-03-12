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
      REQUEST_KEY: "RequestKey",
  HAS_ATTACHMENT: "HasAttachment",
  PRIMARY_FILE_DRIVE_ITEM_ID: "PrimaryFileDriveItemId",
  PRIMARY_FILE_WEB_URL: "PrimaryFileWebUrl",
  PRIMARY_FILE_NAME: "PrimaryFileName",
  PRIMARY_FILE_MIME_TYPE: "PrimaryFileMimeType",
  PRIMARY_FILE_SIZE: "PrimaryFileSize",

  CONSENT: "Consent",
  CATEGORY_SLUG: "CategorySlug",
  PRODUCT_SLUG: "ProductSlug",
  UTM_JSON: "UtmJson",
  SOURCE_URL: "SourceUrl",
  } as const
  