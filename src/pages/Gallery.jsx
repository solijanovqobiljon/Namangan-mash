// src/pages/Gallery.jsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

// Rasmlarni import qilish
import production1 from '../components/assets/n1.JPG';
import assembly1 from '../components/assets/n2.JPG';
import automation1 from '../components/assets/n3.JPG';
import quality1 from '../components/assets/n4.JPG';
import equipment1 from '../components/assets/n5.JPG';
import process1 from '../components/assets/n6.JPG';
import team1 from '../components/assets/n7.JPG';
import technology1 from '../components/assets/n8.JPG';
import products1 from '../components/assets/n9.JPG';
import lab1 from '../components/assets/n10.JPG';
import innovation1 from '../components/assets/n11.JPG';
import standards1 from '../components/assets/n12.JPG';
import reliable1 from '../components/assets/n13.JPG';
import quality2 from '../components/assets/n14.JPG';
import team2 from '../components/assets/n15.JPG';

const Gallery = () => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Rasmlar massivi - endi import qilingan rasmlar
  const [images, setImages] = useState([
    {
      id: 1,
      src: production1,
      title: t("Ishlab chiqarish liniyasi", "Производственная линия"),
      category: "production",
      width: "wide"
    },
    {
      id: 2,
      src: assembly1,
      title: t("Yig'ish sexi", "Сборочный цех"),
      category: "assembly",
      width: "tall"
    },
    {
      id: 3,
      src: automation1,
      title: t("Robotlashtirilgan tizim", "Роботизированная система"),
      category: "automation",
      width: "square"
    },
    {
      id: 4,
      src: quality1,
      title: t("Sifat nazorati", "Контроль качества"),
      category: "quality",
      width: "wide"
    },
    {
      id: 5,
      src: equipment1,
      title: t("Zamonaviy uskunalar", "Современное оборудование"),
      category: "equipment",
      width: "tall"
    },
    {
      id: 6,
      src: process1,
      title: t("Texnologik jarayon", "Технологический процесс"),
      category: "process",
      width: "square"
    },
    {
      id: 7,
      src: team1,
      title: t("Mutaxassislar jamoasi", "Команда специалистов"),
      category: "team",
      width: "wide"
    },
    {
      id: 8,
      src: technology1,
      title: t("Ilg'or texnologiyalar", "Передовые технологии"),
      category: "technology",
      width: "tall"
    },
    {
      id: 9,
      src: products1,
      title: t("Tayyor mahsulotlar", "Готовая продукция"),
      category: "products",
      width: "square"
    },
    {
      id: 10,
      src: lab1,
      title: t("Laboratoriya", "Лаборатория"),
      category: "lab",
      width: "wide"
    },
    {
      id: 11,
      src: innovation1,
      title: t("Innovatsion yechimlar", "Инновационные решения"),
      category: "innovation",
      width: "tall"
    },
    {
      id: 12,
      src: standards1,
      title: t("Xalqaro standartlar", "Международные стандарты"),
      category: "standards",
      width: "square"
    },
    {
      id: 13,
      src: reliable1,
      title: t("Ishonchli ishlab chiqarish", "Надежное производство"),
      category: "reliable",
      width: "wide"
    },
    {
      id: 14,
      src: quality2,
      title: t("Yuqori sifat", "Высокое качество"),
      category: "quality",
      width: "tall"
    },
    {
      id: 15,
      src: team2,
      title: t("Professional jamoa", "Профессиональная команда"),
      category: "team",
      width: "square"
    }
  ]);

  // Admin holatini tekshirish
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
  }, []);

  const openModal = (image) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const goToNext = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  const goToPrev = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
  };

  const handleEditImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('Yangi rasm tanlandi:', file);
      }
    };
    input.click();
  };

  const getImageClass = (width) => {
    switch (width) {
      case 'wide':
        return 'col-span-2 row-span-1';
      case 'tall':
        return 'col-span-1 row-span-2';
      case 'square':
        return 'col-span-1 row-span-1';
      default:
        return 'col-span-1 row-span-1';
    }
  };

  // Klaviaturada esc tugmasi bosilganda modalni yopish
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.keyCode === 27) closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        {/* Sarlavha */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            {t('Gallereya', 'Галерея')}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t(
              'Bizning ishlab chiqarish jarayonimiz, mahsulotlarimiz va jamoamizning eng yaxshi lahzalariga guvoh bo\'ling',
              'Узнайте лучшие моменты нашего производственного процесса, продукции и команды'
            )}
          </p>
        </div>

        {/* Rasmlar galereyasi */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {images.map((image) => (
            <div
              key={image.id}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${getImageClass(image.width)}`}
              onClick={() => openModal(image)}
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="font-semibold text-lg mb-1">{image.title}</h3>
                  <p className="text-blue-200 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    {t('Batafsil ko\'rish', 'Посмотреть подробнее')}
                  </p>
                </div>
              </div>

              {/* Hover effekt */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 rounded-2xl transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {/* Yopish tugmasi */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Tahrirlash tugmasi (faqat admin uchun) */}
            {isAdmin && (
              <button
                onClick={handleEditImage}
                className="absolute top-4 right-16 z-10 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
              >
                <Edit className="w-4 h-4" />
                {t('Tahrirlash', 'Редактировать')}
              </button>
            )}

            {/* Oldingi rasm tugmasi */}
            <button
              onClick={goToPrev}
              className="absolute left-4 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Keyingi rasm tugmasi */}
            <button
              onClick={goToNext}
              className="absolute right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Rasm */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="max-w-full max-h-full object-contain rounded-lg"
              />

              {/* Rasm ma'lumotlari */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
                <p className="text-blue-200">
                  {t('Rasm ID', 'ID изображения')}: {selectedImage.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
