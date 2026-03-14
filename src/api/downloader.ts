// src/api/downloader.ts

export interface DownloadRequest {
    name: string;
    bounds: [number, number, number, number]; // [W, S, E, N]
    minZoom: number;
    maxZoom: number;
    sourceUrl: string;
}

export interface DownloadProgress {
    total: number;
    downloaded: number;
    failed: number;
    status: 'running' | 'completed' | 'error';
    error?: string;
}

export async function startDownload(req: DownloadRequest): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
        const res = await fetch('/api/download-tiles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req),
        });
        return await res.json();
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function checkProgress(): Promise<Record<string, DownloadProgress>> {
    try {
        const res = await fetch('/api/download-progress');
        return await res.json();
    } catch (err) {
        return {};
    }
}
