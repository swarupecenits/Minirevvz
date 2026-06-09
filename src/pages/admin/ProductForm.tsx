import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, X, Loader } from 'lucide-react';
import { useStore } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import {
  CATEGORIES,
  AVAILABILITY_STATUSES,
  Category,
  AvailabilityStatus } from
'../../lib/constants';
import { uploadProductImage, createProduct, updateProductSupabase, ProductPayload } from '../../lib/supabase';
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
    quantity: '',
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
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (isEditing && existingProduct) {
      setFormData({
        name: existingProduct.name,
        brand: existingProduct.brand,
        category: existingProduct.category,
        price: existingProduct.price.toString(),
        quantity: existingProduct.quantity.toString(),
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
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      setUploadingFiles(Array.from(files));
    }
  };

  const handleUploadImages = async () => {
    if (uploadingFiles.length === 0) return;
    
    try {
      setError('');
      const uploadedUrls: string[] = [];
      
      for (const file of uploadingFiles) {
        const result = await uploadProductImage(file);
        if (result.error) {
          console.error('Upload error:', result.error);
          setError(`Failed to upload ${file.name}: ${result.error.message || result.error}`);
          return;
        }
        if (result.publicUrl) {
          uploadedUrls.push(result.publicUrl);
        }
      }
      
      setImages([...images, ...uploadedUrls]);
      setUploadingFiles([]);
    } catch (err) {
      console.error('Upload exception:', err);
      setError(`Error uploading images: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (images.length === 0) {
      setError('Please add at least one image');
      setIsSubmitting(false);
      return;
    }

    try {
      const productPayload: ProductPayload = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        quantity: parseInt(formData.quantity) || 0,
        description: formData.description,
        short_description: formData.shortDescription,
        images,
        availability: formData.availability,
        is_premium: formData.isPremium,
        scale: formData.scale || null,
        series: formData.series || null,
        year: formData.year || null,
        packaging_condition: formData.packagingCondition || null,
        featured: formData.featured,
        is_new_arrival: formData.isNewArrival,
        ...(!isEditing ? { is_visible: false } : {})
      };

      const localProductData = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        quantity: parseInt(formData.quantity) || 0,
        description: formData.description,
        shortDescription: formData.shortDescription,
        images,
        availability: formData.availability,
        isPremium: formData.isPremium,
        scale: formData.scale || undefined,
        series: formData.series || undefined,
        year: formData.year || undefined,
        packagingCondition: formData.packagingCondition || undefined,
        featured: formData.featured,
        isNewArrival: formData.isNewArrival,
        isVisible: isEditing ? existingProduct?.isVisible === true : false
      };

      if (isEditing && id) {
        // Update in Supabase first, then update local store
        const response = await updateProductSupabase(id, productPayload);
        if (response.error) {
          console.error('Supabase update failed:', response.error);
          setError(`Failed to update product: ${response.error.message}`);
          setIsSubmitting(false);
          return;
        }
        updateProduct(id, localProductData);
      } else {
        // Create in Supabase if available, fallback to local store
        try {
          const response = await createProduct(productPayload);
          if (response.error) {
            console.error('Supabase create failed:', response.error);
            setError(`Failed to save product: ${response.error.message}`);
            setIsSubmitting(false);
            return;
          }
          if (response.data && response.data[0]) {
            addProduct({
              ...localProductData,
              id: response.data[0].id,
              createdAt: response.data[0].created_at
            });
          } else {
            addProduct(localProductData);
          }
        } catch (err) {
          console.warn('Supabase create failed, using local store:', err);
          addProduct(localProductData);
        }
      }

      navigate('/admin/products');
    } catch (err) {
      setError('Failed to save product. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
          title="Go back to products list"
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
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        
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
                placeholder="e.g., Ferrari F40"
                aria-label="Product Name"
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
                placeholder="e.g., Mattel"
                aria-label="Brand"
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
                aria-label="Category"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500">
                
                {CATEGORIES.map((c) =>
                <option key={c} value={c}>
                    {c}
                  </option>
                )}
              </select>
            </div>
            <div>
              <InputLabel>Price (INR) *</InputLabel>
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
                placeholder="0"
                aria-label="Price"
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500" />
              
            </div>
            <div>
              <InputLabel>Available Quantity (Stock) *</InputLabel>
              <input
                required
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: e.target.value
                })
                }
                placeholder="0"
                aria-label="Stock Quantity"
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
                aria-label="Availability Status"
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
            Product Images
          </h2>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/10 rounded-xl p-6">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="imageInput"
                aria-label="Select product images" />
              
              <label
                htmlFor="imageInput"
                className="flex flex-col items-center gap-3 cursor-pointer">
                
                <ImageIcon className="w-8 h-8 text-zinc-400" />
                <div className="text-center">
                  <p className="text-zinc-100 font-medium">
                    Click to select images or drag and drop
                  </p>
                  <p className="text-sm text-zinc-400">
                    PNG, JPG, WebP up to 10MB each
                  </p>
                </div>
              </label>
            </div>

            {uploadingFiles.length > 0 && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  title="Upload selected images to Supabase"
                  variant="secondary"
                  onClick={handleUploadImages}
                  disabled={uploadingFiles.length === 0}>
                  
                  Upload {uploadingFiles.length} Image{uploadingFiles.length !== 1 ? 's' : ''}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setUploadingFiles([])}>
                  Clear
                </Button>
              </div>
            )}
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
                title="Remove this image"
                onClick={() => handleRemoveImage(idx)}
                aria-label={`Remove image ${idx + 1}`}
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
              placeholder="A brief summary for the product card"
              aria-label="Short Description"
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500" />
            
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
              placeholder="Detailed description of the product"
              aria-label="Detailed Description"
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
                placeholder="e.g., 1:64"
                aria-label="Scale"
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
                placeholder="e.g., Hot Wheels Premium"
                aria-label="Series"
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
                placeholder="e.g., 2023"
                aria-label="Year"
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
                placeholder="e.g., Mint on Card"
                aria-label="Packaging Condition"
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:ring-2 focus:ring-zinc-500" />
              
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
            onClick={() => navigate('/admin/products')}
            disabled={isSubmitting}>
            
            Cancel
          </Button>
          <Button type="submit" size="lg" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>);

}