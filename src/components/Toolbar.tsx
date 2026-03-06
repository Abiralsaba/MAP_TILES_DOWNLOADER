import { useApp } from "../contexts/AppContext";
import { AVAILABLE_LAYOUTS } from "../constants/layouts";
import { BoxCount } from "../types";

export function Toolbar() {
  const { state, dispatch } = useApp();

  function handleLayoutChange(boxCount: BoxCount) {
    dispatch({ type: "SET_BOX_COUNT", payload: boxCount });
  }

  return (
    <div className="flex items-center gap-4">
      {/* Mobile Select */}
      <div className="md:hidden flex items-center gap-2">
        <select
          id="mobile-layout"
          value={state.layout.boxCount}
          onChange={(e) =>
            handleLayoutChange(Number(e.target.value) as BoxCount)
          }
          className="text-sm border border-slate-200 rounded px-2 py-1 bg-white"
        >
          {AVAILABLE_LAYOUTS.map((count) => (
            <option key={count} value={count}>
              {count} {count === 1 ? "panel" : "panels"}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Slider */}
      <div className="hidden md:flex items-center gap-4">
        <span className="text-sm font-medium text-slate-700">
          Panels: {state.layout.boxCount}
        </span>
        <input
          type="range"
          min="1"
          max={AVAILABLE_LAYOUTS[AVAILABLE_LAYOUTS.length - 1]}
          step="1"
          value={state.layout.boxCount}
          onChange={(e) => {
            const val = Number(e.target.value) as BoxCount;
            if (AVAILABLE_LAYOUTS.includes(val)) {
              handleLayoutChange(val);
            }
          }}
          className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand"
        />
      </div>
    </div>
  );
}
