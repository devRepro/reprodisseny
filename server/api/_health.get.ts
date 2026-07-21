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
        listId: Boolean(config.sharepoint?.crm?.listId),
      },
      google: {
        placesApiKey: Boolean(config.googleMaps?.apiKey),
        placeId: Boolean(config.public?.googleMaps?.placeId),
      },
    };
  });