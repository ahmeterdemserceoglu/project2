"use client";

import { useState } from "react";
import PreInformationForm from "./PreInformationForm";
import DistanceSalesContract from "./DistanceSalesContract";

interface LegalAgreementsProps {
  orderData: {
    buyer: {
      name: string;
      address: string;
      phone: string;
      email: string;
    };
    items: Array<{
      id: string;
      name: string;
      description?: string;
      price: number;
      quantity: number;
      features?: string[];
    }>;
    subtotal: number;
    shipping: number;
    total: number;
    paymentMethod: string;
    orderId: string;
    orderDate: string;
  };
  onComplete: () => void;
  onCancel: () => void;
}

export default function LegalAgreements({ orderData, onComplete, onCancel }: LegalAgreementsProps) {
  const [currentStep, setCurrentStep] = useState<'preInfo' | 'contract' | 'completed'>('preInfo');
  const [preInfoAccepted, setPreInfoAccepted] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);

  // Sabit satıcı bilgileri - HD Ticaret (Tek satıcı sistemi)
  const sellerInfo = {
    name: "HD Ticaret Elektronik ve Bilgisayar Ltd. Şti.",
    address: "Merkez Mahallesi, Teknoloji Caddesi No:123/A, Şişli/İstanbul 34394",
    phone: "0212 555 0123",
    email: "info@hdticaret.com",
    taxNumber: "1234567890",
    mersisNumber: "0123456789012345"
  };

  const preInformationData = {
    seller: sellerInfo,
    buyer: orderData.buyer,
    products: orderData.items.map(item => ({
      name: item.name,
      description: item.description || "Ürün açıklaması",
      price: item.price,
      quantity: item.quantity,
      features: item.features || ["Kaliteli malzeme", "Garantili ürün"]
    })),
    delivery: {
      method: "Kargo ile teslimat",
      cost: orderData.shipping,
      timeframe: "1-3 iş günü",
      address: orderData.buyer.address
    },
    payment: {
      methods: ["Kredi Kartı", "Banka Kartı", "Havale/EFT"],
      totalAmount: orderData.total
    },
    withdrawal: {
      period: 14,
      conditions: [
        "Ürün orijinal ambalajında olmalıdır",
        "Ürün kullanılmamış durumda olmalıdır",
        "Fatura ve diğer belgeler eksiksiz olmalıdır",
        "Hijyen açısından uygun olmayan ürünlerde cayma hakkı kullanılamaz"
      ],
      address: sellerInfo.address,
      phone: sellerInfo.phone,
      email: sellerInfo.email
    }
  };

  const contractData = {
    buyer: orderData.buyer,
    seller: sellerInfo,
    order: {
      id: orderData.orderId,
      date: orderData.orderDate,
      items: orderData.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod
    }
  };

  const handlePreInfoAccept = () => {
    setPreInfoAccepted(true);
    setCurrentStep('contract');
  };

  const handleContractAccept = () => {
    setContractAccepted(true);
    setCurrentStep('completed');
    onComplete();
  };

  if (currentStep === 'preInfo') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">Ön Bilgilendirme</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Mesafeli Satış Sözleşmesi</span>
              </div>
            </div>
          </div>

          <PreInformationForm
            data={preInformationData}
            onAccept={handlePreInfoAccept}
            onReject={onCancel}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'contract') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">Ön Bilgilendirme</span>
              </div>
              <div className="w-16 h-0.5 bg-green-600"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">Mesafeli Satış Sözleşmesi</span>
              </div>
            </div>
          </div>

          <DistanceSalesContract
            contractData={contractData}
            onAccept={handleContractAccept}
            onReject={onCancel}
          />
        </div>
      </div>
    );
  }

  return null;
}