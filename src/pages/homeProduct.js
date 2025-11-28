// src/components/HomeProducts.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../admin/API';
import { FolderOpen, ChevronRight } from 'lucide-react';

const HomeProducts = () => {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/product-pdfs/')
        ]);

        const categoriesData = catRes.data;
        const products = prodRes.data;

        const counts = {};
        categoriesData.forEach(cat => {
          counts[cat.id] = products.filter(p => p.category === cat.id).length;
        });

        setCategories(categoriesData);
        setProductCounts(counts);
      } catch (err) {
        console.error('Maʼlumotlar yuklanmadi:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryClick = (category) => {
    navigate('/products', { state: { selectedCategory: category } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white via-blue-50 to-blue-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">
            {t('Mahsulot Kataloglari', 'Каталоги продукции')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {t('Sanoat armaturalari va yuqori sifatli mahsulotlar', 'Промышленная арматура и высококачественная продукция')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {categories.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-2xl text-gray-500">
                {t('Hozircha kategoriyalar mavjud emas', 'Категории пока недоступны')}
              </p>
            </div>
          ) : (
            categories.map((cat, index) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-6 transition-all duration-500 cursor-pointer overflow-hidden border border-gray-100"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative p-8 text-center z-10">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                    <FolderOpen className="w-14 h-14 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">
                    {language === 'uz' ? cat.name_uz : cat.name_ru || cat.name_uz}
                  </h3>

                  <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                    {productCounts[cat.id] || 0}
                  </div>
                  <p className="text-gray-500 text-sm">
                    {t('ta katalog', 'каталогов')}
                  </p>

                  <div className="mt-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <div className="w-12 h-12 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <ChevronRight className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeProducts;
