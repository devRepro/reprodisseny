// server/api/_health.get.ts
export default defineEventHandler((event) => {
    const config = useRuntimeConfig(event);
  
    return {
      ok: true,
      ms: {
        tenantId: Boolean(config.ms?.tenantId),
        clientId: Boolean(config.ms?.clientId),
        clientSecret: Boolean(config.ms?.clientSecret),
      },
      mail: {
        provider: Boolean(config.mail?.provider),
        senderUpn: Boolean(config.mail?.senderUpn),
        to: Boolean(config.mail?.to),
      },
      sharepoint: {
        crmSiteId: Boolean(config.sharepoint?.crm?.siteId),
        priceRequestsListId: Boolean(config.sharepoint?.crm?.priceRequestsListId),
        contactListId: Boolean(config.sharepoint?.crm?.contactListId),
      },
      google: {
        placesApiKey: Boolean(config.google?.placesApiKey),
        placeId: Boolean(config.google?.placeId),
      },
    };
  });