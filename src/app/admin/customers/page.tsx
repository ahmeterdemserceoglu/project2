"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@/lib/supabase";

interface Customer {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
}

export default function CustomersPage() {
  const supabase = createClientComponentClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, phone")
        .eq("is_admin", false)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setCustomers(data as Customer[]);
      } else {
        console.error("Error loading customers", error);
        setCustomers([]);
      }
      setIsLoading(false);
    };
    fetchCustomers();
  }, [supabase]);

  if (isLoading) {
    return <div className="p-8">Yükleniyor...</div>;
  }

  if (customers.length === 0) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-sm">
        Şu an müşteri bulunmuyor.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Müşteriler</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İsim
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                E-posta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefon
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {c.first_name || ""} {c.last_name || ""}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{c.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{c.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/customers/${c.id}`} className="text-primary hover:text-primary-dark">
                    Görüntüle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
