import React, { useState, useEffect } from 'react';
import { Product, CartItem } from './types';
import { generateWhatsappLink } from './cart';

// --- 1. CONFIGURACIÓN DE CATEGORÍAS ---
const categories = ['Todos', 'Apple', 'Foto & Video', 'Computación', 'Celulares', 'Hogar'];

export default function App() {
  // --- ESTADOS ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // --- CARGA DE DATOS DESDE GOOGLE SHEETS ---
  useEffect(() => {
    const cargarDesdeGoogle = async () => {
      try {
        const url = "https://script.google.com/macros/s/AKfycbxtb2m2qmqquHdYGAvidKK11ojOfsSYGR3GJTlXQc9-dUyWo4CMZSvBmQ7KRT4bLXbSog/exec";
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        const productosFormateados = datos.map((p: any) => ({
          id: Number(p.id) || Math.random(),
          name: p.name || "Sin nombre",
          price: Number(p.price) || 0,
          category: p.category || "Otros",
          description: p.description || "",
          // CAMBIO 1: Convertimos el texto de la celda en una lista (Array)
          images: p.image ? p.image.split(',').map((img: string) => img.trim()) : ["/assets/placeholder.webp"],
          whatsappCode: p.whatsappCode || "GT"
        }));

        setProducts(productosFormateados);
        setLoading(false);
      } catch (error) {
        console.error("Error crítico:", error);
        setLoading(false);
      }
    };
    cargarDesdeGoogle();
  }, []);

  // --- LÓGICA DE FILTRADO ---
  const filteredProducts = products.filter(p => {
    const matchesCategory = category === 'Todos' ||
      p.category.toLowerCase().trim() === category.toLowerCase().trim();
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- FUNCIONES DEL CARRITO (Se mantienen igual) ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, amount: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + amount;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-blue-500">Cargando...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <nav className="bg-black/90 py-6 px-8 sticky top-0 z-[60] border-b border-slate-800">
         {/* ... Contenido del Navbar ... */}
      </nav>

      {/* 2. GRID DE PRODUCTOS */}
      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="bg-slate-900/40 p-6 rounded-[3rem] border border-slate-800 hover:border-blue-500 transition-all group cursor-pointer"
          >
            <div className="h-56 bg-slate-800/50 rounded-[2rem] mb-6 flex items-center justify-center overflow-hidden">
              {/* CAMBIO 2: Ahora usamos product.images[0] */}
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="h-40 object-contain group-hover:scale-110 transition-transform duration-700" 
              />
            </div>
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">{product.category}</span>
            <h3 className="text-2xl font-bold mt-2 leading-tight">{product.name}</h3>
            {/* ... Resto de la tarjeta ... */}
            <div className="flex justify-between items-center mt-8">
                <span className="text-3xl font-black">${product.price}</span>
                <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="bg-white text-black px-8 py-3 rounded-2xl font-black text-sm">+ Comprar</button>
            </div>
          </div>
        ))}
      </main>

      {/* 3. MODAL DE DETALLES */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] flex flex-col md:flex-row relative">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center z-10">✕</button>

            <div className="md:w-1/2 bg-slate-800/30 flex items-center justify-center p-16">
              {/* CAMBIO 3: Aquí también usamos selectedProduct.images[0] */}
              <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="max-h-96 object-contain" />
            </div>

            <div className="md:w-1/2 p-12 flex flex-col justify-center">
              <h2 className="text-5xl font-black mb-6">{selectedProduct.name}</h2>
              <p className="text-slate-400 text-lg mb-10">{selectedProduct.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-5xl font-black">${selectedProduct.price}</span>
                <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="bg-blue-600 text-white px-12 py-5 rounded-3xl font-black">Añadir al Carrito</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CARRITO (Ajustado para usar la primera imagen) */}
      {cart.length > 0 && (
        <div className="fixed bottom-8 right-8 w-full max-w-sm bg-slate-900 rounded-[3rem] p-8 z-[80] border border-slate-800">
           {cart.map(item => (
             <div key={item.id} className="flex items-center gap-4 mb-4">
                {/* CAMBIO 4: Imagen del carrito */}
                <img src={item.images[0]} className="w-14 h-14 object-contain bg-slate-700 rounded-xl" alt="" />
                <div className="flex-1 text-xs font-bold">{item.name}</div>
                {/* ... botones cantidad ... */}
             </div>
           ))}
           {/* ... Botón confirmar ... */}
        </div>
      )}
    </div>
  );
}
