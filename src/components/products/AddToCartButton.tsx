"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store";
import toast from "react-hot-toast";

type AddToCartButtonProps = {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  selectedAttributes?: Record<string, string>;
};

const AddToCartButton = ({
  product,
  selectedAttributes,
}: AddToCartButtonProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    setIsAdding(true);

    // Add item to cart
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      attributes: selectedAttributes,
    });

    // Show toast notification
    toast.success("Ürün sepete eklendi", {
      style: {
        border: "1px solid #34D399",
        padding: "16px",
        backgroundColor: "#ECFDF5",
        color: "#065F46",
      },
      iconTheme: {
        primary: "#10B981",
        secondary: "#FFFFFF",
      },
      duration: 3000,
    });

    // Reset adding state after a short delay
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className="btn btn-primary w-full py-3 flex items-center justify-center text-white bg-primary hover:bg-primary-dark focus:ring-4 focus:ring-primary/30 transition-all duration-200 rounded-md"
      data-oid="m-8kfdj"
    >
      {isAdding ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            data-oid="ufrruzh"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              data-oid="4da04_p"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              data-oid="9pv3qd_"
            ></path>
          </svg>
          Sepete Eklendi
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
            data-oid="47xie8p"
          >
            <path
              d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
              data-oid=".lynamd"
            />
          </svg>
          Sepete Ekle
        </>
      )}
    </button>
  );
};

export default AddToCartButton;
