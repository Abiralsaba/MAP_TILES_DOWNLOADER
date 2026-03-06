import { useState } from "react";
import { Toolbar } from "./Toolbar";
import { CustomSourcesDialog } from "./CustomSourcesDialog";
import { useApp } from "../contexts/AppContext";
import { ApiKeysDialog } from "./ApiKeysDialog";

export function Navbar() {
  const [showCustomSourcesDialog, setShowCustomSourcesDialog] = useState(false);
  const [showApiKeysDialog, setShowApiKeysDialog] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { dispatch } = useApp();

  function handleReset() {
    if (
      window.confirm(
        "Are you sure you want to reset? This will clear all custom sources and settings."
      )
    ) {
      localStorage.clear();
      dispatch({ type: "RESET_STATE" });
    }
  }

  return (
    <>
      <nav className="bg-white border-b border-slate-200">
        <div className="flex flex-col md:flex-row">
          {/* Title Row (mobile) / Left Section (desktop) */}
          <div className="h-12 md:h-14 px-4 flex items-center justify-between md:justify-start md:gap-4 border-b md:border-b-0 border-slate-100">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <img src="/logo.png" alt="MARS ROVER MAP" className="w-10 h-10 rounded" />
              <h1 className="text-lg font-bold text-slate-900 tracking-wide">
                MARS ROVER MAP
              </h1>
            </div>

            <a
              className="p-1 rounded hover:opacity-80 md:ml-2"
              href="https://github.com/Abiralsaba/MAP_TILES_DOWNLOADER"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>

          {/* Controls Row (mobile) / Right Section (desktop) */}
          <div className="h-12 md:h-14 px-4 flex items-center justify-between md:ml-auto md:gap-4 relative">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded hover:bg-slate-100 flex items-center gap-2"
                aria-label="Menu"
              >
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg py-2 z-50 border border-slate-200">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <Toolbar />
                  </div>

                  <button
                    onClick={() => {
                      setShowCustomSourcesDialog(true);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Custom Sources
                  </button>

                  <button
                    onClick={() => {
                      setShowApiKeysDialog(true);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    API Keys
                  </button>

                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <button
                      onClick={() => {
                        dispatch({ type: "SET_DOWNLOAD_MODE", payload: true });
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm font-medium text-brand hover:bg-brand/5"
                    >
                      Download Map Area
                    </button>
                  </div>

                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <button
                      onClick={() => {
                        handleReset();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Reset Everything
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showCustomSourcesDialog && (
        <CustomSourcesDialog
          onClose={() => setShowCustomSourcesDialog(false)}
        />
      )}

      {showApiKeysDialog && (
        <ApiKeysDialog onClose={() => setShowApiKeysDialog(false)} />
      )}
    </>
  );
}
