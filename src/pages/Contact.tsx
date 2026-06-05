import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Instagram, Mail, MapPin, Clock } from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { buildWhatsAppUrl } from '../lib/whatsapp';
export function Contact() {
  const { settings } = useStore();
  const handleWhatsAppClick = () => {
    const url = buildWhatsAppUrl(
      settings.whatsappNumber,
      'Hi, I have a question about your store.'
    );
    window.open(url, '_blank');
  };
  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="text-center mb-16">
        
        <h1 className="text-4xl md:text-5xl font-display font-bold text-zinc-100 mb-6">
          Get in Touch
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Have a question about a specific model? Looking for something rare?
          We're always happy to chat with fellow collectors.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{
            opacity: 0,
            x: -20
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          className="glass-panel p-8 rounded-3xl flex flex-col justify-center items-center text-center">
          
          <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-6">
            <MessageCircle className="w-8 h-8 text-[#25D366]" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-4">Chat with Us</h2>
          <p className="text-zinc-400 mb-8">
            The fastest way to reach us is directly through WhatsApp. We usually
            reply within a few hours.
          </p>
          <Button
            size="lg"
            variant="whatsapp"
            onClick={handleWhatsAppClick}
            className="w-full">
            
            <MessageCircle className="w-5 h-5 mr-2" />
            Message on WhatsApp
          </Button>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            x: 20
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          className="glass-panel p-8 rounded-3xl space-y-8">
          
          <h2 className="text-2xl font-display font-bold mb-6">
            Store Details
          </h2>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
              <Instagram className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h4 className="font-medium text-zinc-200">Instagram</h4>
              <p className="text-zinc-400">{settings.instagram}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-zinc-200">Email</h4>
              <p className="text-zinc-400">{settings.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h4 className="font-medium text-zinc-200">Location</h4>
              <p className="text-zinc-400">{settings.location}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-medium text-zinc-200">Business Hours</h4>
              <p className="text-zinc-400">{settings.businessHours}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>);

}