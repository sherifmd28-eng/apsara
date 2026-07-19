'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/components/ProductCard';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  X, 
  Upload,
  AlertCircle,
  Check
} from 'lucide-react';
import { Product } from '@/lib/db';

const CATEGORIES = [
  'Mobiles & Electronics',
  'Fashion & Apparel',
  'Home & Living',
  'Books & Stationery',
  'Beauty & Personal Care'
];

export default function AdminProductsPage() {
  const { products, refreshProducts } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [stock, setStock] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Custom Spec key-value rows
  const [specs, setSpecs] = useState<Array<{ key: string; val: string }>>([]);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setImage('');
    setCategory(CATEGORIES[0]);
    setStock('');
    setIsFeatured(false);
    setSpecs([]);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setOriginalPrice(prod.originalPrice.toString());
    setImage(prod.image);
    setCategory(prod.category);
    setStock(prod.stock.toString());
    setIsFeatured(prod.isFeatured || false);
    
    // Map specifications object to key-value array rows
    const mappedSpecs = Object.entries(prod.specs || {}).map(([k, v]) => ({ key: k, val: v }));
    setSpecs(mappedSpecs);
    setIsModalOpen(true);
  };

  const handleAddSpec = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    setSpecs([...specs, { key: newSpecKey.trim(), val: newSpecVal.trim() }]);
    setNewSpecKey('');
    setNewSpecVal('');
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !description || !price || !image || !category || !stock) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    // Convert specs array back to Record object
    const specsObject: Record<string, string> = {};
    specs.forEach(s => {
      specsObject[s.key] = s.val;
    });

    const payload = {
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      image,
      category,
      stock: Number(stock),
      isFeatured,
      specs: specsObject,
    };

    try {
      let res;
      if (editingProduct) {
        // Edit Mode
        res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Add Mode
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        setSuccess(editingProduct ? 'Product updated successfully' : 'Product created successfully');
        setIsModalOpen(false);
        await refreshProducts();
      } else {
        setError(data.message || 'Action failed.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product from the database?')) return;
    
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Product deleted successfully.');
        await refreshProducts();
      } else {
        setError(data.message || 'Delete failed.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during deletion.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-xs text-slate-500 font-medium">Add, modify, or delete inventory products.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs py-2 px-5 rounded-xl shadow flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" /> Add Product
        </button>
      </div>

      {/* Alert feeds */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2 text-rose-700 text-xs font-semibold">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-emerald-700 text-xs font-semibold">
          <Check className="h-4.5 w-4.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Products table list */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                <th className="p-4">Item</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Rating</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="font-semibold text-slate-700">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 italic">No products in catalog.</td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    {/* Item cell */}
                    <td className="p-4 flex items-center gap-3">
                      <img src={prod.image} alt="" className="h-10 w-10 object-cover rounded bg-slate-50 border shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 line-clamp-1">{prod.name}</span>
                        <span className="text-[10px] text-slate-400 block font-bold">ID: {prod.id}</span>
                      </div>
                    </td>
                    
                    {/* Category cell */}
                    <td className="p-4">{prod.category.split(' & ')[0]}</td>
                    
                    {/* Price cell */}
                    <td className="p-4 font-bold text-slate-900">{formatINR(prod.price)}</td>
                    
                    {/* Stock cell */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        prod.stock <= 5 
                          ? 'bg-rose-50 text-rose-600' 
                          : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {prod.stock} left
                      </span>
                    </td>

                    {/* Rating cell */}
                    <td className="p-4 flex items-center gap-0.5 text-amber-500 py-6">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      <span className="font-bold text-slate-700">{prod.rating}</span>
                      <span className="text-[10px] text-slate-400">({prod.numReviews})</span>
                    </td>

                    {/* Actions cell */}
                    <td className="p-4 text-center">
                      <div className="inline-flex space-x-2">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD ADD/EDIT MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wide">
                {editingProduct ? 'Modify Product Entry' : 'Create Product Entry'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Product Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pure Linen Mandarin Kurta"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Description *</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a descriptive summary..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Category, Stock, Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-800 cursor-pointer outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Stock Level *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                {/* Featured checkbox */}
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 accent-amber-500"
                  />
                  <label htmlFor="featured" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Featured Recommendation
                  </label>
                </div>
              </div>

              {/* Pricing, Original Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 1299"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Original Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="e.g. 2499 (for crossed-out discounts)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Product Image URL *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-1.5 flex items-center justify-center shrink-0 w-9 h-9">
                    {image ? (
                      <img src={image} alt="" className="h-full w-full object-cover rounded-md" />
                    ) : (
                      <Upload className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Custom Technical Specifications Grid */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Product Specifications</label>
                
                {/* Existing Specs */}
                {specs.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border">
                    {specs.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs font-semibold bg-white border px-2.5 py-1 rounded-lg">
                        <span className="text-slate-800 truncate pr-2"><strong className="text-slate-400 font-bold">{item.key}:</strong> {item.val}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(idx)}
                          className="text-[10px] text-rose-500 hover:text-rose-600 font-bold ml-1.5"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Spec Row */}
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Spec Key (e.g. Brand)"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Spec Value (e.g. Apple)"
                    value={newSpecVal}
                    onChange={(e) => setNewSpecVal(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-3.5 rounded-lg text-xs"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="border-t border-slate-200 pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-5 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold py-2 px-6 rounded-lg text-xs shadow-sm cursor-pointer"
                >
                  {loading ? 'Submitting...' : editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
