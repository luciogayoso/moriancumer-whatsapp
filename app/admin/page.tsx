'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Package, 
  Truck, 
  CheckCircle2, 
  MessageCircle, 
  Clock, 
  X, 
  Loader2,
  ExternalLink,
  Calendar
} from 'lucide-react';

// Define aquí tu email de administrador para la validación de seguridad
const ADMIN_EMAIL = "luciogayoso@gmail.com"; 

export default function AdminPanel() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [ordenesFiltradas, setOrdenesFiltradas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Estados para los filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtoEstado, setFiltroEstado] = useState('todos');

  // 1. Verificación de Seguridad
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/admin/login'); 
      } else {
        setUser(user);
        fetchOrdenes();
      }
    };
    checkUser();
  }, [router]);

  // 2. Obtener órdenes de Supabase
  async function fetchOrdenes() {
    setLoading(true);
    const { data, error } = await supabase
      .from('ordenes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) {
      setOrdenes(data || []);
      setOrdenesFiltradas(data || []);
    }
    setLoading(false);
  }

  // 3. Lógica de Filtrado Dinámico
  useEffect(() => {
    let resultado = ordenes;

    if (filtoEstado !== 'todos') {
      resultado = resultado.filter(o => o.estado_envio === filtoEstado);
    }

    if (busqueda) {
      const b = busqueda.toLowerCase();
      resultado = resultado.filter(o => 
        o.cliente_email?.toLowerCase().includes(b) || 
        o.id.toLowerCase().includes(b) ||
        o.cliente_telefono?.includes(b)
      );
    }

    setOrdenesFiltradas(resultado);
  }, [busqueda, filtoEstado, ordenes]);

  // 4. Actualizar estado de envío
  async function cambiarEstado(id: string, nuevoEstado: string) {
    const { error } = await supabase
      .from('ordenes')
      .update({ estado_envio: nuevoEstado })
      .eq('id', id);
    
    if (!error) fetchOrdenes();
  }

  // 5. Función de Notificación por WhatsApp
  const notificarWhatsApp = (orden: any) => {
    const telefono = orden.cliente_telefono?.replace(/\D/g, '');
    if (!telefono) return alert("El cliente no registró un teléfono válido.");

    let msj = "";
    switch(orden.estado_envio) {
      case 'despachado': msj = `¡Hola! Tu pedido #${orden.id.slice(0,5)} ya fue despachado. 🚚`; break;
      case 'entregado': msj = `¡Hola! Tu pedido #${orden.id.slice(0,5)} figura como entregado. ¡Gracias por tu compra! 🙏`; break;
      default: msj = `¡Hola! Estamos preparando tu pedido #${orden.id.slice(0,5)} de Morincumer. ✨`;
    }

    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(msj)}`, '_blank');
  };

  if (loading && !user) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-blue-900">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="font-black italic uppercase tracking-tighter">Cargando Panel de Control...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-blue-900 italic uppercase tracking-tighter">Gestión de Ventas</h1>
          <p className="text-slate-500 font-medium">Bienvenido, {user?.email}</p>
        </div>
        
        {/* Barra de Herramientas / Filtros */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar pedido o email..." 
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium w-full md:w-64 shadow-sm"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={filtoEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos los Estados</option>
            <option value="preparacion">📦 En Preparación</option>
            <option value="despachado">🚚 Despachado</option>
            <option value="entregado">✅ Entregado</option>
          </select>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid gap-4">
          {ordenesFiltradas.length > 0 ? (
            ordenesFiltradas.map((orden) => (
              <div key={orden.id} className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row justify-between gap-8">
                
                {/* Info de la Orden */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      ID: {orden.id.slice(0, 8)}
                    </span>
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Calendar size={12} /> {new Date(orden.created_at).toLocaleDateString()}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${orden.estado_pago === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      Pago: {orden.estado_pago}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{orden.cliente_email}</h3>
                  <p className="text-slate-500 text-sm font-medium mb-4">Tel: {orden.cliente_telefono || 'No registrado'}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {orden.items?.map((item: any, i: number) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold">
                        {item.title || item.producto?.nombre} (x{item.quantity || item.cantidad})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Acciones y Estados */}
                <div className="flex flex-col sm:flex-row lg:flex-col justify-between items-end gap-4 min-w-[200px]">
                  <p className="text-3xl font-black text-blue-900">${orden.total}</p>
                  
                  <div className="w-full space-y-3">
                    <select 
                      value={orden.estado_envio}
                      onChange={(e) => cambiarEstado(orden.id, e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="preparacion">📦 Preparación</option>
                      <option value="despachado">🚚 Despachado</option>
                      <option value="entregado">✅ Entregado</option>
                    </select>

                    <button 
                      onClick={() => notificarWhatsApp(orden)}
                      className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold text-xs hover:bg-green-600 transition-all shadow-lg shadow-green-100"
                    >
                      <MessageCircle size={16} /> Notificar por WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
              <Package className="mx-auto text-slate-200 mb-4" size={64} />
              <p className="text-slate-400 font-bold">No se encontraron ventas con los filtros aplicados.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}