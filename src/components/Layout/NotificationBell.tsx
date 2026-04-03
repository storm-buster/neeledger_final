import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { mockNotifications } from '../../data/mockData';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  const total = mockNotifications.slice(0, 2).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen((s) => !s)} className="relative p-2 rounded hover:bg-gray-100">
        <Bell className="w-5 h-5 text-nee-800" />
        {total > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">{total}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="font-medium">Notifications</div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {mockNotifications
              .slice()
              .sort((a, b) => Date.parse(b.timestamp as unknown as string) - Date.parse(a.timestamp as unknown as string))
              .slice(0, 2)
              .map((n) => (
                <div key={n.id} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{n.message}</div>
                      <div className="text-xs text-gray-500">{n.count} · {new Date(n.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="p-2 text-center text-xs text-gray-500 border-t">This is a demo notification list</div>
        </div>
      )}
    </div>
  );
}
