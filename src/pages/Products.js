// src/pages/Products.jsx
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../admin/API';
import { useLocation } from 'react-router-dom';
import { FolderOpen, ArrowLeft, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const Products = () => {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPdfProduct, setSelectedPdfProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.selectedCategory) {
      setSelectedCategory(location.state.selectedCategory);
    }
  }, [location.state]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/product-pdfs/')
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.error('Maʼlumotlar yuklanmadi:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory.id)
    : [];

  const formatParameters = (params) => {
    if (!params) return <span className="text-gray-400 italic">Xususiyatlar yoʻq</span>;
    try {
      const obj = typeof params === 'string' ? JSON.parse(params) : params;
      return (
        <div className="space-y-1 text-sm">
          {Object.entries(obj).map(([key, value]) => (
            <div key={key}>
              <span className="font-medium text-gray-700">{key}:</span>{' '}
              <span className="text-gray-600">{value}</span>
            </div>
          ))}
        </div>
      );
    } catch {
      return <div className="whitespace-pre-line text-sm text-gray-600">{params}</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 max-w-7xl">

        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
            {t('Mahsulot Kataloglari', 'Каталоги продукции')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('Barcha mahsulotlarimizning texnik hujjatlari va kataloglari', 'Технические каталоги всей нашей продукции')}
          </p>
        </div>

        {!selectedCategory ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {categories.map((cat, index) => {
              const count = products.filter(p => p.category === cat.id).length;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="group cursor-pointer bg-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-6 transition-all duration-500 border border-gray-100 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-8 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl relative z-10">
                      <FolderOpen className="w-14 h-14 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight relative z-10">
                      {language === 'uz' ? cat.name_uz : cat.name_ru || cat.name_uz}
                    </h3>
                    <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2 relative z-10">
                      {count}
                    </div>
                    <p className="text-gray-500 text-sm relative z-10">
                      {t('ta katalog', 'каталогов')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="mb-8 flex items-center gap-3 text-blue-700 hover:text-blue-900 font-semibold text-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              {t('Orqaga', 'Назад')}
            </button>

            <h2 className="text-4xl font-extrabold text-center mb-12 text-gray-800">
              {language === 'uz' ? selectedCategory.name_uz : selectedCategory.name_ru || selectedCategory.name_uz}
            </h2>

            {/* 1. Katta ekran uchun Table */}
            {/* Table — Har doim ko'rinadi + Mukammal Responsive */}
            <div className="mb-16">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200">
                {/* Desktop / katta ekranlar uchun TABLE */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-wider whitespace-nowrap">
                          Katalog nomi
                        </th>
                        <th className="px-8 py-4 text-center text-sm font-bold uppercase tracking-wider whitespace-nowrap">
                          Rasm
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-wider whitespace-nowrap">
                          Xususiyatlar
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td
                            colSpan="3"
                            className="text-center py-16 text-gray-500 text-lg"
                          >
                            {t(
                              'Bu kategoriyada hali katalog yoʻq',
                              'В этой категории пока нет каталогов'
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((prod) => (
                          <tr
                            key={prod.id}
                            className="hover:bg-blue-50 transition cursor-pointer"
                            onClick={() => setSelectedPdfProduct(prod)}
                          >
                            {/* Katalog nomi */}
                            <td className="px-8 py-6">
                              <div className="font-semibold text-gray-900 text-lg leading-tight">
                                {prod.title ||
                                  (prod.pdf
                                    ? decodeURIComponent(
                                      prod.pdf
                                        .split('/')
                                        .pop()
                                        .replace('.pdf', '')
                                        .replace(/_/g, ' ')
                                    )
                                    : 'Nomsiz katalog')}
                              </div>
                            </td>

                            {/* Rasm */}
                            <td className="px-8 py-6">
                              <div className="flex justify-center">
                                {prod.image ? (
                                  <img
                                    src={prod.image}
                                    alt="rasm"
                                    className="w-32 h-28 object-cover rounded-lg shadow-md border"
                                  />
                                ) : (
                                  <div className="w-32 h-28 bg-gray-200 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                    Rasm yoʻq
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Xususiyatlar */}
                            <td className="px-8 py-6">
                              <div className="text-base text-gray-700 leading-relaxed">
                                {formatParameters(prod.parameters)}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobil / planshet uchun CARD LAYOUT */}
                <div className="lg:hidden">
                  {filteredProducts.length === 0 ? (
                    <div className="py-10 text-center text-gray-500 text-base">
                      {t(
                        'Bu kategoriyada hali katalog yoʻq',
                        'В этой категории пока нет каталогов'
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {/* Header qismi faqat bitta bor */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 text-xs font-semibold uppercase tracking-wider flex justify-between">
                        <span>Katalog nomi</span>
                        <span>Xususiyatlar</span>
                      </div>

                      {filteredProducts.map((prod) => (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => setSelectedPdfProduct(prod)}
                          className="w-full text-left px-4 py-4 flex gap-3 sm:gap-4 hover:bg-blue-50 transition cursor-pointer"
                        >
                          {/* Rasm */}
                          <div className="flex-shrink-0">
                            {prod.image ? (
                              <img
                                src={prod.image}
                                alt="rasm"
                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shadow border"
                              />
                            ) : (
                              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400 text-[10px]">
                                Rasm yoʻq
                              </div>
                            )}
                          </div>

                          {/* Matnlar */}
                          <div className="flex-1 flex flex-col gap-1">
                            <div className="font-semibold text-gray-900 text-sm sm:text-base">
                              {prod.title ||
                                (prod.pdf
                                  ? decodeURIComponent(
                                    prod.pdf
                                      .split('/')
                                      .pop()
                                      .replace('.pdf', '')
                                      .replace(/_/g, ' ')
                                  )
                                  : 'Nomsiz katalog')}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-4">
                              {formatParameters(prod.parameters)}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>


            {/* 2. Cardlar — Mobil + Katta ekran uchun qoʻshimcha */}
            <div>
              <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 lg:hidden">
                {t('Kataloglar', 'Каталоги')}
              </h3>
              <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 hidden lg:block">
                {t('Barcha kataloglar', 'Все каталоги')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <p className="text-2xl text-gray-500">
                      {t('Bu kategoriyada hali katalog yoʻq', 'В этой категории пока нет каталогов')}
                    </p>
                  </div>
                ) : (
                  filteredProducts.map((prod, index) => (
                    <div
                      key={prod.id}
                      onClick={() => setSelectedPdfProduct(prod)}
                      className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-500 cursor-pointer overflow-hidden border border-gray-100"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative h-64 overflow-hidden">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt="Katalog rasmi"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <span className="text-gray-500 text-lg">Rasm yoʻq</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                          {prod.title ||
                            (prod.pdf
                              ? decodeURIComponent(prod.pdf.split('/').pop().replace('.pdf', '').replace(/_/g, ' '))
                              : 'Nomsiz katalog')}
                        </h3>

                        <div className="text-sm text-gray-600 space-y-1 mb-4">
                          {formatParameters(prod.parameters)}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">PDF katalog</span>
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <ExternalLink className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* PDF Modal — Responsive */}
        <Dialog open={!!selectedPdfProduct} onOpenChange={() => setSelectedPdfProduct(null)}>
          <DialogContent className="max-w-[95vw] w-full h-full max-h-[95vh] p-0 overflow-hidden rounded-2xl shadow-2xl bg-white">
            <div className="flex flex-col h-full max-h-[95vh]">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 sm:p-6 flex items-center justify-between">
                <h2 className="text-lg sm:text-2xl font-bold truncate pr-4">
                  {selectedPdfProduct?.title ||
                    (selectedPdfProduct?.pdf && decodeURIComponent(selectedPdfProduct.pdf.split('/').pop().replace('.pdf', ''))) ||
                    'Katalog'}
                </h2>
              </div>

              <div className="flex-1 overflow-hidden bg-gray-100">
                {selectedPdfProduct?.pdf ? (
                  <iframe
                    src={selectedPdfProduct.pdf}
                    className="w-full h-full border-0"
                    title="PDF Preview"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-lg">
                    PDF fayl topilmadi
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6 bg-white border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-between">
                <button
                  onClick={() => setSelectedPdfProduct(null)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition"
                >
                  Yopish
                </button>
                <a
                  href={selectedPdfProduct?.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <ExternalLink className="w-5 h-5" />
                  Yangi oynada ochish
                </a>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Products;
