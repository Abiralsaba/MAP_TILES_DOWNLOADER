import { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";
import { SATELLITE_SOURCES, GOOGLE_SOURCES } from "../constants/mapSources";
import { startDownload, checkProgress } from "../api/downloader";
import { MapState } from "../types";

export function DownloadDialog() {
    const { state, dispatch } = useApp();
    const [name, setName] = useState("");
    const [minZoom, setMinZoom] = useState(14);
    const [maxZoom, setMaxZoom] = useState(19);
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState<{ total: number; downloaded: number } | null>(null);
    const [error, setError] = useState("");

    const activePanel = state.panels[0];
    const [selectedSourceId, setSelectedSourceId] = useState<string>(activePanel?.sourceId || "satellite-esri");

    useEffect(() => {
        if (activePanel && !selectedSourceId) {
            setSelectedSourceId(activePanel.sourceId);
        }
    }, [activePanel, selectedSourceId]);

    if (!activePanel) return null;

    const source = state.customSources[selectedSourceId] ||
        SATELLITE_SOURCES[selectedSourceId] ||
        GOOGLE_SOURCES[selectedSourceId];

    if (!source) return null;

    const mapState: MapState = activePanel.synchronized ? state.mapState : (activePanel.localMapState || state.mapState);

    // Use exact viewport bounds if available, fallback to a sensible approximation
    let bounds: [number, number, number, number] = [0, 0, 0, 0];
    if (mapState.bounds) {
        bounds = mapState.bounds;
    } else {
        const offset = 0.05 * Math.pow(2, 12 - mapState.zoom);
        bounds = [
            mapState.center[0] - offset, // W
            mapState.center[1] - offset, // S
            mapState.center[0] + offset, // E
            mapState.center[1] + offset  // N
        ];
    }

    useEffect(() => {
        if (!isDownloading || !name) return;

        const jobId = name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
        const timer = setInterval(async () => {
            const stats = await checkProgress();
            if (stats[jobId]) {
                setProgress({ total: stats[jobId].total, downloaded: stats[jobId].downloaded });
                if (stats[jobId].status === 'completed' || stats[jobId].status === 'error') {
                    setIsDownloading(false);
                    dispatch({ type: "SET_DOWNLOAD_MODE", payload: false });

                    if (stats[jobId].status === 'completed') {
                        dispatch({
                            type: "ADD_CUSTOM_SOURCE",
                            payload: {
                                id: jobId,
                                source: {
                                    id: jobId,
                                    name: `Offline: ${name}`,
                                    type: "raster",
                                    url: `/offline-tiles/${jobId}/{z}/{x}/{y}.jpg`,
                                    attribution: "Downloaded Local Area",
                                }
                            }
                        });
                        alert(`Download Complete! Added "Offline: ${name}" to sources.`);
                    }
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [isDownloading, name, dispatch]);

    const handleDownload = async () => {
        if (!name.trim()) return;
        if (source.type === "google") {
            setError("Cannot download directly from Google Maps API sources. Please use 'Google Satellite (No API)' or 'ESRI Satellite'.");
            return;
        }

        const sourceUrl = (source as any).url;
        if (!sourceUrl) {
            setError("Current source does not support direct tile downloading.");
            return;
        }

        setIsDownloading(true);
        setError("");

        const res = await startDownload({
            name,
            bounds,
            minZoom,
            maxZoom,
            sourceUrl,
        });

        if (!res.success) {
            setError(res.error || "Failed to start download");
            setIsDownloading(false);
        }
    };

    if (!state.isDownloadMode) return null;

    // Build options for source selector
    const sourceGroups = [
        { label: "High Quality Satellites", sources: SATELLITE_SOURCES },
        { label: "Custom / Local Sets", sources: state.customSources }
    ];

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-bold mb-4">Download Exact Map Area</h2>

                {isDownloading ? (
                    <div className="space-y-4">
                        <p className="font-medium text-slate-700">Downloading your extremely high quality offline map...</p>
                        {progress && (
                            <div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                                    <div className="bg-brand h-2.5 rounded-full transition-all duration-300" style={{ width: `${(progress.downloaded / progress.total) * 100}%` }}></div>
                                </div>
                                <p className="text-sm text-slate-600 text-center">{progress.downloaded} of {progress.total} tiles downloaded</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600 bg-brand/5 p-3 rounded border border-brand/20">
                            <strong>Note:</strong> The area you currently see inside the main map panel will be exactly what gets downloaded! Pan or zoom the map behind this dialog to adjust the boundaries perfectly.
                        </p>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Dataset Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., UIU Mars Setup"
                                className="w-full p-2 border border-slate-300 rounded focus:border-brand outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Choose Source to Download From</label>
                            <select
                                value={selectedSourceId}
                                onChange={(e) => setSelectedSourceId(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded focus:border-brand outline-none"
                            >
                                {sourceGroups.map(group => (
                                    Object.keys(group.sources).length > 0 && (
                                        <optgroup key={group.label} label={group.label}>
                                            {Object.entries(group.sources).map(([id, src]) => (
                                                <option key={id} value={id}>
                                                    {src.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Min Zoom</label>
                                <input
                                    type="number"
                                    value={minZoom}
                                    onChange={(e) => setMinZoom(Number(e.target.value))}
                                    min={1}
                                    max={20}
                                    className="w-full p-2 border border-slate-300 rounded focus:border-brand outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Max Zoom (Quality)</label>
                                <input
                                    type="number"
                                    value={maxZoom}
                                    onChange={(e) => setMaxZoom(Number(e.target.value))}
                                    min={minZoom}
                                    max={20}
                                    className="w-full p-2 border border-slate-300 rounded focus:border-brand outline-none"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">Set to 19 or 20 for absolute best original quality.</p>
                            </div>
                        </div>

                        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => dispatch({ type: "SET_DOWNLOAD_MODE", payload: false })}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                                disabled={isDownloading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={!name.trim() || isDownloading}
                                className="px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded transition-colors disabled:opacity-50"
                            >
                                Start Download
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
