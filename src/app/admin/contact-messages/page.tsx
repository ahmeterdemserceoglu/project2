'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

export default function AdminContactMessagesPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/admin/contact-messages', { cache: 'no-store' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Kayıtlar alınamadı');
        }
        const data = (await res.json()) as { items: ContactMessage[] };
        setItems(data.items || []);
      } catch (e: any) {
        setError(e?.message || 'Beklenmeyen bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">İletişim Mesajları</h1>
        <p className="text-sm text-muted-foreground">Kullanıcıların iletişim formundan gönderdiği mesajlar</p>
      </div>

      {loading && <div className="text-sm text-gray-600">Yükleniyor...</div>}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-800 px-4 py-3 border border-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Tarih</th>
                <th className="px-4 py-3 text-left font-medium">Ad Soyad</th>
                <th className="px-4 py-3 text-left font-medium">E-posta</th>
                <th className="px-4 py-3 text-left font-medium">Telefon</th>
                <th className="px-4 py-3 text-left font-medium">Konu</th>
                <th className="px-4 py-3 text-left font-medium">Mesaj</th>
                <th className="px-4 py-3 text-left font-medium">Durum</th>
                <th className="px-4 py-3 text-left font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    Kayıt bulunamadı
                  </td>
                </tr>
              )}
              {items.map((m) => (
                <tr key={m.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {new Date(m.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{m.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a href={`mailto:${m.email}`} className="text-blue-600 hover:underline">
                      {m.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{m.phone || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link href={`/admin/contact-messages/${m.id}`} className="text-indigo-600 hover:underline">
                      {m.subject}
                    </Link>
                  </td>
                  <td className="px-4 py-3 max-w-xl">
                    <div className="line-clamp-3 text-gray-700">{m.message}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-xs">
                      {m.status || 'new'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link href={`/admin/contact-messages/${m.id}`} className="text-sm text-indigo-600 hover:underline">
                      İncele
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
