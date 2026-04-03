import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { MotionDiv } from '../ui-bits/Motion';
import { SupabaseService } from '../../lib/supabaseService';

export default function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const supabaseProjects = await SupabaseService.getProjects();
        setProjects(supabaseProjects.slice(0, 5)); // Show max 5 recent projects
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects([]);
      }
    };
    loadProjects();
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((s) => !s); }}
        className="relative p-2 rounded-md hover:bg-white/10 dark:hover:bg-gray-700 transition-colors focus-visible:ring-2 focus-visible:ring-nee-500"
        aria-expanded={open}
        aria-label="Open notifications"
      >
        <span className="sr-only">Open notifications</span>
        <div className="w-8 h-8 rounded-full bg-nee-400 dark:bg-nee-600 flex items-center justify-center text-white shadow-sm">🔔</div>
      </button>

      {open && (
        <MotionDiv
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-gray-900/85 readable-surface shadow-2xl rounded-xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden z-50"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="font-semibold text-gray-900 dark:text-gray-100">Recent Projects</div>
            <button onClick={() => setOpen(false)} className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 max-h-64 overflow-auto space-y-2">
            {projects.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No projects yet
              </div>
            ) : (
              projects.map((p) => (
                <div key={p.id} className="flex items-start space-x-3 py-2 border-b last:border-b-0 border-gray-100 dark:border-gray-800">
                  <div className="w-10 h-10 bg-nee-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-nee-700 dark:text-nee-300 font-semibold shadow-sm">
                    {p.name?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{p.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {p.location || p.state_name || 'No location'} • {p.status || 'pending'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </MotionDiv>
      )}
    </div>
  );
}
