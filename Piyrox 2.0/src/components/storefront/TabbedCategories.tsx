"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  imageUrl: string | null;
  avgRating: number;
  stockCount: number;
  unlimitedStock: boolean;
  inStock: boolean;
}

interface TabbedCategoriesProps {
  categories: { id: string; label: string; products: Product[] }[];
}

export default function TabbedCategories({ categories }: TabbedCategoriesProps) {
  const [activeTab, setActiveTab] = useState(categories[0]?.id || "");

  if (categories.length === 0) return null;

  const activeProducts = categories.find((c) => c.id === activeTab)?.products || [];

  return (
    <section className="border-t border-white/10 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Browse by Category
            </h2>
            <p className="text-white/60 text-sm">Find exactly what you need.</p>
          </div>
          
          {/* Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide gap-2 p-1 bg-white/[0.02] border border-white/10 rounded-xl">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveTab(c.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === c.id
                    ? "bg-white/[0.08] text-white shadow-lg border border-white/10"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {activeProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href={`/products?category=${activeTab}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.08] hover:border-white/20 transition-all text-sm font-medium group"
          >
            View all in {categories.find((c) => c.id === activeTab)?.label}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
