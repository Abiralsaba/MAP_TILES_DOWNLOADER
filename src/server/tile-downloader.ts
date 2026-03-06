import type { Plugin, ViteDevServer } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { pointToTile } from '@mapbox/tilebelt';
import { IncomingMessage, ServerResponse } from 'http';

// State to track download progress
const downloadState: Record<string, { total: number; downloaded: number; failed: number; status: 'running' | 'completed' | 'error', error?: string }> = {};

function downloadTile(url: string, dest: string): Promise<boolean> {
    return new Promise((resolve) => {
        https.get(url, { headers: { 'User-Agent': 'MarsRoverMap-Offline-Downloader/1.0' } }, (res) => {
            if (res.statusCode !== 200) {
                resolve(false);
                return;
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(true);
            });
            file.on('error', () => {
                fs.unlink(dest, () => resolve(false));
            });
        }).on('error', () => resolve(false));
    });
}

function ensureDirSync(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

export function tileDownloaderPlugin(): Plugin {
    return {
        name: 'tile-downloader',
        configureServer(server: ViteDevServer) {
            server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
                if (req.url?.startsWith('/api/download-progress') && req.method === 'GET') {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(downloadState));
                    return;
                }

                if (req.url === '/api/download-tiles' && req.method === 'POST') {
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });
                    req.on('end', async () => {
                        try {
                            const { name, bounds, minZoom, maxZoom, sourceUrl } = JSON.parse(body);

                            if (!name || !bounds || minZoom === undefined || maxZoom === undefined || !sourceUrl) {
                                res.statusCode = 400;
                                res.end(JSON.stringify({ error: 'Missing required parameters' }));
                                return;
                            }

                            const jobId = name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
                            downloadState[jobId] = { total: 0, downloaded: 0, failed: 0, status: 'running' };

                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ success: true, jobId }));

                            // Process download in background
                            const [minLon, minLat, maxLon, maxLat] = bounds; // [W, S, E, N]
                            const tilesToDownload: { z: number, x: number, y: number }[] = [];

                            for (let z = minZoom; z <= maxZoom; z++) {
                                const tileMin = pointToTile(minLon, maxLat, z); // Top Left (West, North)
                                const tileMax = pointToTile(maxLon, minLat, z); // Bottom Right (East, South)

                                const startX = Math.min(tileMin[0], tileMax[0]);
                                const endX = Math.max(tileMin[0], tileMax[0]);
                                const startY = Math.min(tileMin[1], tileMax[1]);
                                const endY = Math.max(tileMin[1], tileMax[1]);

                                for (let x = startX; x <= endX; x++) {
                                    for (let y = startY; y <= endY; y++) {
                                        tilesToDownload.push({ z, x, y });
                                    }
                                }
                            }

                            downloadState[jobId].total = tilesToDownload.length;

                            const baseDir = path.resolve(process.cwd(), 'public', 'offline-tiles', name);

                            const CONCURRENCY = 10;
                            let currentIndex = 0;

                            const worker = async () => {
                                while (currentIndex < tilesToDownload.length) {
                                    const index = currentIndex++;
                                    const tile = tilesToDownload[index];

                                    const zDir = path.join(baseDir, String(tile.z));
                                    const xDir = path.join(zDir, String(tile.x));
                                    ensureDirSync(xDir);

                                    const targetPath = path.join(xDir, `${tile.y}.jpg`);

                                    // Server URL might use {s} for subdomains, simple replacement:
                                    const url = sourceUrl
                                        .replace('{z}', String(tile.z))
                                        .replace('{x}', String(tile.x))
                                        .replace('{y}', String(tile.y))
                                        .replace('{s}', 'a');

                                    if (fs.existsSync(targetPath)) {
                                        downloadState[jobId].downloaded++;
                                        continue; // Skip existing
                                    }

                                    const success = await downloadTile(url, targetPath);
                                    if (success) {
                                        downloadState[jobId].downloaded++;
                                    } else {
                                        downloadState[jobId].failed++;
                                    }
                                }
                            };

                            const workers = Array(Math.min(CONCURRENCY, tilesToDownload.length)).fill(0).map(() => worker());
                            await Promise.all(workers);

                            downloadState[jobId].status = 'completed';
                        } catch (err: any) {
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: err.message }));
                        }
                    });
                    return;
                }

                next();
            });
        }
    };
}
