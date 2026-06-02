export const categories = ["Streaming", "Gaming", "Software", "VPN"];

export const products = Array.from({ length: 65 }).map((_, i) => ({
  id: `prod_${i + 1}`,
  name: i % 4 === 0 ? `Netflix Premium ${i}M` : i % 4 === 1 ? `Spotify Premium ${i}M` : i % 4 === 2 ? `Xbox Game Pass ${i}M` : `NordVPN ${i}M`,
  description: `High-quality private digital subscription for ${i + 1} months. Full warranty and instant delivery.`,
  price: (Math.random() * 20 + 2).toFixed(2),
  category: categories[i % 4],
  stock: Math.floor(Math.random() * 100),
}));
