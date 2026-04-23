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

  // --- CARGA DE DATOS DESDE GOOGLE SHEETS (APPS SCRIPT) ---
  useEffect(() => {
    const cargarDesdeGoogle = async () => {
      try {
        const url = "https://script.google.com/macros/s/AKfycbxtb2m2qmqquHdYGAvidKK11ojOfsSYGR3GJTlXQc9-dUyWo4CMZSvBmQ7KRT4bLXbSog/exec";
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        console.log("Datos recibidos de Google:", datos); // Esto se ve en la consola (F12)

        if (datos.length === 0) {
          alert("¡Ojo! El Excel respondió pero está vacío.");
        }

        const productosFormateados = datos.map((p: any) => ({
          id: Number(p.id) || Math.random(),
          name: p.name || "Sin nombre",
          price: Number(p.price) || 0,
          category: p.category || "Otros",
          description: p.description || "",
          image: p.image || "",
          whatsappCode: p.whatsappCode || "GT"
        }));

        setProducts(productosFormateados);
        setLoading(false);
      } catch (error) {
        console.error("Error crítico:", error);
        alert("Error de conexión. Revisa la consola.");
        setLoading(false);
      }
    };
    cargarDesdeGoogle();
  }, []);

  // --- LÓGICA DE FILTRADO MEJORADA ---
  const filteredProducts = products.filter(p => {
    // Convertimos ambos a minúsculas para que "Apple" y "apple" sean lo mismo
    const matchesCategory = category === 'Todos' ||
      p.category.toLowerCase().trim() === category.toLowerCase().trim();

    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // --- FUNCIONES DEL CARRITO ---
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

  // Pantalla de carga profesional
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-blue-500 font-black tracking-widest text-xs animate-pulse uppercase">Actualizando Inventario Growtech...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">

      {/* 1. NAVBAR (Corregido con tu logo) */}
      <nav className="bg-black/90 backdrop-blur-xl py-6 px-8 sticky top-0 z-[60] border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <img src="/logo-growtech.png" alt="Growtech Logo" className="h-10" />

          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="¿Qué equipo necesitas hoy?"
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-6 text-[11px] font-bold uppercase tracking-widest overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`transition-all whitespace-nowrap pb-1 ${category === cat ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 2. GRID DE PRODUCTOS */}
      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredProducts.length > 0 ? filteredProducts.map(product => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="bg-slate-900/40 p-6 rounded-[3rem] border border-slate-800 hover:border-blue-500/50 transition-all group cursor-pointer"
          >
            <div className="h-56 bg-slate-800/50 rounded-[2rem] mb-6 flex items-center justify-center overflow-hidden">
              <img src={product.image} alt={product.name} className="h-40 object-contain group-hover:scale-110 transition-transform duration-700" />
            </div>
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">{product.category}</span>
            <h3 className="text-2xl font-bold mt-2 leading-tight group-hover:text-blue-400 transition-colors">{product.name}</h3>

            <div className="flex justify-between items-center mt-8">
              <div className="flex flex-col">
                <span className="text-3xl font-black">${product.price}</span>
                <span className="text-[10px] text-slate-500 font-bold tracking-tight">PRECIO FINAL / INC. IVA</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                className="bg-white text-black px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-600 hover:text-white transition-all active:scale-90"
              >
                + Comprar
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-20 text-slate-500">
            No se encontraron productos en esta categoría.
          </div>
        )}
      </main>

      {/* 3. MODAL DE DETALLES */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] shadow-3xl flex flex-col md:flex-row relative">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-all z-10">✕</button>

            <div className="md:w-1/2 bg-slate-800/30 flex items-center justify-center p-16">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="max-h-96 object-contain drop-shadow-2xl" />
            </div>

            <div className="md:w-1/2 p-12 flex flex-col justify-center">
              <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-xs mb-4">{selectedProduct.category}</span>
              <h2 className="text-5xl font-black mb-6 leading-tight">{selectedProduct.name}</h2>
              <p className="text-slate-400 text-lg font-light leading-relaxed mb-10">{selectedProduct.description}</p>

              <div className="flex items-center justify-between mt-auto pt-10 border-t border-slate-800">
                <div className="flex flex-col">
                  <span className="text-5xl font-black">${selectedProduct.price}</span>
                  <span className="text-xs text-slate-500 font-bold mt-1 uppercase">IVA Incluido</span>
                </div>
                <button
                  onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                  className="bg-blue-600 hover:bg-white hover:text-black text-white px-12 py-5 rounded-3xl font-black transition-all shadow-xl shadow-blue-900/20"
                >
                  Añadir al Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CARRITO FLOTANTE */}
      {cart.length > 0 && (
        <div className="fixed bottom-8 right-8 w-full max-w-sm bg-slate-900/95 backdrop-blur-2xl rounded-[3rem] shadow-3xl border border-slate-800 p-8 z-[80]">
          <h3 className="text-xl font-black mb-6">Tu Pedido</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto mb-8 pr-2">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-3xl border border-slate-800">
                <img src={item.image} className="w-14 h-14 object-contain bg-slate-700 rounded-xl" alt="" />
                <div className="flex-1">
                  <p className="text-xs font-bold truncate w-32">{item.name}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="bg-slate-700 w-6 h-6 rounded-lg flex items-center justify-center">-</button>
                    <span className="text-xs font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="bg-blue-600 w-6 h-6 rounded-lg flex items-center justify-center">+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-500">✕</button>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mb-6 pt-6 border-t border-slate-800">
            <span className="text-slate-500 font-bold">Total:</span>
            <span className="text-3xl font-black text-blue-500">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={() => window.open(generateWhatsappLink(cart), '_blank')}
            className="w-full bg-green-500 py-5 rounded-[1.5rem] font-black text-sm tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-900/20"
          >
            CONFIRMAR WHATSAPP
          </button>
        </div>
      )}

      {/* 5. FOOTER PROFESIONAL */}
      <footer className="bg-black border-t border-slate-900 mt-32 pt-20 pb-10 px-8 text-center md:text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <img src="/logo-growtech.png" alt="Growtech Logo" className="h-10 mx-auto md:mx-0" />
            <p className="text-slate-500 text-sm leading-relaxed font-light mt-6">
              Expertos en tecnología de alto rendimiento, drones y soluciones multimedia en Guayaquil.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-8">Síguenos</h4>
            <div className="flex justify-center md:justify-start gap-5">
              <a href="https://www.instagram.com/growtech.ec/" target='_blank' rel="noreferrer" className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all text-xl">📸</a>
              <a href="https://wa.me/593978941301" target='_blank' rel="noreferrer" className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all text-xl">📱</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-8">Contacto</h4>
            <p className="text-slate-500 text-sm font-light">Guayaquil, Ecuador</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-900/50 mt-20 pt-10">
          <p className="text-slate-700 text-[9px] tracking-[0.5em] font-bold">
            © 2026 GROWTECH TECHNOLOGY & MEDIA.
          </p>
        </div>
      </footer>
    </div>
  );
}