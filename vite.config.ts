import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tileDownloaderPlugin } from "./src/server/tile-downloader";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tileDownloaderPlugin()],
});
