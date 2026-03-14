import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";

export function SearchBar() {
    const [input, setInput] = useState("");
    const { dispatch } = useApp();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Parse input. We expect roughly "Lat, Lng" or "Lat Lng"
        const cleaned = input.replace(/[^\d.,:; -]/g, "").trim();
        // Split by comma or space
        const parts = cleaned.split(/[,;\s]+/).filter(Boolean);

        if (parts.length >= 2) {
            const latStr = parts[0] || "0";
            const lngStr = parts[1] || "0";
            const lat = parseFloat(latStr);
            const lng = parseFloat(lngStr);

            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                // MapState expects [longitude, latitude]
                dispatch({
                    type: "UPDATE_MAP_STATE",
                    payload: {
                        center: [lng, lat],
                        // optionally zoom in closer if currently zoomed far out
                    },
                });
                setInput(""); // Clear on success
            } else {
                alert("Invalid coordinates. Please enter a valid Latitude and Longitude (e.g., 40.71, -74.00)");
            }
        } else {
            alert("Please enter coordinates in 'Latitude, Longitude' format (e.g., 40.71, -74.00)");
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex hidden md:flex items-center ml-6 flex-1 max-w-sm">
            <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="block w-full p-2 pl-10 text-sm text-slate-900 border border-slate-300 rounded-lg bg-slate-50 focus:ring-brand focus:border-brand outline-none transition-colors"
                    placeholder="Jump to Lat, Lng... (e.g. 35.68, 139.69)"
                />
                <button
                    type="submit"
                    className="text-white absolute right-1.5 bottom-1.5 bg-brand hover:bg-brand/90 focus:ring-4 focus:outline-none focus:ring-brand/30 font-medium rounded text-xs px-3 py-1 transition-colors"
                >
                    Go
                </button>
            </div>
        </form>
    );
}
