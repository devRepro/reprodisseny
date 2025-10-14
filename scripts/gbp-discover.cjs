// scripts/gbp-discover.js
// Uso:
//   node scripts/gbp-discover.js
//   GBP_ACCESS_TOKEN="..." node scripts/gbp-discover.js
//   node scripts/gbp-discover.js --token "..." --title "Repro Disseny"
//   node scripts/gbp-discover.js --account "accounts/123" --storeCode "BCN-01"

const http = require('node:http');

const args = Object.fromEntries(process.argv.slice(2).map(arg => {
    const [k, ...rest] = arg.replace(/^--/, '').split('=');
    return [k, rest.join('=') || true];
}));

async function getLocalAccessToken() {
    // Intenta primero env var
    if (process.env.GBP_ACCESS_TOKEN) return process.env.GBP_ACCESS_TOKEN;
    if (args.token && typeof args.token === 'string') return args.token;

    // Si no, intenta pedirlo a tu endpoint local de debug
    const url = 'http://localhost:3000/api/gbp/debug/access-token';
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
        const json = await res.json();
        if (json?.access_token) return json.access_token;
        if (json?.access_token_preview) {
            console.error('Recibí sólo un preview del token. Cambia el endpoint para devolver access_token completo temporalmente.');
            process.exit(1);
        }
    } catch (e) {
        console.error('No pude obtener el access token. Pásalo por --token o GBP_ACCESS_TOKEN.');
        console.error('Ejemplo: GBP_ACCESS_TOKEN="...copiar de /api/gbp/debug/access-token..." node scripts/gbp-discover.js');
        process.exit(1);
    }
}

async function getJSON(url, token) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
        const text = await res.text();
        const err = new Error(`[GET] ${url} -> ${res.status} ${res.statusText}\n${text}`);
        err.status = res.status;
        throw err;
    }
    return res.json();
}

function pickAccount(accounts, desired) {
    if (desired && accounts.some(a => a.name === desired)) {
        return desired;
    }
    if (accounts.length === 1) return accounts[0].name;
    console.log('\nCuentas encontradas:');
    accounts.forEach(a => console.log(`- ${a.name}${a.accountName ? ` (${a.accountName})` : ''}${a.type ? ` [${a.type}]` : ''}`));
    console.log('\nSugerencia: vuelve a ejecutar con --account "accounts/XXXX" para elegir una cuenta concreta.');
    return accounts[0]?.name;
}

function pickLocation(locations, { title, storeCode, desired }) {
    if (desired && locations.some(l => l.name === desired)) return desired;
    if (title) {
        const hit = locations.find(l => (l.title || '').toLowerCase() === String(title).toLowerCase());
        if (hit) return hit.name;
    }
    if (storeCode) {
        const hit = locations.find(l => (l.storeCode || '') === storeCode);
        if (hit) return hit.name;
    }
    if (locations.length === 1) return locations[0].name;

    console.log('\nUbicaciones encontradas:');
    locations.forEach(l => {
        console.log(`- ${l.name}${l.title ? ` (${l.title})` : ''}${l.storeCode ? ` [${l.storeCode}]` : ''}`);
    });
    console.log('\nSugerencia: vuelve a ejecutar con:');
    console.log('  --location "locations/XXXXX"  ó  --title "Nombre exacto"  ó  --storeCode "TU-CODIGO"');
    return locations[0]?.name;
}

(async () => {
    try {
        const token = await getLocalAccessToken();

        // 1) Accounts
        const accUrl = 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts';
        const accRes = await getJSON(accUrl, token).catch(err => {
            if (err.status === 403) {
                console.error('\n403 PERMISSION_DENIED al listar cuentas.');
                console.error('Causas típicas:');
                console.error('- Tu app está en Testing y tu email NO está en "Test users" del OAuth consent screen.');
                console.error('- Falta habilitar Business Account Management API en tu proyecto.');
                console.error('- El token no tiene el scope "https://www.googleapis.com/auth/business.manage".');
                console.error('- Estás logueado con una cuenta que no gestiona la ficha.');
            }
            throw err;
        });

        const accounts = accRes.accounts || [];
        if (!accounts.length) {
            console.error('No se encontraron cuentas. ¿Estás logueado con la cuenta que gestiona la ficha?');
            process.exit(1);
        }
        const accountName = pickAccount(accounts, args.account?.toString());
        if (!accountName) {
            console.error('No pude seleccionar cuenta.');
            process.exit(1);
        }

        // 2) Locations de esa account (Business Information v1)
        const locUrl = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`);
        locUrl.searchParams.set('readMask', 'name,title,storeCode,metadata');
        locUrl.searchParams.set('pageSize', '100');
        const locRes = await getJSON(locUrl.toString(), token).catch(err => {
            if (err.status === 403) {
                console.error('\n403 PERMISSION_DENIED al listar locations.');
                console.error('Causas típicas:');
                console.error('- Falta habilitar Business Information API (v1) en tu proyecto.');
                console.error('- El token no tiene el scope "business.manage" o el usuario no tiene permisos de gestor/propietario.');
            }
            throw err;
        });

        const locations = locRes.locations || [];
        if (!locations.length) {
            console.error('No se encontraron ubicaciones en esa cuenta. ¿Esa cuenta tiene fichas?');
            process.exit(1);
        }

        const locationName = pickLocation(locations, {
            title: args.title?.toString(),
            storeCode: args.storeCode?.toString(),
            desired: args.location?.toString()
        });

        if (!locationName) {
            console.error('No pude seleccionar ubicación.');
            process.exit(1);
        }

        // 3) Salida final lista para .env
        console.log('\n# COPIA Y PEGA EN TU .env');
        console.log(`NUXT_GBP_ACCOUNT=${accountName}`);
        console.log(`NUXT_GBP_LOCATION=${locationName}`);

        console.log('\nListo ✅');
    } catch (e) {
        console.error('\nERROR:', e.message || e);
        process.exit(1);
    }
})();
