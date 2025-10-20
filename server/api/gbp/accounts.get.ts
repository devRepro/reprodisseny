// /server/api/gbp/accounts.get.ts
export default defineEventHandler(async (event) => {
    const data = await gbpFetch<{ accounts: { name: string }[] }>(
      event,
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts'
    )
    return data
  })
  