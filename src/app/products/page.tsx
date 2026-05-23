"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './products.module.css';

interface Product {
  id: string;
  name: string;
  description: string;
  version: string;
  releaseDate: string;
  downloadUrl: string;
  size: string;
  changelog: string[];
  requirements: {
    os: string[];
    ram: string;
    disk: string;
  };
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        setError('Failed to load products');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (productId: string, downloadUrl: string) => {
    setDownloading(productId);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();

      if (data.success) {
        // Trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = downloadUrl.split('/').pop() || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError(data.message || 'Download failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading products...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.logo}>PiyRox</Link>
        <h1>Our Products</h1>
        <p>Download the latest versions of PiyRox tools</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.productsGrid}>
        {products.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productHeader}>
              <h2>{product.name}</h2>
              <span className={styles.version}>v{product.version}</span>
            </div>

            <p className={styles.description}>{product.description}</p>

            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <strong>Size:</strong> {product.size}
              </div>
              <div className={styles.metaItem}>
                <strong>Released:</strong> {new Date(product.releaseDate).toLocaleDateString()}
              </div>
            </div>

            <div className={styles.requirements}>
              <h3>Requirements</h3>
              <ul>
                <li><strong>OS:</strong> {product.requirements.os.join(', ')}</li>
                <li><strong>RAM:</strong> {product.requirements.ram}</li>
                <li><strong>Disk:</strong> {product.requirements.disk}</li>
              </ul>
            </div>

            <div className={styles.changelog}>
              <h3>What's New</h3>
              <ul>
                {product.changelog.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <button
              className={styles.downloadBtn}
              onClick={() => handleDownload(product.id, product.downloadUrl)}
              disabled={downloading === product.id}
            >
              {downloading === product.id ? 'Downloading...' : 'Download Now'}
            </button>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <Link href="/">← Back to Home</Link>
      </div>
    </div>
  );
}
