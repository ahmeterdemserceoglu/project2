'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string | null;
  created_at: string;
};

export default function AdminContactMessageDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  const [item, setItem] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>('new');

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      try {
        const res = await fetch(`/api/admin/contact-messages/${id}`, { cache: 'no-store' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Kayıt alınamadı');
        }
        const data = (await res.json()) as { item: ContactMessage };
        setItem(data.item);
        setStatus(data.item.status || 'new');
      } catch (e: any) {
        setError(e?.message || 'Beklenmeyen bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const updateStatus = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Güncelleme başarısız');
      }
    } catch (e: any) {
      setError(e?.message || 'Beklenmeyen bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mesaj Detayı</h1>
          <p className="text-sm text-gray-500">ID: {id}</p>
        </div>
        <Link href="/admin/contact-messages" className="text-sm text-indigo-600 hover:underline">
          ← Mesaj listesine dön
        </Link>
      </div>

      {loading && <div className="text-sm text-gray-600">Yükleniyor...</div>}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-800 px-4 py-3 border border-red-200">
          {error}
        </div>
      )}

      {item && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-medium mb-4">Gönderen Bilgileri</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Ad Soyad: </span>
                  <span className="text-gray-800">{item.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">E-posta: </span>
                  <a href={`mailto:${item.email}`} className="text-indigo-600 hover:underline">{item.email}</a>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Telefon: </span>
                  <span className="text-gray-800">{item.phone || '-'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tarih: </span>
                  <span className="text-gray-800">{new Date(item.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-medium mb-4">Durum</h2>
              <div className="flex items-center gap-3">
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={saving}
                >
                  <option value="new">Yeni</option>
                  <option value="in_progress">İşlemde</option>
                  <option value="resolved">Çözüldü</option>
                </select>
                <button
                  onClick={updateStatus}
                  disabled={saving}
                  className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-medium mb-2">Konu</h2>
            <div className="text-gray-800">{item.subject}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-medium mb-2">Mesaj</h2>
            <pre className="whitespace-pre-wrap text-gray-800 text-sm">{item.message}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
