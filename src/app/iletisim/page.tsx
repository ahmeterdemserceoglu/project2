'use client';

import { useState } from 'react';

import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccess(null);
        setError(null);
        try {
            const res = await fetch('/api/contact-messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.error || 'Mesaj gönderilirken bir hata oluştu');
            }
            setSuccess('Mesajınız alınmıştır, en kısa sürede sizinle iletişime geçilecektir.');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (err: any) {
            setError(err?.message || 'Beklenmeyen bir hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold text-center mb-4">İletişim</h1>
                    <p className="text-xl text-center text-blue-100">
                        Sorularınız için bizimle iletişime geçin
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* İletişim Bilgileri */}
                    <div className="lg:col-span-1">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">İletişim Bilgileri</h2>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <MapPin className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-1">Adres</h3>
                                    <p className="text-gray-600">
                                        Merkez Mahallesi<br />
                                        Atatürk Caddesi No: 123<br />
                                        34000 İstanbul, Türkiye
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Phone className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-1">Telefon</h3>
                                    <p className="text-gray-600">+90 212 123 45 67</p>
                                    <p className="text-gray-600">+90 532 123 45 67</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Mail className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-1">E-posta</h3>
                                    <p className="text-gray-600">info@hdticaret.com</p>
                                    <p className="text-gray-600">destek@hdticaret.com</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-1">Çalışma Saatleri</h3>
                                    <p className="text-gray-600">Pazartesi - Cuma: 09:00 - 18:00</p>
                                    <p className="text-gray-600">Cumartesi: 09:00 - 16:00</p>
                                    <p className="text-gray-600">Pazar: Kapalı</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* İletişim Formu */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Bize Yazın</h2>

                            {success && (
                                <div className="mb-6 rounded-lg bg-green-50 text-green-800 px-4 py-3 border border-green-200">
                                    {success}
                                </div>
                            )}
                            {error && (
                                <div className="mb-6 rounded-lg bg-red-50 text-red-800 px-4 py-3 border border-red-200">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Ad Soyad *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Adınızı ve soyadınızı girin"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            E-posta *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="E-posta adresinizi girin"
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Telefon
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Telefon numaranızı girin"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                            Konu *
                                        </label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            required
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={submitting}
                                        >
                                            <option value="">Konu seçin</option>
                                            <option value="genel">Genel Bilgi</option>
                                            <option value="siparis">Sipariş</option>
                                            <option value="destek">Teknik Destek</option>
                                            <option value="sikayet">Şikayet</option>
                                            <option value="oneri">Öneri</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Mesaj *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={6}
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Mesajınızı buraya yazın..."
                                        disabled={submitting}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center space-x-2"
                                >
                                    <Send className="w-5 h-5" />
                                    <span>{submitting ? 'Gönderiliyor...' : 'Mesaj Gönder'}</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Harita Bölümü */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Konum</h2>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="h-96 bg-gray-200 flex items-center justify-center">
                            <p className="text-gray-500">Harita buraya eklenecek</p>
                            {/* Google Maps veya başka bir harita servisi buraya eklenebilir */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 