import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { publicApi, PublicMenu } from '../api';

export default function PublicMenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const [menu, setMenu] = useState<PublicMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    publicApi
      .getMenu(slug)
      .then(setMenu)
      .catch(err => setError(err.message || 'Menu not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading menu...
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Menu not found</h1>
        <p className="text-slate-500">{error || 'This restaurant does not have a public menu yet.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-brand-500 text-white py-10 px-4 text-center">
        <h1 className="text-3xl font-bold">{menu.restaurant.name}</h1>
        <p className="text-brand-100 mt-1 text-sm">Digital menu powered by DynamicMenu</p>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-10">
        {menu.categories.length === 0 && (
          <p className="text-center text-slate-400">No menu items available yet.</p>
        )}

        {menu.categories.map(category => (
          <section key={category.id}>
            <h2 className="text-xl font-bold text-brand-700 border-b-2 border-brand-200 pb-2 mb-4">
              {category.name}
            </h2>
            <div className="space-y-4">
              {category.items.map(item => (
                <article
                  key={item.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex justify-between gap-4"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    {item.description && (
                      <p className="text-slate-500 text-sm mt-0.5">{item.description}</p>
                    )}
                  </div>
                  <span className="font-bold text-brand-600 whitespace-nowrap">
                    ${item.price.toFixed(2)}
                  </span>
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
