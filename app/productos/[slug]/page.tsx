'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Producto } from '@/types';
import { useCarrito } from '@/context/CarritoContext'; // Tu context existente
import { Loader2, ShoppingCart, ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProductoDetalle() {
  const { slug } = useParams();
  const { agregarAlCarrito } = useCarrito();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);

 // Dentro de tu componente ProductoDetalle
useEffect(() => {
  const cargarProducto = async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('*, categorias(nombre)')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      setProducto(data);
      
      // CARGA DINÁMICA DEL PÍXEL PARA VIEWCONTENT
      const ReactPixel = (await import('react-facebook-pixel')).default;
      ReactPixel.init('TU_ID_DE_DATASET_AQUÍ'); 
      ReactPixel.track('ViewContent', {
        content_name: data.nombre,
        content_category: data.categorias?.nombre,
        value: data.precio,
        currency: 'ARS',
      });
    }
    setLoading(false);
  };

  if (slug) cargarProducto();
}, [slug]);

 const handleAgregar = async () => {
  if (producto) {
    agregarAlCarrito(producto, 1);
    
    // CARGA DINÁMICA PARA EL CLICK
    const ReactPixel = (await import('react-facebook-pixel')).default;
    ReactPixel.track('AddToCart', {
      content_name: producto.nombre,
      value: producto.precio,
      currency: 'ARS',
    });
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-blue-900">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!producto) return <div className="text-center py-20">Producto no encontrado.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-900 mb-8 font-bold transition-colors">
        <ArrowLeft size={20} /> Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-6 md:p-12 rounded-[40px] shadow-sm border border-slate-100">
        {/* Imagen del Producto */}
        <div className="bg-slate-50 rounded-3xl p-8 flex items-center justify-center overflow-hidden">
          <img 
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos-imagenes/${producto.imagen_url}`}
            alt={producto.nombre}
            className="max-h-[400px] w-full object-contain hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Info y Botones */}
        <div className="flex flex-col justify-center">
          <span className="text-blue-600 font-black uppercase tracking-[0.2em] text-xs mb-2">
            {producto.categorias?.nombre}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
            {producto.nombre}
          </h1>
          <p className="text-slate-500 text-lg mb-8 leading-relaxed">
            {producto.descripcion || "Detalle único fabricado con precisión en impresión 3D, ideal para fortalecer la fe en el hogar."}
          </p>
          
          <div className="mb-10">
            <span className="text-4xl font-black text-blue-900">
              ${producto.precio.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {/* BOTÓN PRINCIPAL: AGREGAR AL CARRITO */}
            <button 
              onClick={handleAgregar}
              className="flex items-center justify-center gap-3 w-full py-5 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-800 hover:shadow-xl transition-all active:scale-95"
            >
              <ShoppingCart size={22} /> Agregar al carrito
            </button>

            {/* BOTÓN SECUNDARIO: CONSULTA DIRECTA */}
            <a 
              href={`https://wa.me/5491141652850?text=Hola! Me interesa el producto: ${producto.nombre}`}
              target="_blank"
              className="flex items-center justify-center gap-3 w-full py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              <MessageCircle size={22} className="text-green-500" /> Consultar stock
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}