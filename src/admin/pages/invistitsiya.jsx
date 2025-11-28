import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Save, Building2, Users, CalendarIcon, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import aPi from '../API';

const API_URL = 'https://tokenized.pythonanywhere.com/api/collaboration-info/';

const Invistitsiya = () => {
    const [formData, setFormData] = useState({
        title_uz: "", title_ru: "",
        description_uz: "", description_ru: "",
        features_uz: [""], features_ru: [""],
        details_title_uz: "", details_title_ru: "",
        details_text_uz: "", details_text_ru: "",
        why_us_title_uz: "", why_us_title_ru: "",
        why_us_points_uz: [""], why_us_points_ru: [""],
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        aPi.get(API_URL)
            .then(res => {
                const item = Array.isArray(res.data) ? res.data[0] : res.data;
                if (item?.info) {
                    const info = item.info;
                    setFormData({
                        ...info,
                        features_uz: info.features_uz?.length > 0 ? info.features_uz : [""],
                        features_ru: info.features_ru?.length > 0 ? info.features_ru : [""],
                        why_us_points_uz: info.why_us_points_uz?.length > 0 ? info.why_us_points_uz : [""],
                        why_us_points_ru: info.why_us_points_ru?.length > 0 ? info.why_us_points_ru : [""],
                    });
                }
            })
            .catch(() => console.log("Yangi yaratiladi"))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

    const updateItem = (key, index, value) => {
        setFormData(prev => {
            const arr = [...prev[key]];
            arr[index] = value;
            return { ...prev, [key]: arr };
        });
    };

    const addPair = (uzKey, ruKey) => {
        setFormData(prev => ({
            ...prev,
            [uzKey]: [...prev[uzKey], ""],
            [ruKey]: [...prev[ruKey], ""]
        }));
    };

    const removePair = (uzKey, ruKey, index) => {
        setFormData(prev => {
            const newUz = prev[uzKey].filter((_, i) => i !== index);
            const newRu = prev[ruKey].filter((_, i) => i !== index);
            return {
                ...prev,
                [uzKey]: newUz.length > 0 ? newUz : [""],
                [ruKey]: newRu.length > 0 ? newRu : [""]
            };
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        const cleaned = {
            ...formData,
            features_uz: formData.features_uz.filter(s => s.trim() !== ""),
            features_ru: formData.features_ru.filter(s => s.trim() !== ""),
            why_us_points_uz: formData.why_us_points_uz.filter(s => s.trim() !== ""),
            why_us_points_ru: formData.why_us_points_ru.filter(s => s.trim() !== ""),
        };

        try {
            await aPi.post(API_URL, { info: cleaned });
            toast({ title: "Saqlandi!", description: "Ma'lumotlar yangilandi" });
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            toast({ title: "Xato", description: "Saqlashda xatolik", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <AdminLayout><div className="text-center py-20 text-white">Yuklanmoqda...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="w-full mx-auto p-6 space-y-10">

                <div className="flex justify-between max-sm:block items-center">
                    <h1 className="text-4xl font-bold max-sm:mb-2 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        Hamkorlik sahifasi
                    </h1>
                    <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                        {saving ? "Saqlanmoqda..." : <><Save className="mr-2 h-5 w-5" /> Saqlash</>}
                    </Button>
                </div>

                <form onSubmit={handleSave} className="space-y-10">

                    {/* Sarlavha va Tavsif */}
                    <Card className="bg-gray-900/50 border-gray-800">
                        <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Building2 className="text-orange-500" /> Sarlavha va Tavsif</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="text-white">Sarlavha (Uzbekcha)</Label>
                                    <Input value={formData.title_uz} onChange={e => handleChange('title_uz', e.target.value)} className="bg-gray-800 border-gray-700 text-gray-100 mt-1" />
                                </div>
                                <div>
                                    <Label className="text-white">Sarlavha (Русский)</Label>
                                    <Input value={formData.title_ru} onChange={e => handleChange('title_ru', e.target.value)} className="bg-gray-800 border-gray-700 text-gray-100 mt-1" />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="text-white">Tavsif (Uzbekcha)</Label>
                                    <Textarea value={formData.description_uz} onChange={e => handleChange('description_uz', e.target.value)} className="bg-gray-800 border-gray-700 text-gray-100 min-h-32 mt-1" />
                                </div>
                                <div>
                                    <Label className="text-white">Tavsif (Русский)</Label>
                                    <Textarea value={formData.description_ru} onChange={e => handleChange('description_ru', e.target.value)} className="bg-gray-800 border-gray-700 text-gray-100 min-h-32 mt-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Xususiyatlar */}
                    <Card className="bg-gray-900/50 border-gray-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Users className="text-orange-500" /> Xususiyatlar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.features_uz.map((_, i) => (
                                <div key={i} className="border border-gray-700 rounded-lg p-5 space-y-4 bg-gray-900/50">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-lg font-semibold text-orange-400">#{i + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removePair('features_uz', 'features_ru', i)}
                                            className="text-red-500 hover:text-red-400 font-medium"
                                        >
                                            O‘chirish
                                        </button>
                                    </div>

                                    <div>
                                        <Label className="text-white text-sm">Uzbekcha</Label>
                                        <Input
                                            value={formData.features_uz[i] || ""}
                                            onChange={e => updateItem('features_uz', i, e.target.value)}
                                            placeholder="Masalan: Moslashuvchan shartlar"
                                            className="bg-gray-800 border-gray-700 text-gray-100 mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-white text-sm">Русский</Label>
                                        <Input
                                            value={formData.features_ru[i] || ""}
                                            onChange={e => updateItem('features_ru', i, e.target.value)}
                                            placeholder="Например: Гибкие условия"
                                            className="bg-gray-800 border-gray-700 text-gray-100 mt-1"
                                        />
                                    </div>
                                </div>
                            ))}

                            <Button
                                type="button"
                                onClick={() => addPair('features_uz', 'features_ru')}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                <Plus className="mr-2 h-5 w-5" /> Yangi xususiyat qo‘shish
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Batafsil */}
                    <Card className="bg-gray-900/50 border-gray-800">
                        <CardHeader><CardTitle className="flex items-center gap-2 text-white"><CalendarIcon className="text-orange-500" /> Batafsil</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="text-white">Sarlavha (Uzbekcha)</Label>
                                    <Input value={formData.details_title_uz} onChange={e => handleChange('details_title_uz', e.target.value)} className="bg-gray-800 border-gray-700 text-gray-100 mt-1" />
                                </div>
                                <div>
                                    <Label className="text-white">Sarlavha (Русский)</Label>
                                    <Input value={formData.details_title_ru} onChange={e => handleChange('details_title_ru', e.target.value)} className="bg-gray-800 border-gray-700 text-gray-100 mt-1" />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="text-white">Matn (Uzbekcha)</Label>
                                    <Textarea value={formData.details_text_uz} onChange={e => handleChange('details_text_uz', e.target.value)} className="bg-gray-800 border-gray-700 text-gray-100 min-h-40 mt-1" />
                                </div>
                                <div>
                                    <Label className="text-white">Matn (Русский)</Label>
                                    <Textarea value={formData.details_text_ru} onChange={e => handleChange('details_text_ru', e.target.value)} className="bg-gray-800 border-gray-700 text-gray-100 min-h-40 mt-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Nega aynan biz? */}
                    <Card className="bg-gray-900/50 border-gray-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <MapPin className="text-orange-500" /> Nega aynan biz?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label className="text-white">Sarlavha (Uzbekcha)</Label>
                                    <Input value={formData.why_us_title_uz} onChange={e => handleChange('why_us_title_uz', e.target.value)} className="bg-gray-800 border-gray-700 text-gray-100 mt-1" />
                                </div>
                                <div>
                                    <Label className="text-white">Sarlavha (Русский)</Label>
                                    <Input value={formData.why_us_title_ru} onChange={e => handleChange('why_us_title_ru', e.target.value)} className="bg-gray-800 border-gray-700 text-gray-100 mt-1" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {formData.why_us_points_uz.map((_, i) => (
                                    <div key={i} className="border border-gray-700 rounded-lg p-5 space-y-4 bg-gray-900/50">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-lg font-semibold text-orange-400">#{i + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => removePair('why_us_points_uz', 'why_us_points_ru', i)}
                                                className="text-red-500 hover:text-red-400 font-medium"
                                            >
                                                O‘chirish
                                            </button>
                                        </div>

                                        <div>
                                            <Label className="text-white text-sm">Uzbekcha</Label>
                                            <Input
                                                value={formData.why_us_points_uz[i] || ""}
                                                onChange={e => updateItem('why_us_points_uz', i, e.target.value)}
                                                placeholder="Masalan: Tezkor to‘lovlar"
                                                className="bg-gray-800 border-gray-700 text-gray-100 mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-white text-sm">Русский</Label>
                                            <Input
                                                value={formData.why_us_points_ru[i] || ""}
                                                onChange={e => updateItem('why_us_points_ru', i, e.target.value)}
                                                placeholder="Например: Быстрые выплаты"
                                                className="bg-gray-800 border-gray-700 text-gray-100 mt-1"
                                            />
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    onClick={() => addPair('why_us_points_uz', 'why_us_points_ru')}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    <Plus className="mr-2 h-5 w-5" /> Yangi afzallik qo‘shish
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </form>
            </div>
        </AdminLayout>
    );
};

export default Invistitsiya;
