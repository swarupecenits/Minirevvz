import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useStore } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import { upsertAdminProfile } from '../../lib/supabase';
export function Settings() {
  const { settings, updateSettings, seller, setSeller } = useStore();
  const [formData, setFormData] = useState(settings);
  const [profileData, setProfileData] = useState({
    fullName: seller?.fullName || ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);

    if (seller?.email) {
      setSavingProfile(true);
      const { error } = await upsertAdminProfile({
        email: seller.email,
        full_name: profileData.fullName
      });
      setSavingProfile(false);
      if (error) {
        console.error('Profile save error:', error);
      } else {
        setSeller({
          ...seller,
          fullName: profileData.fullName
        });
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  const InputLabel = ({
    htmlFor,
    children
  }: {
    htmlFor?: string;
    children: React.ReactNode;
  }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-300 mb-2">
      {children}
    </label>
  );

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
          <div className="space-y-4">
            <div>
              <InputLabel htmlFor="adminName">Admin Name</InputLabel>
              <input
                id="adminName"
                type="text"
                value={profileData.fullName}
                onChange={(e) =>
                  setProfileData({ ...profileData, fullName: e.target.value })
                }
                aria-label="Admin Name"
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <InputLabel htmlFor="adminEmail">Admin Email</InputLabel>
              <input
                id="adminEmail"
                type="email"
                value={seller?.email ?? ''}
                disabled
                aria-label="Admin Email"
                className="w-full bg-zinc-900/30 border border-white/10 rounded-xl px-4 py-2 text-zinc-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <InputLabel htmlFor="whatsappNumber">WhatsApp Number *</InputLabel>
            <input
              id="whatsappNumber"
              required
              type="text"
              aria-label="WhatsApp Number"
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
            <InputLabel htmlFor="instagramHandle">Instagram Handle</InputLabel>
            <input
              id="instagramHandle"
              type="text"
              aria-label="Instagram Handle"
              value={formData.instagram}
              onChange={(e) =>
              setFormData({
                ...formData,
                instagram: e.target.value
              })
              }
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500"
              placeholder="@minirevvz" />
            
          </div>

          <div>
            <InputLabel htmlFor="contactEmail">Contact Email</InputLabel>
            <input
              id="contactEmail"
              type="email"
              aria-label="Contact Email"
              value={formData.email}
              onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value
              })
              }
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500"
              placeholder="store@example.com" />
            
          </div>

          <div>
            <InputLabel htmlFor="storeLocation">Store Location</InputLabel>
            <input
              id="storeLocation"
              type="text"
              aria-label="Store Location"
              value={formData.location}
              onChange={(e) =>
              setFormData({
                ...formData,
                location: e.target.value
              })
              }
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500"
              placeholder="Delhi, India" />
            
          </div>

          <div>
            <InputLabel htmlFor="businessHours">Business Hours</InputLabel>
            <input
              id="businessHours"
              type="text"
              aria-label="Business Hours"
              value={formData.businessHours}
              onChange={(e) =>
              setFormData({
                ...formData,
                businessHours: e.target.value
              })
              }
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500"
              placeholder="Mon–Sat, 10am–8pm" />
            
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