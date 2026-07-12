import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, LogOut, ChefHat } from 'lucide-react';
import { Category, Item, menu } from '../api';
import { useAuth } from '../App';

export default function MenuBuilderPage() {
  const { setUser, setToken } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  const [newItem, setNewItem] = useState<{ categoryId: number; name: string; description: string; price: string } | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    try {
      const data = await menu.get();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    navigate('/login');
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      const cat = await menu.createCategory(newCategory.trim());
      setCategories([...categories, cat]);
      setNewCategory('');
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function updateCategory(id: number) {
    if (!editCategoryName.trim()) return;
    try {
      await menu.updateCategory(id, editCategoryName.trim());
      setCategories(categories.map(c => (c.id === id ? { ...c, name: editCategoryName.trim() } : c)));
      setEditingCategory(null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm('Delete this category and all its items?')) return;
    try {
      await menu.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem) return;
    try {
      const item = await menu.createItem({
        categoryId: newItem.categoryId,
        name: newItem.name,
        description: newItem.description,
        price: Number(newItem.price),
        available: 1,
      });
      setCategories(
        categories.map(c => (c.id === item.category_id ? { ...c, items: [...c.items, item] } : c))
      );
      setNewItem(null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function updateItem(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const item = await menu.updateItem(editingItem.id, {
        name: editingItem.name,
        description: editingItem.description,
        price: editingItem.price,
        available: editingItem.available,
      });
      setCategories(
        categories.map(c => ({
          ...c,
          items: c.items.map(i => (i.id === item.id ? item : i)),
        }))
      );
      setEditingItem(null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function deleteItem(id: number) {
    if (!confirm('Delete this item?')) return;
    try {
      await menu.deleteItem(id);
      setCategories(
        categories.map(c => ({
          ...c,
          items: c.items.filter(i => i.id !== id),
        }))
      );
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <ChefHat className="text-brand-500" size={24} />
            DynamicMenu
          </div>
          <button
            onClick={logout}
            className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-sm font-medium"
          >
            <LogOut size={18} /> Log out
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard" className="text-slate-500 hover:text-slate-900">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Menu builder</h1>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={addCategory} className="flex gap-2 mb-8">
          <input
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            placeholder="New category (e.g., Appetizers)"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2"
          />
          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <Plus size={18} /> Add category
          </button>
        </form>

        {categories.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No categories yet. Add your first category above.
          </div>
        )}

        <div className="space-y-6">
          {categories.map(category => (
            <section key={category.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                {editingCategory === category.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={e => setEditCategoryName(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5"
                    />
                    <button
                      onClick={() => updateCategory(category.id)}
                      className="text-green-600 hover:bg-green-50 p-1.5 rounded"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="text-slate-400 hover:bg-slate-50 p-1.5 rounded"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold">{category.name}</h2>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCategory(category.id);
                          setEditCategoryName(category.name);
                        }}
                        className="text-slate-400 hover:text-brand-600 hover:bg-brand-50 p-1.5 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                {category.items.map(item =>
                  editingItem?.id === item.id ? (
                    <form key={item.id} onSubmit={updateItem} className="bg-slate-50 rounded-xl p-4 space-y-3">
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        placeholder="Item name"
                      />
                      <input
                        type="text"
                        value={editingItem.description || ''}
                        onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        placeholder="Description"
                      />
                      <div className="flex gap-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editingItem.price}
                          onChange={e => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                          className="w-32 rounded-lg border border-slate-300 px-3 py-2"
                        />
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={!!editingItem.available}
                            onChange={e => setEditingItem({ ...editingItem, available: e.target.checked ? 1 : 0 })}
                          />
                          Available
                        </label>
                        <div className="flex-1"></div>
                        <button type="submit" className="text-green-600 hover:bg-green-50 px-3 py-1.5 rounded font-medium text-sm">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItem(null)}
                          className="text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded font-medium text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div
                      key={item.id}
                      className="flex items-start justify-between border border-slate-100 rounded-xl p-4 hover:border-slate-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-slate-900">{item.name}</h3>
                          {!item.available && (
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Unavailable</span>
                          )}
                        </div>
                        {item.description && <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>}
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="font-semibold text-slate-900">${item.price.toFixed(2)}</span>
                        <button
                          onClick={() => setEditingItem(item)}
                          className="text-slate-400 hover:text-brand-600 hover:bg-brand-50 p-1.5 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>

              {newItem?.categoryId === category.id ? (
                <form onSubmit={addItem} className="mt-4 bg-slate-50 rounded-xl p-4 space-y-3">
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Item name"
                  />
                  <input
                    type="text"
                    value={newItem.description}
                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Description"
                  />
                  <div className="flex gap-3">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newItem.price}
                      onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                      className="w-32 rounded-lg border border-slate-300 px-3 py-2"
                      placeholder="Price"
                    />
                    <div className="flex-1"></div>
                    <button type="submit" className="text-green-600 hover:bg-green-50 px-3 py-1.5 rounded font-medium text-sm">
                      Add item
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItem(null)}
                      className="text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded font-medium text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setNewItem({ categoryId: category.id, name: '', description: '', price: '' })}
                  className="mt-4 text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                >
                  <Plus size={16} /> Add item
                </button>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
