// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Producto } from '@/types';
import { Loader2, Search, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtro, setFiltro] = useState<string>('Todos');

  const categorias: string[] = ['Todos', 'Misión', 'Templos', 'Jesucristo', 'Familias'];

  // Carga de productos desde el esquema 'public' de Supabase
  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      
      let query = supabase
        .from('productos')
        .select('*, categorias!inner(nombre)');

      if (filtro !== 'Todos') {
        query = query.eq('categorias.nombre', filtro);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error cargando productos:", error);
      } else {
        setProductos(data as Producto[]);
      }
      setLoading(false);
    };

    cargarProductos();
  }, [filtro]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-blue-900">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold animate-pulse">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen">
      <header className="mb-8 md:mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black text-blue-900 tracking-tighter uppercase">
          Catálogo Moriancumer
        </h1>
        <p className="text-slate-500 italic text-sm md:text-base">
          Detalles únicos en impresión 3D que fortalecen la fe.
        </p>
      </header>

      {/* Filtros con scroll horizontal para móviles */}
      <div className="flex gap-3 mb-8 md:mb-12 overflow-x-auto pb-4 no-scrollbar">
        {categorias.map(cat => (
          <button 
            key={cat} 
            onClick={() => setFiltro(cat)}
            className={`px-6 md:px-8 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              filtro === cat 
                ? 'bg-blue-900 text-white shadow-lg' 
                : 'bg-white text-slate-500 border border-slate-100 hover:border-blue-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grilla de Productos con Navegación Directa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {productos.map((p) => (
          <div 
            key={p.id} 
            className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
          >
            {/* El clic en la imagen ahora lleva a la página del producto */}
            <Link href={`/productos/${p.slug}`} className="relative h-64 bg-slate-50 overflow-hidden block">
              <img 
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos-imagenes/${p.imagen_url}`}
                className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                alt={p.nombre}
              />
              <div className="absolute inset-0 bg-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full text-blue-900 shadow-xl">
                  <Search size={20} />
                </div>
              </div>
            </Link>

            <div className="p-5 flex flex-col flex-grow">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">
                {p.categorias?.nombre}
              </span>
              <h2 className="font-bold text-slate-800 text-lg leading-tight mb-2 h-12 line-clamp-2">
                {p.nombre}
              </h2>
              <p className="text-blue-900 font-black text-2xl mb-5">
                ${p.precio.toLocaleString('es-AR')}
              </p>
              
              {/* CAMBIO CLAVE: Navegación por URL en lugar de Modal */}
              <Link 
                href={`/productos/${p.slug}`}
                className="w-full mt-auto py-3 bg-slate-900 text-white rounded-xl font-bold text-xs text-center uppercase tracking-widest hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} /> Ver Detalles
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje de categoría vacía */}
      {productos.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">No se encontraron productos en esta categoría.</p>
        </div>
      )}
    </div>
  );
}