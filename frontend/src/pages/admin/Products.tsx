import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminService, productService } from '../../services/api';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<any>({
    name: '',
    description: '',
    price: 0,
    original_price: 0,
    image: '',
    category_id: undefined,
    brand: '',
    rating: 0,
    stock: 0,
  });

  const load = async (category?: string) => {
    const params = category ? { category } : undefined;
    const res = await productService.getProducts(params as any);
    setProducts(res.data.products || []);
  };
  const loadCats = async () => {
    const res = await productService.getCategories();
    setCategories(res.data || []);
  };

  useEffect(()=>{ load(); loadCats(); }, []);

  useEffect(()=>{ load(filterCategory || undefined); }, [filterCategory]);

  const create = async () => {
    // normalize numeric fields
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      original_price: parseFloat(form.original_price) || 0,
      rating: parseFloat(form.rating) || 0,
      stock: parseInt(form.stock, 10) || 0,
      category_id: form.category_id ? parseInt(form.category_id, 10) : undefined,
    };
    await adminService.createProduct(payload);
    setForm({ name: '', description: '', price: 0, original_price: 0, image: '', category_id: undefined, brand: '', rating: 0, stock: 0 });
    load(filterCategory || undefined);
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <div className="mb-4 flex items-center gap-4">
        <div>
          <label className="block text-sm text-gray-600">Filter by category</label>
          <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="border p-2">
            <option value="">All Categories</option>
            {categories.map(c => (<option key={c.id} value={c.name}>{c.name}</option>))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-green-600 text-white px-4 py-2 rounded mb-2"
          >
            Add New Product
          </button>
        )}
        {showCreate && (
          <div className="border p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Create New Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Name</label>
                <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="Name" className="border p-2 w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Brand</label>
                <input value={form.brand} onChange={e=>setForm({...form, brand: e.target.value})} placeholder="Brand" className="border p-2 w-full" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} placeholder="Description" className="border p-2 w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Price</label>
                <input type="number" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} placeholder="Price" className="border p-2 w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Original Price</label>
                <input type="number" value={form.original_price} onChange={e=>setForm({...form, original_price: e.target.value})} placeholder="Original Price" className="border p-2 w-full" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Image URL</label>
                <input value={form.image} onChange={e=>setForm({...form, image: e.target.value})} placeholder="Image URL" className="border p-2 w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Category</label>
                <select value={form.category_id || ''} onChange={e=>setForm({...form, category_id: e.target.value ? parseInt(e.target.value) : undefined})} className="border p-2 w-full">
                  <option value="">Select category</option>
                  {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Rating</label>
                <input type="number" step="0.1" value={form.rating} onChange={e=>setForm({...form, rating: e.target.value})} placeholder="Rating" className="border p-2 w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Stock</label>
                <input type="number" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} placeholder="Stock" className="border p-2 w-full" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={create} className="bg-blue-600 text-white px-3 py-2">Create Product</button>
              <button onClick={()=>setShowCreate(false)} className="bg-gray-300 text-gray-800 px-3 py-2">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <ul>
        {products.map(p => (
          <li key={p.id} className="p-2 border-b flex items-center justify-between">
            <div>
              <strong>{p.name}</strong>
              <div className="text-sm text-gray-600">${p.price} • {p.category}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={async ()=>{
                const newName = prompt('New name', p.name);
                if(newName){ await adminService.updateProduct(p.id, { name: newName }); load(); }
              }} className="text-sm text-blue-600">Edit</button>
              <button onClick={async ()=>{ if(confirm('Delete product?')){ await adminService.deleteProduct(p.id); load(); } }} className="text-sm text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
};

export default ProductsPage;
