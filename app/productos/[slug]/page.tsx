// app/productos/[slug]/page.tsx
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductoDetalle({ params }: PageProps) {
  // 1. Esperamos a que los parámetros estén disponibles
  const { slug } = await params;

  // 2. Buscamos el producto en Supabase usando el campo slug
  const { data: producto, error } = await supabase
    .from('productos')
    .select('*, categorias(nombre)')
    .eq('slug', slug)
    .single();

  // 3. Si hay un error de base de datos o el producto no existe, enviamos al 404
  if (error || !producto) {
    console.error("Error buscando el producto:", error);
    notFound();
  }

  // Construimos la URL de la imagen desde tu bucket de Supabase
  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos-imagenes/${producto.imagen_url}`;

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-white">
      {/* Botón para regresar al catálogo principal */}
      <Link href="/" className="flex items-center gap-2 text-slate-500 mb-8 hover:text-blue-900 transition-colors font-bold uppercase text-xs tracking-widest">
        <ArrowLeft size={20} /> Volver al catálogo
      </Link>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
        {/* Contenedor de Imagen de la pieza 3D */}
        <div className="w-full md:w-1/2 bg-slate-50 rounded-[40px] p-8 md:p-16 flex items-center justify-center border border-slate-100 shadow-inner">
          <img 
            src={imageUrl}
            alt={producto.nombre}
            className="w-full h-auto max-h-[500px] object-contain drop-shadow-2xl rounded-2xl"
          />
        </div>

        {/* Información Detallada del Producto */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-3">
            {producto.categorias?.nombre || "General"}
          </span>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6 uppercase">
            {producto.nombre}
          </h1>
          
          <div className="h-1.5 w-24 bg-blue-900 mb-8" />

          <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-lg">
            {producto.descripcion || "Esta pieza exclusiva ha sido fabricada con tecnología de impresión 3D de alta precisión, cuidando cada detalle para ofrecer una calidad excepcional."}
          </p>
          
          <div className="text-5xl font-black text-slate-900 mb-12">
            ${producto.precio.toLocaleString('es-AR')}
          </div>

          {/* Enlace directo a WhatsApp con mensaje predefinido */}
          <a 
            href={`https://wa.me/5491141652850?text=Hola! Me interesa comprar el producto: ${producto.nombre}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-blue-900 text-white py-6 rounded-2xl font-bold text-xl shadow-2xl shadow-blue-200 hover:bg-blue-800 transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
          >
            <ShoppingCart size={26} /> CONSULTAR POR WHATSAPP
          </a>
          
          <p className="mt-6 text-center text-slate-400 text-sm font-medium">
            Envíos a toda Argentina 🇦🇷
          </p>
        </div>
      </div>
    </div>
  );
}