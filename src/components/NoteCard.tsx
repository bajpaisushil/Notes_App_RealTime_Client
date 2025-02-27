import React, { useContext } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import ThemeContext from '../context/ThemeContext';

interface Note {
  _id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
  const { darkMode } = useContext(ThemeContext);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold truncate">{note.title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
            {note.category}
          </span>
        </div>
        
        <div className="mb-4">
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-3`}>
            {note.content || <span className="italic text-gray-400">No content</span>}
          </p>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span>Updated: {formatDate(note.updatedAt)}</span>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(note)}
              className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              aria-label="Edit note"
            >
              <Edit size={16} className="text-blue-500" />
            </button>
            <button
              onClick={() => onDelete(note._id)}
              className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              aria-label="Delete note"
            >
              <Trash2 size={16} className="text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;