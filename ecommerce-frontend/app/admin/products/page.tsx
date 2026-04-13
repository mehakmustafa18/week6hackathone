'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Plus, Search, Edit2, Trash2, Sliders, Coins, Eye, Upload, X } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import styles from '../admin.module.css';

interface ColorVariant {
  name: string;
  hex: string;
  file?: File | null;
  imageUrl?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  purchaseType: string;
  isOnSale: boolean;
  salePrice?: number;
  pointsPrice?: number;
  images: string[];
  colors: { name: string; hex: string; imageUrl: string }[];
  sizes: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const PRESET_SIZES = ['XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large'];

  // Form State for Adding/Editing
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'T-shirts',
    stock: 50,
    purchaseType: 'money',
    pointsPrice: 0,
    isOnSale: false,
    salePrice: 0,
    displaySection: 'none',
    sizes: ['Small', 'Medium', 'Large', 'X-Large'] as string[],
  });

  const [colors, setColors] = useState<ColorVariant[]>([
    { name: '', hex: '#000000', file: null }
  ]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/products?limit=100');
      setProducts(data.products);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    let parsedValue: any = value;
    
    if (type === 'checkbox') {
      parsedValue = checked;
    } else if (type === 'number') {
      parsedValue = value === '' ? '' : parseFloat(value);
      if (isNaN(parsedValue)) parsedValue = '';
    }

    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };

  const handleSizeToggle = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) 
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const COLOR_MAP: Record<string, string> = {
    black: '#000000', white: '#ffffff', red: '#e53935', green: '#43a047',
    blue: '#1e88e5', navy: '#1a237e', orange: '#fb8c00', yellow: '#fdd835',
    pink: '#e91e63', purple: '#8e24aa', brown: '#6d4c41', grey: '#757575',
    gray: '#757575', olive: '#827717', teal: '#00838f', maroon: '#880e4f',
    beige: '#d7ccc8', khaki: '#c0b283', cream: '#fffdd0', coral: '#ff7043',
    mint: '#a5d6a7', lavender: '#ce93d8', gold: '#ffc107', silver: '#b0bec5',
    cyan: '#00bcd4', indigo: '#3949ab', violet: '#7b1fa2', magenta: '#d81b60',
  };

  const addColorVariant = () => {
    setColors([...colors, { name: '', hex: '#3e3e3e', file: null }]);
  };

  const removeColorVariant = (index: number) => {
    if (colors.length > 1) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  const updateColor = (index: number, field: keyof ColorVariant, value: any) => {
    const newColors = [...colors];
    if (field === 'name') {
      // Auto-suggest hex from common color names
      const lower = (value as string).toLowerCase().trim();
      const autoHex = COLOR_MAP[lower];
      newColors[index] = { ...newColors[index], name: value, ...(autoHex ? { hex: autoHex } : {}) };
    } else {
      newColors[index] = { ...newColors[index], [field]: value };
    }
    setColors(newColors);
  };

  const uploadToCloudinary = async (file: File) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'ecommerce'); // specific preset
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/du6zpscb8/image/upload`, {
      method: 'POST',
      body: data
    });
    
    if (!response.ok) throw new Error('Failed to upload image');
    const result = await response.json();
    return result.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that ALL colors have a file
    for (let c of colors) {
      if (!c.name || !c.file) {
        toast.error('Please provide a name and image for all color variants.');
        return;
      }
    }

    setIsUploading(true);
    try {
      const dbColors = [];
      const dbImages = [];

      for (let c of colors) {
        const imageUrl = await uploadToCloudinary(c.file!);
        dbColors.push({
          name: c.name,
          hex: c.hex,
          imageUrl
        });
        dbImages.push(imageUrl); // Push to main images fallback
      }

      const payload = {
        ...formData,
        colors: dbColors,
        images: dbImages // Fallback for components that just iterate images
      };

      await api.post('/products', payload);
      toast.success('Product added successfully!');
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Failed to create product. Check sizes or images.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', price: 0, category: 'T-shirts', stock: 50,
      purchaseType: 'money', pointsPrice: 0, isOnSale: false, salePrice: 0,
      displaySection: 'none',
      sizes: ['Small', 'Medium', 'Large', 'X-Large']
    });
    setColors([{ name: '', hex: '#000000', file: null }]);
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Products Management</h1>
        <button className="btn-black" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Add New Product
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.search}>
          <Search size={20} color="#666" />
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.recentTable}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Fetching products...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>No products found.</td></tr>
            ) : filteredProducts.map((product) => (
              <tr key={product._id}>
                <td>
                  <img 
                    src={product.colors?.[0]?.imageUrl || product.images?.[0] || 'https://via.placeholder.com/50'} 
                    alt="product" 
                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                </td>
                <td style={{ fontWeight: 700 }}>
                  {product.name}
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    {product.colors?.map(c => (
                      <div key={c.name} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c.hex, border: '1px solid #ccc' }} title={c.name} />
                    ))}
                  </div>
                </td>
                <td>
                    <span className="tag-gray">{product.category}</span>
                </td>
                <td>
                    {product.isOnSale ? (
                        <div>
                             <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8rem' }}>${product.price}</span>
                             <br />
                             <span style={{ color: '#e53935' }}>${product.salePrice}</span>
                        </div>
                    ) : `$${product.price}`}
                </td>
                <td>
                    <span style={{ color: product.stock < 10 ? '#e53935' : 'inherit', fontWeight: product.stock < 10 ? 700 : 400 }}>
                        {product.stock}
                    </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={styles.iconBtn} onClick={() => window.location.href=`/shop/${product._id}`} title="View"><Eye size={18} /></button>
                    <button className={styles.iconBtn} title="Edit"><Edit2 size={18} /></button>
                    <button className={styles.iconBtn} style={{ color: '#e53935' }} onClick={() => deleteProduct(product._id)} title="Delete"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0 }}>Create New Product</h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: '#f5f5f5', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formSection}>
                <h3><Sliders size={18} /> Basic Information</h3>
                <div className={styles.inputGroup}>
                  <label>Product Name</label>
                  <input name="name" required value={formData.name} onChange={handleInputChange} placeholder="e.g. Classic Oversized Hoodie" />
                </div>
                
                <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
                  <label>Description</label>
                  <textarea name="description" required value={formData.description} onChange={handleInputChange} rows={3} placeholder="Tell your customers about this item..." />
                </div>

                <div className={styles.inputGrid} style={{ marginTop: '1rem' }}>
                    <div className={styles.inputGroup}>
                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange}>
                        <option>T-shirts</option>
                        <option>Shorts</option>
                        <option>Shirts</option>
                        <option>Hoodie</option>
                        <option>Jeans</option>
                        <option>Accessories</option>
                    </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Display Section</label>
                        <select name="displaySection" value={formData.displaySection} onChange={handleInputChange}>
                            <option value="none">Default (None)</option>
                            <option value="new-arrivals">New Arrivals</option>
                            <option value="top-selling">Top Selling</option>
                        </select>
                    </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3><Coins size={18} /> Pricing & Inventory</h3>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label>Base Price ($)</label>
                    <input type="number" name="price" required value={formData.price} onChange={handleInputChange} step="0.01" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Initial Stock</label>
                    <input type="number" name="stock" required value={formData.stock} onChange={handleInputChange} />
                  </div>
                </div>

                <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
                  <label>Purchase Type</label>
                  <select name="purchaseType" value={formData.purchaseType} onChange={handleInputChange}>
                    <option value="money">Money Only</option>
                    <option value="points">Points Only</option>
                    <option value="hybrid">Hybrid (Money or Points)</option>
                  </select>
                </div>

                {formData.purchaseType !== 'money' && (
                    <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
                        <label>Loyalty Points Price</label>
                        <input type="number" name="pointsPrice" value={formData.pointsPrice} onChange={handleInputChange} placeholder="e.g. 500" />
                    </div>
                )}

                <div className={styles.checkboxGroup} style={{ marginTop: '1.25rem', padding: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
                    <input type="checkbox" name="isOnSale" checked={formData.isOnSale} onChange={handleInputChange} id="isOnSale" />
                    <label htmlFor="isOnSale" style={{ cursor: 'pointer', flex: 1 }}>Set this product on Sale</label>
                    {formData.isOnSale && (
                        <div style={{ width: '120px' }}>
                            <input type="number" name="salePrice" value={formData.salePrice} onChange={handleInputChange} placeholder="Sale $" style={{ padding: '4px 8px' }} />
                        </div>
                    )}
                </div>
              </div>

              <div className={styles.formSection}>
                <h3><Sliders size={18} /> Size Variants</h3>
                <div className={styles.sizeGrid}>
                  {PRESET_SIZES.map(size => (
                    <button 
                      type="button"
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`${styles.sizeBtn} ${formData.sizes.includes(size) ? styles.sizeBtnActive : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className={styles.formSection}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0 }}><Upload size={18} /> Color Variants & Images</h3>
                    <button type="button" onClick={addColorVariant} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#000', color: '#fff', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                      <Plus size={16} /> Add Variant
                    </button>
                 </div>

                 {colors.map((color, index) => (
                   <div key={index} className={styles.variantCard}>
                      <div className={styles.inputGroup} style={{ flex: 1, marginBottom: 0 }}>
                        <label>Color</label>
                        <input value={color.name} onChange={(e) => updateColor(index, 'name', e.target.value)} required placeholder="e.g. Olive" />
                      </div>
                      <div className={styles.inputGroup} style={{ width: '44px', marginBottom: 0 }}>
                        <label>Hex</label>
                        <input type="color" value={color.hex} onChange={(e) => updateColor(index, 'hex', e.target.value)} className={styles.colorPicker} />
                      </div>
                      <div className={styles.inputGroup} style={{ flex: 1.5, marginBottom: 0 }}>
                        <label>Product Image</label>
                        <div className={styles.uploadArea}>
                            <Upload size={18} color="#999" />
                            <span style={{ fontSize: '0.75rem', marginLeft: '8px', color: '#666' }}>
                                {color.file ? color.file.name : 'Choose Image'}
                            </span>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                    updateColor(index, 'file', e.target.files[0]);
                                    }
                                }}
                            />
                        </div>
                      </div>
                      <button type="button" onClick={() => removeColorVariant(index)} style={{ color: '#e53935', background: 'transparent', border: 'none', cursor: 'pointer', alignSelf: 'center', marginTop: '16px' }}>
                         <Trash2 size={20} />
                      </button>
                   </div>
                 ))}
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn} disabled={isUploading}>Cancel</button>
                <button type="submit" className="btn-black" style={{ padding: '0.75rem 2rem' }} disabled={isUploading}>
                  {isUploading ? 'Finalizing...' : 'Launch Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
