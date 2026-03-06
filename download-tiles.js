import fs from 'fs';
import path from 'path';
import https from 'https';
import * as tilebelt from '@mapbox/tilebelt';

const lat = 40.9005;
const lon = 110.9000;
// Create a small bounding box roughly 1km around the coordinate
const bbox = [lon - 0.01, lat - 0.01, lon + 0.01, lat + 0.01];

// We want tiles for zoom levels 14, 15, 16, and 17
const minZoom = 14;
const maxZoom = 17;

const outputDir = path.join(process.cwd(), 'public', 'offline-tiles', 'satellite');

function downloadTile(url, dest) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'MarsRoverMap-Offline-Downloader/1.0' } }, (res) => {
            if (res.statusCode !== 200) {
                resolve(false); // Ignore failed downloads
                return;
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(true);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            resolve(false);
        });
    });
}

async function run() {
    console.log('Calculating required tiles for bounding box at Zoom 14-17...');
    let totalDownloaded = 0;

    for (let z = minZoom; z <= maxZoom; z++) {
        const minTile = tilebelt.pointToTile(bbox[0], bbox[3], z); // Top Left
        const maxTile = tilebelt.pointToTile(bbox[2], bbox[1], z); // Bottom Right

        const minX = Math.min(minTile[0], maxTile[0]);
        const maxX = Math.max(minTile[0], maxTile[0]);
        const minY = Math.min(minTile[1], maxTile[1]);
        const maxY = Math.max(minTile[1], maxTile[1]);

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const dir = path.join(outputDir, z.toString(), x.toString());
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                const dest = path.join(dir, `${y}.jpg`);
                // Using ESRI Satellite for the high-quality offline dump
                const url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;

                if (!fs.existsSync(dest)) {
                    console.log(`Downloading tile Z:${z} X:${x} Y:${y}...`);
                    const success = await downloadTile(url, dest);
                    if (success) totalDownloaded++;
                }
            }
        }
    }

    console.log(`\nDone! Downloaded ${totalDownloaded} tiles to public/offline-tiles/.`);
}

run().catch(console.error);
