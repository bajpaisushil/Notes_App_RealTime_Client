import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { PlusCircle, Search, Filter } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import NoteCard from '../components/NoteCard';
import NoteForm from '../components/NoteForm';

interface Note {
  _id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardProps {
  socket: any;
}

const Dashboard: React.FC<DashboardProps> = ({ socket }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<string[]>(['General']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Debounce search
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      fetchNotes(query, selectedCategory);
    }, 500),
    [selectedCategory]
  );

  // Fetch notes
  const fetchNotes = async (query = searchQuery, category = selectedCategory) => {
    try {
      setIsLoading(true);
      let url = `${apiUrl}/api/notes`;
      
      if (query || category !== 'All') {
        url = `${apiUrl}/api/notes/search?query=${query}`;
        if (category !== 'All') {
          url += `&category=${category}`;
        }
      }
      
      const response = await axios.get(url);
      setNotes(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch notes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/notes/categories`);
      setCategories(['General', ...response.data.filter((cat: string) => cat !== 'General')]);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchNotes();
    fetchCategories();
    
    // Join socket room
    if (user) {
      socket.emit('join', user._id);
    }
    
    // Socket event listeners
    socket.on('noteCreated', (newNote: Note) => {
      setNotes(prevNotes => [newNote, ...prevNotes]);
    });
    
    socket.on('noteUpdated', (updatedNote: Note) => {
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note._id === updatedNote._id ? updatedNote : note
        )
      );
    });
    
    socket.on('noteDeleted', (deletedNoteId: string) => {
      setNotes(prevNotes => 
        prevNotes.filter(note => note._id !== deletedNoteId)
      );
    });
    
    return () => {
      socket.off('noteCreated');
      socket.off('noteUpdated');
      socket.off('noteDeleted');
    };
  }, [user, socket]);

  // Handle search input change
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Handle category filter change
  useEffect(() => {
    fetchNotes(searchQuery, selectedCategory);
  }, [selectedCategory]);

  // Create note
  const handleCreateNote = async (noteData: { title: string; content: string; category: string }) => {
    try {
      await axios.post(`${apiUrl}/api/notes`, noteData);
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      console.error('Failed to create note', err);
    }
  };

  // Update note
  const handleUpdateNote = async (noteData: { title: string; content: string; category: string }) => {
    if (!editingNote) return;
    
    try {
      await axios.put(`${apiUrl}/api/notes/${editingNote._id}`, noteData);
      setEditingNote(null);
      fetchCategories();
    } catch (err) {
      console.error('Failed to update note', err);
    }
  };

  // Delete note
  const handleDeleteNote = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await axios.delete(`${apiUrl}/api/notes/${id}`);
    } catch (err) {
      console.error('Failed to delete note', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Notes</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingNote(null);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={18} className="mr-2" />
          New Note
        </button>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 pr-4 py-2 w-full rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
        
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-gray-400" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`pl-10 pr-4 py-2 w-full rounded-md border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Note Form */}
      {(showForm || editingNote) && (
        <NoteForm
          initialData={editingNote || undefined}
          onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
          onCancel={() => {
            setShowForm(false);
            setEditingNote(null);
          }}
          categories={categories}
        />
      )}
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Notes Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={setEditingNote}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      ) : (
        <div className={`text-center py-12 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}>
          <p className="text-xl font-medium mb-2">No notes found</p>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchQuery || selectedCategory !== 'All'
              ? 'Try changing your search or filter'
              : 'Create your first note by clicking the "New Note" button'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;