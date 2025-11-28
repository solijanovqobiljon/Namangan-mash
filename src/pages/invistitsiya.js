import React, { useState, useEffect } from 'react';
import photo from "../components/assets/hamk.JPG";
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Hamkorlik() {
  const { t } = useLanguage();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listdan birinchisini oladi
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('https://tokenized.pythonanywhere.com/api/collaboration-info/');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const item = Array.isArray(data) ? data[0] : data;
        setPageData(item?.info || null);

      } catch (error) {
        console.error('Xato:', error);
        setError('Ma\'lumotlarni yuklashda xatolik yuz berdi: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4">
        <div className="max-w-[1450px] mx-auto text-center py-20">
          <div className="text-gray-500 dark:text-gray-400">Ma'lumotlar yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4">
        <div className="max-w-[1450px] mx-auto text-center py-20">
          <div className="text-red-500 dark:text-red-400 text-lg mb-4">Xatolik</div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Qayta Yuklash
          </button>
        </div>
      </div>
    );
  }

  // Agar ma'lumot yo'q bo'lsa, bo'sh sahifa
  if (!pageData) {
    return (
      <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4">
        <div className="max-w-[1450px] m-auto">
          <img
            src={photo}
            alt={t("Hamkorlik", "Сотрудничество")}
            className="w-full h-[350px] md:h-[500px] object-cover rounded-xl shadow-lg"
          />
        </div>
        <div className="mt-20 max-w-[1450px] mx-auto text-center py-20">
          <div className="text-gray-500 dark:text-gray-400 text-lg">
            {t("Ma'lumot topilmadi", "Информация не найдена")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4">


      {/* Main Section */}
      <div className="mt-20 max-w-[1450px] mx-auto text-gray-800 dark:text-gray-200 space-y-6 leading-relaxed text-lg">


        {/* Header */}
<div className='flex flex-col lg:flex-row gap-8 items-center'>

  {/* Image */}
  <div className="w-full lg:w-[50%] lg:h-[500px]">
    <img
      src={photo}
      alt={t("Hamkorlik", "Сотрудничество")}
      className="w-full h-auto max-h-[500px] object-cover rounded-lg"
    />
  </div>

  {/* Text Content */}
  <div className='w-full lg:w-[50%] space-y-6'>

    {/* Title */}
    {(pageData.title_uz || pageData.title_ru) && (
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
        {t(pageData.title_uz, pageData.title_ru)}
      </h2>
    )}

    {/* Description */}
    {(pageData.description_uz || pageData.description_ru) && (
      <p className="text-base md:text-lg text-gray-700 leading-relaxed">
        {t(pageData.description_uz, pageData.description_ru)}
      </p>
    )}

    {/* Features */}
    {pageData.features_uz && Array.isArray(pageData.features_uz) && pageData.features_uz.length > 0 && (
      <div className="space-y-3">
        {pageData.features_uz.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-green-500 text-xl mt-1">✓</span>
            <span className="text-base text-gray-800">
              {t(
                feature,
                pageData.features_ru && pageData.features_ru[index] ? pageData.features_ru[index] : feature
              )}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>

</div>


        {/* Extra Long Text Section */}
        {(pageData.details_text_uz || pageData.details_text_ru) && (
          <>
            {(pageData.details_title_uz || pageData.details_title_ru) && (
              <h2 className="text-2xl md:text-3xl font-bold mt-8">
                {t(pageData.details_title_uz, pageData.details_title_ru)}
              </h2>
            )}
            <p className='leading-[2] text-lg'>
              {t(pageData.details_text_uz, pageData.details_text_ru)}
            </p>
          </>
        )}

        {/* Why Us Section */}
        {pageData.why_us_points_uz && Array.isArray(pageData.why_us_points_uz) && pageData.why_us_points_uz.length > 0 && (
          <>
            {(pageData.why_us_title_uz || pageData.why_us_title_ru) && (
              <h2 className="text-2xl md:text-3xl font-bold mt-8">
                {t(pageData.why_us_title_uz, pageData.why_us_title_ru)}
              </h2>
            )}
            <ul className="list-disc list-inside space-y-3 text-lg">
              {pageData.why_us_points_uz.map((point, index) => (
                <li key={index}>
                  {t(
                    point,
                    pageData.why_us_points_ru && pageData.why_us_points_ru[index] ? pageData.why_us_points_ru[index] : point
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Contact Button */}
        {(pageData.button_text_uz || pageData.button_text_ru) && (
          <div className="pt-8">
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-full font-semibold shadow-2xl hover:shadow-white/30 transform hover:scale-105 transition-all duration-300 space-x-2
                       max-sm:px-4 max-sm:py-3 max-sm:text-[15px]"
            >
              <span>{t("Biz bilan bog'laning", "Связаться с нами")}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
