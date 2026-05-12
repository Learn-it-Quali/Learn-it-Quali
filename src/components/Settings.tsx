import { useState, useRef } from 'react';
import { AppData } from '../types';
import { exportData, importData } from '../store';
import { Download, Upload, Check, Copy, Info, Shield } from 'lucide-react';

interface SettingsProps {
  data: AppData;
  onUpdateData: (data: AppData) => void;
  onLogout: () => void;
  onBack: () => void;
}

export default function Settings({ data, onUpdateData, onLogout, onBack }: SettingsProps) {
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportedJson = exportData(data);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportedJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShowExport(true);
    }
  };

  const handleImport = () => {
    const imported = importData(importText);
    if (imported) {
      onUpdateData(imported);
      setImportError(false);
      setShowImport(false);
      setImportText('');
    } else {
      setImportError(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const blob = new Blob([exportedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learnit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-sm font-medium">
          ← Zurück
        </button>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          ⚙️ Einstellungen
        </h1>
        <div />
      </div>

      {/* Data Sync Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Daten synchronisieren</h3>
            <p className="text-indigo-200 text-sm">Übertrage deine Daten zwischen Geräten</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-indigo-200 text-sm mt-2">
          <Info className="w-4 h-4" />
          <span>Exportiere deine Daten und importiere sie auf einem anderen Gerät</span>
        </div>
      </div>

      {/* Export */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-indigo-500" /> Daten exportieren
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Exportiere alle deine Daten ({data.quizzes.length} Quizzes, {data.flashcardDecks.length} Kartendecks, {data.notes.length} Notizen) als JSON-Datei.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDownload} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all shadow-lg flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Datei herunterladen
          </button>
          <button onClick={handleCopy} className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Kopiert!' : 'Kopieren'}
          </button>
        </div>
        <button onClick={() => setShowExport(!showExport)} className="text-sm text-indigo-500 hover:text-indigo-600 font-medium">
          {showExport ? 'Code ausblenden ▲' : 'Code anzeigen ▼'}
        </button>
        {showExport && (
          <textarea
            readOnly
            value={exportedJson}
            className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl text-xs text-gray-600 dark:text-gray-400 font-mono resize-none"
          />
        )}
      </div>

      {/* Import */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-emerald-500" /> Daten importieren
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Importiere Daten von einem anderen Gerät. Achtung: Dies ersetzt alle aktuellen Daten!
        </p>
        <div className="flex gap-3">
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" /> Datei hochladen
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          <button onClick={() => setShowImport(!showImport)} className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            Code einfügen
          </button>
        </div>
        {showImport && (
          <div className="space-y-3">
            <textarea
              value={importText}
              onChange={e => { setImportText(e.target.value); setImportError(false); }}
              placeholder="JSON-Code hier einfügen..."
              className={`w-full h-32 p-3 bg-gray-50 dark:bg-gray-900 border rounded-xl text-xs font-mono resize-none text-gray-900 dark:text-white placeholder-gray-400 ${
                importError ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'
              }`}
            />
            {importError && <p className="text-red-500 text-sm">❌ Ungültige Daten. Bitte überprüfe den Code.</p>}
            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl disabled:opacity-30 hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" /> Daten importieren
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          📊 Deine Statistiken
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{data.quizzes.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Quizzes</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{data.flashcardDecks.reduce((a, d) => a + d.cards.length, 0)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Karteikarten</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{data.notes.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Notizen</p>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{data.studySessions.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Lern-Sessions</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-lg"
      >
        🚪 Ausloggen
      </button>

      {/* Footer */}
      <div className="text-center py-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-full border border-emerald-200 dark:border-emerald-800">
          <span className="text-sm">💎</span>
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">von Michi Bombe gemacht</span>
          <span className="text-sm">💎</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">LearnIt v2.0 – Deine Lernplattform 🔒</p>
      </div>
    </div>
  );
}
