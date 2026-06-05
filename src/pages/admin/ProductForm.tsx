import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { useStore } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import {
  CATEGORIES,
  AVAILABILITY_STATUSES,
  Category,
  AvailabilityStatus } from
'../../lib/constants';
export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct } = useStore();
  const isEditing = Boolean(id);
  const existingProduct = isEditing ? products.find((p) => p.id === id) : null;
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: CATEGORIES[0] as Category,
    price: '',
    availability: AVAILABILITY_STATUSES[0] as AvailabilityStatus,
    shortDescription: '',
    description: '',
    scale: '',
    series: '',
    year: '',
    packagingCondition: '',
    featured: false,
    isNewArrival: false,
    isPremium: false
  });
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  useEffect(() => {
    if (isEditing && existingProduct) {
      setFormData({
        name: existingProduct.name,
        brand: existingProduct.brand,
        category: existingProduct.category,
        price: existingProduct.price.toString(),
        availability: existingProduct.availability,
        shortDescription: existingProduct.shortDescription,
        description: existingProduct.description,
        scale: existingProduct.scale || '',
        series: existingProduct.series || '',
        year: existingProduct.year || '',
        packagingCondition: existingProduct.packagingCondition || '',
        featured: existingProduct.featured,
        isNewArrival: existingProduct.isNewArrival,
        isPremium: existingProduct.isPremium
      });
      setImages(existingProduct.images);
    }
  }, [isEditing, existingProduct]);
  const handleAddImage = () => {
    if (newImageUrl && !images.includes(newImageUrl)) {
      setImages([...images, newImageUrl]);
      setNewImageUrl('');
    }
  };
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      images:
      images.length > 0 ?
      images :
      [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800']

    };
    if (isEditing && id) {
      updateProduct(id, productData);
    } else {
      addProduct(productData);
    }
    navigate('/admin/products');
  };
  const InputLabel = ({ children }: {children: React.ReactNode;}) =>
  <label className="block text-sm font-medium text-zinc-300 mb-2">
      {children}
    </label>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 text-zinc-400 hover:text-zinc-100 bg-white/5 rounded-xl transition-colors">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-100">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-display font-semibold border-b border-white/10 pb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InputLabel>Product Name *</InputLabel>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value
                })
                }
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500" />
              
            </div>
            <div>
              <InputLabel>Brand *</InputLabel>
              <input
                required
                type="text"
                value={formData.brand}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  brand: e.target.value
                })
                }
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500" />
              
            </div>
            <div>
              <InputLabel>Category *</InputLabel>
              <select
                value={formData.category}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as Category
                })
                }
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500">
                
                {CATEGORIES.map((c) =>
                <option key={c} value={c}>
                    {c}
                  </option>
                )}
              </select>
            </div>
            <div>
              <InputLabel>Price (USD) *</InputLabel>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  price: e.target.value
                })
                }
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500" />
              
            </div>
            <div>
              <InputLabel>Availability Status *</InputLabel>
              <select
                value={formData.availability}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  availability: e.target.value as AvailabilityStatus
                })
                }
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500">
                
                {AVAILABILITY_STATUSES.map((s) =>
                <option key={s} value={s}>
                    {s}
                  </option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-display font-semibold border-b border-white/10 pb-4">
            Images
          </h2>

          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste image URL (e.g., Unsplash link)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1 bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500" />
            
            <Button type="button" variant="secondary" onClick={handleAddImage}>
              Add Image
            </Button>
          </div>

          {images.length > 0 ?
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {images.map((img, idx) =>
            <div
              key={idx}
              className="relative aspect-square rounded-xl overflow-hidden group border border-white/10">
              
                  <img
                src={img}
                alt=""
                className="w-full h-full object-cover" />
              
                  <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                
                    <X className="w-4 h-4" />
                  </button>
                </div>
            )}
            </div> :

          <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl text-zinc-500">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No images added yet.</p>
            </div>
          }
        </div>

        {/* Details */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-display font-semibold border-b border-white/10 pb-4">
            Product Details
          </h2>

          <div>
            <InputLabel>Short Description *</InputLabel>
            <input
              required
              type="text"
              value={formData.shortDescription}
              onChange={(e) =>
              setFormData({
                ...formData,
                shortDescription: e.target.value
              })
              }
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500"
              placeholder="A brief summary for the product card" />
            
          </div>

          <div>
            <InputLabel>Detailed Description *</InputLabel>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value
              })
              }
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500" />
            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InputLabel>Scale (e.g., 1:64)</InputLabel>
              <input
                type="text"
                value={formData.scale}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  scale: e.target.value
                })
                }
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500" />
              
            </div>
            <div>
              <InputLabel>Series</InputLabel>
              <input
                type="text"
                value={formData.series}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  series: e.target.value
                })
                }
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500" />
              
            </div>
            <div>
              <InputLabel>Year</InputLabel>
              <input
                type="text"
                value={formData.year}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  year: e.target.value
                })
                }
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500" />
              
            </div>
            <div>
              <InputLabel>Packaging Condition</InputLabel>
              <input
                type="text"
                value={formData.packagingCondition}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  packagingCondition: e.target.value
                })
                }
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500"
                placeholder="e.g., Mint on Card" />
              
            </div>
          </div>
        </div>

        {/* Visibility Toggles */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-xl font-display font-semibold border-b border-white/10 pb-4">
            Visibility & Badges
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  featured: e.target.checked
                })
                }
                className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-zinc-100 focus:ring-zinc-500" />
              
              <span className="text-zinc-300">
                Featured Product (Shows on Home Page)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNewArrival}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  isNewArrival: e.target.checked
                })
                }
                className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-zinc-100 focus:ring-zinc-500" />
              
              <span className="text-zinc-300">Mark as New Arrival</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPremium}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  isPremium: e.target.checked
                })
                }
                className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-zinc-100 focus:ring-zinc-500" />
              
              <span className="text-zinc-300">Premium Collection</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/products')}>
            
            Cancel
          </Button>
          <Button type="submit" size="lg">
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>);

}