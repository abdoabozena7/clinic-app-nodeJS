import React, { useEffect, useMemo, useRef, useState } from "react";

const LS_KEY = "wl_simulator_settings_v1";

const DEFAULTS = {
  siteName: "MediCare",
  logoDataUrl: "",
  theme: {
    primary: "#39D1B4",
    secondary: "#6AA9E8",
    accent: "#0ea5e9",
    background: "#f9fafb",
    text: "#111827",
  },
};

function isHex6(v) {
  return /^#[0-9A-Fa-f]{6}$/.test(v);
}

function safeLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULTS,
      ...parsed,
      theme: { ...DEFAULTS.theme, ...(parsed?.theme || {}) },
    };
  } catch {
    return DEFAULTS;
  }
}

function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"' && inQuotes && next === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === "," && !inQuotes) {
      row.push(cur);
      cur = "";
      continue;
    }
    if ((c === "\n" || c === "\r") && !inQuotes) {
      if (c === "\r" && next === "\n") i++;
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
      continue;
    }
    cur += c;
  }

  if (cur.length || row.length) {
    row.push(cur);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => String(cell ?? "").trim() !== ""));
}

export default function WhiteLabelSimulator() {
  const [settings, setSettings] = useState(() => safeLoad());
  const [draft, setDraft] = useState(() => safeLoad());
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [dataPreview, setDataPreview] = useState({ headers: [], rows: [] });
  const logoRef = useRef(null);

  const preview = draft;

  const previewVars = useMemo(
    () => ({
      "--wl-primary": preview.theme.primary,
      "--wl-secondary": preview.theme.secondary,
      "--wl-accent": preview.theme.accent,
      "--wl-bg": preview.theme.background,
      "--wl-text": preview.theme.text,
    }),
    [preview]
  );

  useEffect(() => {
    if (status.msg) setStatus((p) => ({ ...p, msg: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.siteName, draft.logoDataUrl, draft.theme.primary, draft.theme.secondary, draft.theme.accent, draft.theme.background, draft.theme.text]);

  const setTheme = (key, value) => {
    setDraft((p) => ({ ...p, theme: { ...p.theme, [key]: value } }));
  };

  const onLogoPick = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", msg: "Please select an image file for the logo." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((p) => ({ ...p, logoDataUrl: String(reader.result || "") }));
      setStatus({ type: "success", msg: "Logo loaded. Preview updated." });
    };
    reader.readAsDataURL(file);
  };

  const applyAndSave = () => {
    if (!draft.siteName?.trim()) {
      setStatus({ type: "error", msg: "Site name cannot be empty." });
      return;
    }
    for (const k of ["primary", "secondary", "accent", "background", "text"]) {
      if (!isHex6(draft.theme[k])) {
        setStatus({ type: "error", msg: `Invalid color for "${k}". Use #RRGGBB.` });
        return;
      }
    }

    localStorage.setItem(LS_KEY, JSON.stringify(draft));
    setSettings(draft);
    setStatus({ type: "success", msg: "Saved & applied successfully." });
  };

  const resetAll = () => {
    localStorage.removeItem(LS_KEY);
    setSettings(DEFAULTS);
    setDraft(DEFAULTS);
    setDataPreview({ headers: [], rows: [] });
    setStatus({ type: "success", msg: "Reset to defaults." });
    if (logoRef.current) logoRef.current.value = "";
  };

  const exportSettings = () => downloadJson("white-label-settings.json", draft);

  const handleDataUpload = async (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();

    if (name.endsWith(".csv")) {
      const text = await file.text();
      const rows = parseCSV(text);
      if (!rows.length) {
        setStatus({ type: "error", msg: "CSV looks empty." });
        return;
      }
      const headers = rows[0].map((h) => String(h || "").trim());
      const body = rows.slice(1).map((r) => {
        const obj = {};
        headers.forEach((h, idx) => (obj[h || `col_${idx + 1}`] = r[idx] ?? ""));
        return obj;
      });

      setDataPreview({ headers, rows: body.slice(0, 50) });
      setStatus({ type: "success", msg: `Loaded CSV. Showing first ${Math.min(50, body.length)} rows.` });
      return;
    }

    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      try {
        const XLSX = await import("xlsx");
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const firstSheet = wb.SheetNames[0];
        const sheet = wb.Sheets[firstSheet];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const headers = json.length ? Object.keys(json[0]) : [];
        setDataPreview({ headers, rows: json.slice(0, 50) });
        setStatus({ type: "success", msg: `Loaded XLSX. Showing first ${Math.min(50, json.length)} rows.` });
      } catch {
        setStatus({ type: "error", msg: "XLSX needs 'xlsx' installed: npm i xlsx" });
      }
      return;
    }

    setStatus({ type: "error", msg: "Unsupported file type. Upload .csv or .xlsx." });
  };

  const StatusBox = () => {
    if (!status.msg) return null;

    const cls =
      status.type === "success"
        ? "border-green-200 bg-green-50 text-green-800"
        : "border-red-200 bg-red-50 text-red-800";

    return (
      <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${cls}`}>
        {status.msg}
      </div>
    );
  };

  const ColorRow = ({ k, label }) => (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_120px] md:items-end">
      <div>
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
        <input
          value={draft.theme[k]}
          onChange={(e) => setTheme(k, e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm shadow-sm focus:border-slate-300 focus:outline-none"
          placeholder="#RRGGBB"
        />
      </div>
      <input
        type="color"
        value={isHex6(draft.theme[k]) ? draft.theme[k] : "#000000"}
        onChange={(e) => setTheme(k, e.target.value)}
        className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white shadow-sm"
        title={`${label} picker`}
      />
    </div>
  );

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">White-Label Settings</h1>
          <p className="mt-1 text-sm text-slate-600">
            Simulate branding, theme, and data upload. Preview updates instantly.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportSettings}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Export
          </button>
          <button
            onClick={resetAll}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            onClick={applyAndSave}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:opacity-95"
          >
            Save & Apply
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Left: Controls */}
        <div className="rounded-2xl bg-white p-5 shadow-md">
          <h2 className="text-lg font-extrabold text-slate-900">Customization</h2>

          <div className="mt-5 grid grid-cols-1 gap-5">
            {/* Site name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">Site Name</label>
              <input
                value={draft.siteName}
                onChange={(e) => setDraft((p) => ({ ...p, siteName: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-slate-300 focus:outline-none"
                placeholder="Brand name"
              />
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">Logo</label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => onLogoPick(e.target.files?.[0])}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setDraft((p) => ({ ...p, logoDataUrl: "" }))}
                  disabled={!draft.logoDataUrl}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Theme */}
            <div>
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Theme</h3>
                  <p className="mt-1 text-xs text-slate-500">Use the picker or type hex (#RRGGBB).</p>
                </div>
                <div className="text-xs text-slate-500">
                  Loaded: <span className="font-bold">{settings.siteName}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4">
                <ColorRow k="primary" label="Primary" />
                <ColorRow k="secondary" label="Secondary" />
                <ColorRow k="accent" label="Accent" />
                <ColorRow k="background" label="Background" />
                <ColorRow k="text" label="Text" />
              </div>
            </div>

            {/* Data Upload */}
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Upload CSV / Excel</h3>
              <p className="mt-1 text-xs text-slate-500">
                CSV works instantly. Excel requires <span className="font-mono">xlsx</span> package.
              </p>

              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => handleDataUpload(e.target.files?.[0])}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
              />
            </div>

            <StatusBox />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="rounded-2xl bg-white p-5 shadow-md">
          <h2 className="text-lg font-extrabold text-slate-900">Live Preview</h2>
          <p className="mt-1 text-sm text-slate-600">This preview uses your current draft settings.</p>

          <div
            className="mt-5 overflow-hidden rounded-2xl border border-slate-200"
            style={{ ...previewVars, background: "var(--wl-bg)", color: "var(--wl-text)" }}
          >
            {/* Top bar */}
            <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
              {preview.logoDataUrl ? (
                <img src={preview.logoDataUrl} alt="logo" className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <div
                  className="grid h-10 w-10 place-items-center rounded-xl font-extrabold text-white"
                  style={{ background: "var(--wl-primary)" }}
                >
                  {(preview.siteName?.trim()?.[0] || "W").toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <div className="text-sm font-extrabold">{preview.siteName}</div>
                <div className="text-xs text-slate-500">White-label themed preview</div>
              </div>

              <button
                className="rounded-xl px-4 py-2 text-sm font-extrabold text-white shadow-sm"
                style={{ background: "var(--wl-primary)" }}
              >
                Primary
              </button>
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 shadow-sm">
                Secondary
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              {/* Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-extrabold text-slate-900">Dashboard Card</div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full px-3 py-1 text-xs font-extrabold text-white" style={{ background: "var(--wl-primary)" }}>
                    Primary
                  </span>
                  <span className="rounded-full px-3 py-1 text-xs font-extrabold text-white" style={{ background: "var(--wl-secondary)" }}>
                    Secondary
                  </span>
                  <span className="rounded-full px-3 py-1 text-xs font-extrabold text-white" style={{ background: "var(--wl-accent)" }}>
                    Accent
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  Preview updates instantly when you change name, logo, or theme.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Stat A</div>
                    <div className="text-lg font-extrabold text-slate-900">128</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Stat B</div>
                    <div className="text-lg font-extrabold text-slate-900">42</div>
                  </div>
                </div>
              </div>

              {/* Data preview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-extrabold text-slate-900">Uploaded Data Preview</div>

                {dataPreview.rows.length ? (
                  <div className="mt-3 overflow-auto rounded-xl border border-slate-200">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          {dataPreview.headers.map((h) => (
                            <th key={h} className="whitespace-nowrap px-3 py-2 font-extrabold text-slate-700">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dataPreview.rows.slice(0, 12).map((r, idx) => (
                          <tr key={idx} className="border-t border-slate-100">
                            {dataPreview.headers.map((h) => (
                              <td key={h} className="whitespace-nowrap px-3 py-2 text-slate-700">
                                {String(r[h] ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    Upload a CSV/XLSX to preview rows here.
                  </div>
                )}

                <button
                  className="mt-4 w-full rounded-xl px-4 py-2 text-sm font-extrabold text-white shadow-sm"
                  style={{ background: "var(--wl-accent)" }}
                >
                  Accent Button
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
              Saved settings in localStorage: <span className="font-extrabold text-slate-700">{settings.siteName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
