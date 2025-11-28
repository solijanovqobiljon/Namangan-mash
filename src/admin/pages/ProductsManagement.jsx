// src/admin/pages/ProductsManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../API';
import { Plus, Trash2, Edit2, ArrowLeft, Upload, ExternalLink, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const NEW_CATEGORY = 'new';

const ProductsManagement = () => {
  const [categories, setCategories] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Katalog dialog state'lari
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [newCatUz, setNewCatUz] = useState('');
  const [newCatRu, setNewCatRu] = useState('');
  const [titleUz, setTitleUz] = useState('');
  const [titleRu, setTitleRu] = useState('');
  const [parameters, setParameters] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const imageRef = useRef(null);
  const pdfRef = useRef(null);
  const newPdfRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchAllCatalogs();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data);
    } catch (err) {
      toast({ title: 'Xato', description: 'Kategoriyalar yuklanmadi', variant: 'destructive' });
    }
  };

  const fetchAllCatalogs = async () => {
    try {
      const res = await api.get('/product-pdfs/');
      setCatalogs(res.data);
      setLoading(false);
    } catch (err) {
      toast({ title: 'Xato', description: 'Kataloglar yuklanmadi', variant: 'destructive' });
      setLoading(false);
    }
  };

  const filteredCatalogs = selectedCategory
    ? catalogs.filter(p => p.category === selectedCategory.id)
    : [];

  const deleteCategory = async (catId) => {
    if (!window.confirm('Kategoriya va barcha kataloglar oʻchadi. Davom etasizmi?')) return;
    try {
      const catProds = catalogs.filter(p => p.category === catId);
      for (const p of catProds) await api.delete(`/product-pdfs/${p.id}/`);
      await api.delete(`/categories/${catId}/`);
      setCategories(prev => prev.filter(c => c.id !== catId));
      setCatalogs(prev => prev.filter(p => p.category !== catId));
      setSelectedCategory(null);
      toast({ title: 'Muvaffaqiyat', description: 'Kategoriya oʻchirildi' });
    } catch (err) {
      toast({ title: 'Xato', description: 'Oʻchirishda xatolik', variant: 'destructive' });
    }
  };

  const deleteCatalog = async (id) => {
    if (!window.confirm('Katalog oʻchirilsinmi?')) return;
    try {
      await api.delete(`/product-pdfs/${id}/`);
      setCatalogs(prev => prev.filter(p => p.id !== id));
      toast({ title: 'Oʻchirildi', description: 'Katalog oʻchirildi' });
    } catch (err) {
      toast({ title: 'Xato', description: 'Oʻchirishda xatolik', variant: 'destructive' });
    }
  };

  const parseParametersToJson = (text) => {
    if (!text.trim()) return null;
    const obj = {};
    const lines = text.trim().split('\n');
    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1) {
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        if (key && value) obj[key] = value;
      }
    });
    return Object.keys(obj).length > 0 ? JSON.stringify(obj) : null;
  };

  const jsonToParametersText = (jsonStr) => {
    if (!jsonStr) return '';
    try {
      const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      return Object.entries(obj)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    } catch {
      return jsonStr;
    }
  };

  const handleUpload = async () => {
    if (!selectedOption || !titleUz.trim() || !imageFile || !pdfFile) {
      toast({ title: 'Xato', description: 'Barcha majburiy maydonlar toʻldirilishi kerak', variant: 'destructive' });
      return;
    }
    if (selectedOption === NEW_CATEGORY && !newCatUz.trim()) {
      toast({ title: 'Xato', description: 'Yangi kategoriya nomi kiriting', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      let catId = selectedOption;
      if (selectedOption === NEW_CATEGORY) {
        const res = await api.post('/categories/', {
          name_uz: newCatUz.trim(),
          name_ru: newCatRu.trim() || newCatUz.trim(),
        });
        catId = res.data.id;
        setCategories(prev => [...prev, res.data]);
      }

      const parametersJson = parseParametersToJson(parameters);

      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('image', imageFile);
      formData.append('category', catId);
      formData.append('title', titleUz.trim());
      if (titleRu.trim()) formData.append('title_ru', titleRu.trim());
      if (parametersJson) formData.append('parameters', parametersJson);

      const res = await api.post('/product-pdfs/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setCatalogs(prev => [...prev, res.data]);
      toast({ title: 'Muvaffaqiyat', description: 'Katalog yuklandi' });
      resetForm();
      setOpenUploadDialog(false);
    } catch (err) {
      toast({ title: 'Xato', description: err.response?.data?.detail || 'Yuklashda xatolik', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleEditCatalog = async () => {
    if (!titleUz.trim()) return toast({ title: 'Xato', description: 'Nomi boʻsh boʻlmasligi kerak', variant: 'destructive' });

    setUploading(true);
    try {
      const parametersJson = parseParametersToJson(parameters);

      const formData = new FormData();
      formData.append('title', titleUz.trim());
      if (titleRu.trim()) formData.append('title_ru', titleRu.trim());
      if (parametersJson) formData.append('parameters', parametersJson);
      if (imageFile) formData.append('image', imageFile);

      await api.patch(`/product-pdfs/${selectedCatalog.id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast({ title: 'Yangilandi', description: 'Katalog yangilandi' });
      fetchAllCatalogs();
      setOpenEditDialog(false);
    } catch (err) {
      toast({ title: 'Xato', description: 'Yangilashda xatolik', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const updatePdfOnly = async () => {
    if (!pdfFile) {
      toast({ title: 'Xato', description: 'Yangi PDF fayl tanlang', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);

      await api.patch(`/product-pdfs/${selectedCatalog.id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast({ title: 'Muvaffaqiyat', description: 'PDF muvaffaqiyatli almashtirildi!' });

      setSelectedCatalog(null);
      setPdfFile(null);
      if (newPdfRef.current) newPdfRef.current.value = '';
      fetchAllCatalogs();
    } catch (err) {
      console.error("PDF almashtirish xatosi:", err.response?.data);
      toast({
        title: 'Xato',
        description: err.response?.data?.pdf?.[0] || 'PDF faylni almashtirib boʻlmadi',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedOption(''); setNewCatUz(''); setNewCatRu('');
    setTitleUz(''); setTitleRu(''); setParameters('');
    setImageFile(null); setPdfFile(null);
    if (imageRef.current) imageRef.current.value = '';
    if (pdfRef.current) pdfRef.current.value = '';
  };

  const openEditCatalog = (prod) => {
    setSelectedCatalog(prod);
    setTitleUz(prod.title || '');
    setTitleRu(prod.title_ru || '');
    setParameters(jsonToParametersText(prod.parameters));
    setImageFile(null);
    setOpenEditDialog(true);
  };

  return (
    <AdminLayout>
      <div className="p-6 min-h-screen">
        <div className="mb-12">
          <div className="flex gap-3 sm:gap-0 flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Mahsulot Kataloglari
            </h1>
            <Button onClick={() => setOpenUploadDialog(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Plus className="w-5 h-5 mr-2" /> Yangi Katalog
            </Button>
          </div>

          {!selectedCategory ? (
            loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : categories.length === 0 ? (
              <Card className="text-center py-20 bg-gray-800/50 border-gray-700">
                <p className="text-xl text-gray-400 mb-6">Hozircha kategoriya yoʻq</p>
                <Button onClick={() => setOpenUploadDialog(true)}>Birinchi katalog qoʻshish</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {categories.map(cat => (
                  <Card
                    key={cat.id}
                    className="bg-gray-800/70 border border-gray-700 hover:border-purple-500 transition-all cursor-pointer group overflow-hidden"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <CardContent className="p-6 text-center relative">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition"
                        onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                        <FolderOpen className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="font-bold text-white">{cat.name_uz}</h3>
                      {cat.name_ru && <p className="text-sm text-gray-400 mt-1">{cat.name_ru}</p>}
                      <p className="text-2xl font-bold text-blue-600 mt-3">
                        {catalogs.filter(p => p.category === cat.id).length}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 text-white/90 hover:text-white font-medium mb-3">
                  <ArrowLeft className="w-5 h-5" /> Orqaga
                </button>
                <h2 className="text-3xl font-bold">
                  {selectedCategory.name_uz} {selectedCategory.name_ru && `/ ${selectedCategory.name_ru}`}
                </h2>
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Katalog nomi</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-300">Rasm</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Xususiyatlar</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-300">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCatalogs.map(prod => (
                      <tr key={prod.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer" onClick={() => setSelectedCatalog(prod)}>
                        <td className="px-6 py-5 font-medium text-gray-900 dark:text-white">
                          <div className="max-w-xs">
                            {prod.title || (prod.pdf ? decodeURIComponent(prod.pdf.split('/').pop().replace('.pdf', '').replace(/_/g, ' ')) : 'Nomsiz')}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            {prod.image ? (
                              <img src={prod.image} alt="rasm" className="w-32 h-24 object-cover rounded-lg shadow-md border" />
                            ) : (
                              <div className="w-32 h-24 bg-gray-200 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                Rasm yoʻq
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-700 dark:text-gray-300 max-w-md">
                          {prod.parameters ? (
                            <div className="whitespace-pre-line leading-relaxed line-clamp-3">
                              {jsonToParametersText(prod.parameters)}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Xususiyatlar kiritilmagan</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-center space-x-3">
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openEditCatalog(prod); }}>
                            <Edit2 className="w-4 h-4 text-black" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); deleteCatalog(prod.id); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {filteredCatalogs.map(prod => (
                  <Card key={prod.id} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="relative">
                        {prod.image ? (
                          <img
                            src={prod.image}
                            alt="rasm"
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 border-b border-gray-300 dark:border-gray-600 rounded-t-lg flex items-center justify-center text-gray-400">
                            <FolderOpen className="w-12 h-12" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-white/90 hover:bg-white text-gray-800 backdrop-blur-sm"
                            onClick={(e) => { e.stopPropagation(); openEditCatalog(prod); }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-500/90 hover:bg-red-600 backdrop-blur-sm"
                            onClick={(e) => { e.stopPropagation(); deleteCatalog(prod.id); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3 line-clamp-2">
                          {prod.title || (prod.pdf ? decodeURIComponent(prod.pdf.split('/').pop().replace('.pdf', '').replace(/_/g, ' ')) : 'Nomsiz')}
                        </h3>

                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {prod.parameters ? (
                            <div className="line-clamp-3 whitespace-pre-line leading-relaxed">
                              {jsonToParametersText(prod.parameters)}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Xususiyatlar kiritilmagan</span>
                          )}
                        </div>

                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          onClick={() => setSelectedCatalog(prod)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          PDF ni ochish
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PDF Modal */}
        <Dialog open={!!selectedCatalog} onOpenChange={() => setSelectedCatalog(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {selectedCatalog?.title ||
                  (selectedCatalog?.pdf && decodeURIComponent(selectedCatalog.pdf.split('/').pop().replace('.pdf', ''))) ||
                  'Katalog'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button
                  onClick={() => newPdfRef.current?.click()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  <Upload className="w-4 h-4 mr-2" /> Yangi PDF yuklash
                </Button>
              </div>

              {pdfFile && (
                <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    Tanlangan: {pdfFile.name}
                  </p>
                  <Button
                    onClick={updatePdfOnly}
                    disabled={uploading}
                    className="mt-3 bg-green-600 hover:bg-green-700"
                  >
                    {uploading ? 'Yuklanmoqda...' : 'PDF ni almashtirish'}
                  </Button>
                </div>
              )}

              <iframe
                src={selectedCatalog?.pdf}
                className="w-full h-96 border-2 border-gray-300 rounded-lg"
                title="PDF Preview"
              />

              <a
                href={selectedCatalog?.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <ExternalLink className="w-5 h-5" /> To'liq ekranda ochish
              </a>
            </div>

            <input
              ref={newPdfRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setPdfFile(e.target.files[0]);
                }
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Yangi Katalog Yuklash */}
        <Dialog open={openUploadDialog} onOpenChange={setOpenUploadDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yangi Katalog Qo'shish</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div>
                <Label>Kategoriya</Label>
                <Select value={selectedOption} onValueChange={setSelectedOption}>
                  <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name_uz}</SelectItem>
                    ))}
                    <SelectItem value={NEW_CATEGORY}>+ Yangi kategoriya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedOption === NEW_CATEGORY && (
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Nomi (uz)" value={newCatUz} onChange={e => setNewCatUz(e.target.value)} />
                  <Input placeholder="Nomi (ru)" value={newCatRu} onChange={e => setNewCatRu(e.target.value)} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nomi (uz) *</Label><Input value={titleUz} onChange={e => setTitleUz(e.target.value)} /></div>
                <div><Label>Nomi (ru)</Label><Input value={titleRu} onChange={e => setTitleRu(e.target.value)} /></div>
              </div>

              <div>
                <Label>Xususiyatlar (Sreda, PN, DN, Temp, GOST va h.k.)</Label>
                <Textarea
                  rows={8}
                  className="w-full"
                  placeholder={`Sreda: suv, bug'\nPN: 1.6 MPa\nDN: 50-300\nTemperatura: +425°C\nGOST: 5762-2002`}
                  value={parameters}
                  onChange={(e) => setParameters(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">Har bir xususiyatni yangi qatorga yozing</p>
              </div>

              <div><Label>Rasm *</Label><Input ref={imageRef} type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} /></div>
              <div><Label>PDF *</Label><Input ref={pdfRef} type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setOpenUploadDialog(false); resetForm(); }}>Bekor</Button>
              <Button onClick={handleUpload} disabled={uploading}>Yuklash</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Katalog Tahrirlash */}
        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Katalogni Tahrirlash</DialogTitle></DialogHeader>
            <div className="space-y-5 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nomi (uz)</Label><Input value={titleUz} onChange={e => setTitleUz(e.target.value)} /></div>
                <div><Label>Nomi (ru)</Label><Input value={titleRu} onChange={e => setTitleRu(e.target.value)} /></div>
              </div>

              <div>
                <Label>Xususiyatlar</Label>
                <Textarea
                  rows={8}
                  className="w-full"
                  value={parameters}
                  onChange={(e) => setParameters(e.target.value)}
                />
              </div>

              <div><Label>Yangi rasm (ixtiyoriy)</Label><Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenEditDialog(false)}>Bekor</Button>
              <Button onClick={handleEditCatalog} disabled={uploading}>Saqlash</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ProductsManagement;
