// src/AdminApp.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import { ProtectedRoute } from './admin/components/ProtectedRoute';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import ProductsManagement from './admin/pages/ProductsManagement';
import NewsManagement from './admin/pages/NewsManagement';
import CompanyInfoManagement from './admin/pages/CompanyInfoManagement';
import ContactsManagement from './admin/pages/ContactsManagement';

// MUHIM: fayl nomi kichik harf bilan boshlanganligi uchun shunday import qilindi
import AdminInvistitsiya from './admin/pages/invistitsiya';  

import { Toaster } from './components/ui/toaster';

function AdminApp() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />

          {/* Asosiy sahifa */}
          <Route path="/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

          {/* Boshqa admin sahifalar */}
          <Route path="/admin/products"      element={<ProtectedRoute><ProductsManagement /></ProtectedRoute>} />
          <Route path="/admin/news"          element={<ProtectedRoute><NewsManagement /></ProtectedRoute>} />
          <Route path="/admin/company-info"  element={<ProtectedRoute><CompanyInfoManagement /></ProtectedRoute>} />
          <Route path="/admin/contacts"      element={<ProtectedRoute><ContactsManagement /></ProtectedRoute>} />

          {/* BU YERDA TO‘G‘RI YO‘L */}
          <Route 
            path="/admin/invistitsiya" 
            element={
              <ProtectedRoute>
                <AdminInvistitsiya />
              </ProtectedRoute>
            } 
          />

          {/* Redirectlar */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AdminAuthProvider>
  );
}

export default AdminApp;