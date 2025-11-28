// src/App.js
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { Toaster } from './components/ui/sonner';
import Layout from './components/Layout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import ProductsManagement from './admin/pages/ProductsManagement';
import NewsManagement from './admin/pages/NewsManagement';
import CompanyInfoManagement from './admin/pages/CompanyInfoManagement';
import ContactsManagement from './admin/pages/ContactsManagement';
import { ProtectedRoute } from './admin/components/ProtectedRoute';
import '@/App.css';
import { FaChevronUp } from "react-icons/fa";
import Invistitsiya from './admin/pages/invistitsiya';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetail'));
const News = lazy(() => import('./pages/News'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const Gallery = lazy(() => import('./pages/Gallery')); // YANGI: Gallereya sahifasi
const Investment = lazy(() => import('./pages/invistitsiya')); // YANGI: Gallereya sahifasi

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  </div>
);

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const handleHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
      <button
        onClick={handleHome}
        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        <FaChevronUp className="w-6 h-6" />
      </button>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetails />} />
                <Route path="news" element={<News />} />
                <Route path="news/:id" element={<NewsDetail />} />
                <Route path="contact" element={<Contact />} />
                <Route path="gallery" element={<Gallery />} /> {/* YANGI: Gallereya sahifasi */}
                <Route path="investment" element={<Investment />} />
              </Route>

              {/* ADMIN ROUTES */}
              <Route path="/login" element={<AdminLogin />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute>
                    <ProductsManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/news"
                element={
                  <ProtectedRoute>
                    <NewsManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/company-info"
                element={
                  <ProtectedRoute>
                    <CompanyInfoManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/invistitsiya"
                element={
                  <ProtectedRoute>
                    <Invistitsiya />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/contacts"
                element={
                  <ProtectedRoute>
                    <ContactsManagement />
                  </ProtectedRoute>
                }
              />

              {/* 404 va redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

          <ScrollToTopButton />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AdminAuthProvider>
    </LanguageProvider>
  );
}

export default App;
