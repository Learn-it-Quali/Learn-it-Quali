import { useState } from 'react';
import { Note, SUBJECTS } from '../types';
import { generateId } from '../store';
import { Plus, Trash2, Save, Search } from 'lucide-react';

// ==================== NOTES LIST ====================
interface NotesListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onCreate: () => void;
  onBack: () => void;
}

const noteColors = [
  { name: 'Gelb', value: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700', dot: 'bg-yellow-400' },
  { name: 'Blau', value: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700', dot: 'bg-blue-400' },
  { name: 'Grün', value: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700', dot: 'bg-emerald-400' },
  { name: 'Pink', value: 'bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-700', dot: 'bg-pink-400' },
  { name: 'Lila', value: 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700', dot: 'bg-purple-400' },
];

export function NotesList({ notes, onEdit, onDelete, onCreate, onBack }: NotesListProps) {
  const [search, setSearch] = useState('');

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-sm font-medium">
          ← Zurück
        </button>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          📝 Notizen
        </h1>
        <div />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Notizen durchsuchen..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <button onClick={onCreate} className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg flex items-center gap-2">
          <Plus className="w-5 h-5" /> Neu
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl">📝</span>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mt-4">
            {notes.length === 0 ? 'Noch keine Notizen' : 'Keine Ergebnisse'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {notes.length === 0 ? 'Schreibe deine erste Notiz!' : 'Versuche einen anderen Suchbegriff'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(note => {
            const color = noteColors.find(c => c.name === note.color) || noteColors[0];
            return (
              <div
                key={note.id}
                onClick={() => onEdit(note)}
                className={`p-5 rounded-2xl border-2 cursor-pointer hover:shadow-lg transition-all group ${color.value}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{note.title || 'Ohne Titel'}</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                    className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/50 dark:hover:bg-black/20 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-4 whitespace-pre-wrap">{note.content || 'Leere Notiz...'}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                  {new Date(note.updatedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==================== NOTE EDITOR ====================
interface NoteEditorProps {
  existingNote: Note | null;
  onSave: (note: Note) => void;
  onCancel: () => void;
}

export function NoteEditor({ existingNote, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [color, setColor] = useState(existingNote?.color || 'Gelb');
  const [subject, setSubject] = useState(existingNote?.subject || '');

  const handleSave = () => {
    onSave({
      id: existingNote?.id || generateId(),
      title: title.trim() || 'Ohne Titel',
      content: content,
      color,
      subject,
      createdAt: existingNote?.createdAt || Date.now(),
      updatedAt: Date.now(),
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-sm font-medium">
          ← Zurück
        </button>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">
          {existingNote ? 'Notiz bearbeiten' : 'Neue Notiz'} ✏️
        </h1>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Speichern
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Titel..."
          className="w-full px-5 py-4 text-xl font-bold bg-transparent border-b border-gray-100 dark:border-gray-700 outline-none text-gray-900 dark:text-white placeholder-gray-400"
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Schreibe deine Notiz..."
          rows={15}
          className="w-full px-5 py-4 bg-transparent outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none leading-relaxed"
          autoFocus
        />
      </div>

      {/* Subject selector */}
      <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
        {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
      </select>

      {/* Color selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Farbe:</span>
        {noteColors.map(c => (
          <button
            key={c.name}
            onClick={() => setColor(c.name)}
            className={`w-8 h-8 rounded-full ${c.dot} transition-all ${
              color === c.name ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110' : 'hover:scale-110'
            }`}
            title={c.name}
          />
        ))}
      </div>
    </div>
  );
}
