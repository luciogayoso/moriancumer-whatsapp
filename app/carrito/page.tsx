'use client';

import { useState, useEffect } from 'react';
import { useCarrito } from '@/context/CarritoContext';
import { Trash2, Plus, Minus, ShoppingBag, Loader2, Calculator, Truck, CheckCircle2 } from 'lucide-react';

const TABLA_ZONAS = [
  { id: 'caba', nombre: 'CABA', costo: 4500 },
  { id: 'gba', nombre: 'GBA Norte/Sur', costo: 6500 },
  { id: 'interior', nombre: 'Interior del País', costo: 9800 },
  { id: 'retiro', nombre: 'Retiro en Local', costo: 0 },
];

export default function CarritoPage() {
  const { carrito, agregarAlCarrito, eliminarDelCarrito } = useCarrito();
  const [isMounted, setIsMounted] = useState(false);
  const [isEnviando, setIsEnviando] = useState(false);
  const [zona, setZona] = useState(TABLA_ZONAS[0]);

  useEffect(() => { 
    setIsMounted(true); 
  }, []);

  const subtotal = carrito.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
  const montoEnvioGratis = 50000;
  const esEnvioGratis = subtotal >= montoEnvioGratis;
  const costoFinalEnvio = esEnvioGratis ? 0 : zona.costo;
  const totalFinal = subtotal + costoFinalEnvio;

  const handleWhatsAppCheckout = async () => { // Agregamos async
    setIsEnviando(true);
    
    // --- INTEGRACIÓN META PIXEL ---
    try {
      const ReactPixel = (await import('react-facebook-pixel')).default;
      // Registramos que el usuario inició el proceso de pago
      ReactPixel.track('InitiateCheckout', {
        content_ids: carrito.map(item => item.producto.id),
        contents: carrito.map(item => ({
          id: item.producto.id,
          quantity: item.cantidad
        })),
        value: totalFinal,
        currency: 'ARS',
        num_items: carrito.length
      });
    } catch (error) {
      console.error("Error al cargar Meta Pixel:", error);
    }
    // ------------------------------

    const TELEFONO_VENTAS = "5491141652850"; 

    const listaProductos = carrito.map(item => 
      `• ${item.cantidad}x ${item.producto.nombre} ($${(item.producto.precio * item.cantidad).toLocaleString('es-AR')})`
    ).join('\n');

    const mensaje = `
*NUEVA ORDEN DE COMPRA* 🛍️
--------------------------
*Productos:*
${listaProductos}

*Resumen del Pedido:*
- Subtotal: $${subtotal.toLocaleString('es-AR')}
- Envío (${zona.nombre}): ${esEnvioGratis ? '¡GRATIS!' : `$${zona.costo.toLocaleString('es-AR')}`}
--------------------------
*TOTAL A PAGAR: $${totalFinal.toLocaleString('es-AR')}*

_Hola! Me gustaría coordinar el pago y la entrega de estos productos._
    `.trim();

    const url = `https://wa.me/${TELEFONO_VENTAS}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank');
    setIsEnviando(false);
  };

  if (!isMounted) return <div className="min-h-screen bg-white" />;

  // ... El resto del código de renderizado (Carrito vacío y Return) se mantiene igual que tu archivo original ...
  if (carrito.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center min-h-[60vh]">
        <ShoppingBag size={64} className="text-slate-200 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Tu carrito está vacío</h2>
        <p className="text-slate-500 mb-8 font-medium">¡Agregá algunos productos para comenzar!</p>
        <a href="/" className="bg-blue-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors">
          VER PRODUCTOS
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12">
      {/* Tu código de renderizado original aquí... */}
      <h1 className="text-4xl font-black text-blue-900 mb-10 tracking-tighter italic uppercase">Tu Carrito</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* COLUMNA IZQUIERDA: PRODUCTOS */}
        <div className="lg:col-span-2 space-y-4">
          {!esEnvioGratis && (
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6">
              <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                <Truck size={18} /> 
                ¡Estás a <span className="font-bold">${(montoEnvioGratis - subtotal).toLocaleString('es-AR')}</span> del envío gratis!
              </p>
              <div className="w-full bg-blue-200 h-2 rounded-full mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((subtotal / montoEnvioGratis) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {carrito.map((item) => (
            <div key={item.producto.id} className="flex items-center gap-4 md:gap-6 bg-white p-4 md:p-5 rounded-[24px] border shadow-sm transition-hover hover:shadow-md">
              <img 
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/productos-imagenes/${item.producto.imagen_url}`} 
                className="w-16 h-16 md:w-20 md:h-20 object-contain" 
                alt={item.producto.nombre} 
              />
              <div className="flex-1">
                <h3 className="font-bold text-sm md:text-base text-slate-800">{item.producto.nombre}</h3>
                <p className="text-blue-600 font-black">${item.producto.precio.toLocaleString('es-AR')}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center bg-slate-100 rounded-lg">
                    <button onClick={() => agregarAlCarrito(item.producto, -1)} className="p-2 hover:text-blue-600 transition-colors"><Minus size={14}/></button>
                    <span className="w-8 text-center font-bold text-sm">{item.cantidad}</span>
                    <button onClick={() => agregarAlCarrito(item.producto, 1)} className="p-2 hover:text-blue-600 transition-colors"><Plus size={14}/></button>
                  </div>
                  <button onClick={() => eliminarDelCarrito(item.producto.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* COLUMNA DERECHA: RESUMEN */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[32px] border shadow-xl sticky top-28">
            <h2 className="font-black text-xl mb-6 flex items-center gap-2 uppercase text-slate-800"><Calculator /> Resumen</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">${subtotal.toLocaleString('es-AR')}</span>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Zona de Envío</label>
                <select 
                  className="w-full p-3 rounded-xl border bg-slate-50 text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
                  value={zona.id}
                  onChange={(e) => setZona(TABLA_ZONAS.find(z => z.id === e.target.value)!)}
                >
                  {TABLA_ZONAS.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.nombre} {z.costo > 0 ? `(+$${z.costo.toLocaleString('es-AR')})` : '(Gratis)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Envío</span>
                {esEnvioGratis ? (
                  <span className="text-green-600 font-bold flex items-center gap-1 text-sm">
                    <CheckCircle2 size={14} /> GRATIS
                  </span>
                ) : (
                  <span className="font-bold text-slate-900">${zona.costo.toLocaleString('es-AR')}</span>
                )}
              </div>
              
              <div className="h-px bg-slate-100 my-4" />
              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-800">Total</span>
                <span className="text-3xl font-black text-blue-900">${totalFinal.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <div className="mt-8">
              <button
                disabled={isEnviando}
                onClick={handleWhatsAppCheckout}
                className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all shadow-lg shadow-green-100 uppercase tracking-tight"
              >
                {isEnviando ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    Finalizar por WhatsApp
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-4 font-medium px-4">
                Serás redirigido a WhatsApp para coordinar el pago y los datos de entrega de tu pedido.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}