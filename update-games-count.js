const fs = require('fs');
const path = require('path');
const https = require('https');
const pako = require('pako');

function readSourceUrlsFromScript() {
    const scriptPath = path.join(__dirname, 'script.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
    
    const sourceUrlsMatch = scriptContent.match(/sourceUrls:\s*\{([^}]+)\}/s);
    if (!sourceUrlsMatch) {
        throw new Error('Não foi possível encontrar sourceUrls no script.js');
    }
    
    const urlsBlock = sourceUrlsMatch[1];
    const urlRegex = /['"]([^'"]+)['"]:\s*['"]([^'"]+)['"]/g;
    const sourceUrls = {};
    let match;
    
    while ((match = urlRegex.exec(urlsBlock)) !== null) {
        const key = match[1];
        const url = match[2];
        sourceUrls[key] = url;
    }
    
    return sourceUrls;
}

const CSV_FILES = {
    'byxatab': 'ByXATAB.csv.gz',
    'dodi': 'DODI%20Repack.csv.gz',
    'ecologica': 'Ecol%C3%B3gica%20Verde.csv.gz',
    'fitgirl': 'FitGirl%20Repack.csv.gz',
    'gog': 'Free%20PC%20GOG%20Games.csv.gz',
    'onlinefix': 'OnlineFixMe.csv.gz',
    'insaneramzes': 'InsaneRamzes.csv.gz'
};

const CATALOG_NAMES = {
    'byxatab': 'ByXATAB',
    'dodi': 'DODI Repacks',
    'ecologica': 'Ecológica Verde',
    'fitgirl': 'FitGirl Repacks',
    'gog': 'Free PC GOG Games',
    'onlinefix': 'OnlineFixMe',
    'insaneramzes': 'InsaneRamZes'
};

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : require('http');
        protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }
            
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
            });
        }).on('error', reject);
    });
}

async function getGameCount(catalogId, catalogName, baseUrl) {
    try {
        const csvFile = CSV_FILES[catalogId];
        if (!csvFile) {
            console.log(`  -> Pulando ${catalogName}: arquivo CSV não definido`);
            return null;
        }
        
        let url = baseUrl;
        if (!url.endsWith('/')) {
            url = url + '/';
        }
        const fullUrl = url + csvFile;
        
        console.log(`Buscando ${catalogName}...`);
        
        const data = await fetchUrl(fullUrl);
        
        let csvText;
        if (fullUrl.endsWith('.gz')) {
            const decompressed = pako.ungzip(new Uint8Array(data), { to: 'string' });
            csvText = decompressed;
        } else {
            csvText = data.toString('utf-8');
        }
        
        const lines = csvText.split('\n').filter(line => line.trim());
        const gameCount = Math.max(0, lines.length - 1);
        
        console.log(`  -> ${gameCount.toLocaleString()} jogos`);
        
        return gameCount;
        
    } catch (error) {
        console.error(`Erro ao buscar ${catalogName}:`, error.message);
        return null;
    }
}

async function updateGameCounts() {
    console.log('Iniciando atualização da contagem de jogos...\n');
    
    let sourceUrls;
    try {
        sourceUrls = readSourceUrlsFromScript();
        console.log('URLs dos catálogos lidas do script.js:');
        Object.entries(sourceUrls).forEach(([id, url]) => {
            console.log(`  ${id}: ${url}`);
        });
        console.log('');
    } catch (error) {
        console.error('Erro ao ler script.js:', error.message);
        process.exit(1);
    }
    
    const gameCounts = {};
    let totalGames = 0;
    let successCount = 0;
    
    for (const [catalogId, baseUrl] of Object.entries(sourceUrls)) {
        const catalogName = CATALOG_NAMES[catalogId] || catalogId;
        const count = await getGameCount(catalogId, catalogName, baseUrl);
        
        if (count !== null) {
            gameCounts[catalogId] = count;
            totalGames += count;
            successCount++;
        }
    }
    
    if (successCount === 0) {
        console.error('Nenhuma contagem foi obtida!');
        process.exit(1);
    }
    
    gameCounts.totalGames = totalGames;
    
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    gameCounts.lastUpdated = `${year}-${month}-${day} ${hours}:${minutes}`;
    
    const filePath = path.join(__dirname, 'games-count.json');
    
    try {
        if (fs.existsSync(filePath)) {
            const existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            for (const id of Object.keys(sourceUrls)) {
                if (gameCounts[id] === undefined && existingData[id] !== undefined) {
                    gameCounts[id] = existingData[id];
                    if (typeof existingData[id] === 'number') {
                        totalGames += existingData[id];
                    }
                }
            }
            if (gameCounts.totalGames === 0 && existingData.totalGames) {
                gameCounts.totalGames = existingData.totalGames;
            }
        }
    } catch (e) {
        console.log('Criando novo arquivo games-count.json...');
    }
    
    if (totalGames > 0 && gameCounts.totalGames !== totalGames) {
        gameCounts.totalGames = totalGames;
    }
    
    fs.writeFileSync(filePath, JSON.stringify(gameCounts, null, 2), 'utf-8');
    
    console.log(`\n✅ Arquivo games-count.json atualizado!`);
    console.log(`📊 Total de jogos: ${gameCounts.totalGames.toLocaleString()}`);
    console.log(`📅 Última atualização: ${gameCounts.lastUpdated}`);
    console.log(`✅ Catálogos processados: ${successCount}/${Object.keys(sourceUrls).length}`);
}

if (require.main === module) {
    updateGameCounts().catch(console.error);
}

module.exports = { updateGameCounts, getGameCount, readSourceUrlsFromScript };