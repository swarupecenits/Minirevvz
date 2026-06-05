import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useStore } from '../../lib/store';
import { Button } from '../../components/ui/Button';
export function Settings() {
  const { settings, updateSettings } = useStore();
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  const InputLabel = ({ children }: {children: React.ReactNode;}) =>
  <label className="block text-sm font-medium text-zinc-300 mb-2">
      {children}
    </label>;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-zinc-100 mb-2">
          Store Settings
        </h1>
        <p className="text-zinc-400">
          Manage your contact information and store details.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-panel p-6 rounded-2xl space-y-6">
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <InputLabel>WhatsApp Number *</InputLabel>
            <input
              required
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) =>
              setFormData({
                ...formData,
                whatsappNumber: e.target.value
              })
              }
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500"
              placeholder="e.g. 15551234567 (Include country code, no + or spaces)" />
            
            <p className="text-xs text-zinc-500 mt-2">
              This number will receive all "Buy on WhatsApp" messages.
            </p>
          </div>

          <div>
            <InputLabel>Instagram Handle</InputLabel>
            <input
              type="text"
              value={formData.instagram}
              onChange={(e) =>
              setFormData({
                ...formData,
                instagram: e.target.value
              })
              }
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500" />
            
          </div>

          <div>
            <InputLabel>Contact Email</InputLabel>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value
              })
              }
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500" />
            
          </div>

          <div>
            <InputLabel>Store Location</InputLabel>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
              setFormData({
                ...formData,
                location: e.target.value
              })
              }
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500" />
            
          </div>

          <div>
            <InputLabel>Business Hours</InputLabel>
            <input
              type="text"
              value={formData.businessHours}
              onChange={(e) =>
              setFormData({
                ...formData,
                businessHours: e.target.value
              })
              }
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500" />
            
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-emerald-400 text-sm font-medium">
            {saved && 'Settings saved successfully!'}
          </div>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>);

}