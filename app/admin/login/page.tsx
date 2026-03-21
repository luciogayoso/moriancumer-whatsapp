'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Credenciales inválidas");
    else router.push('/admin'); // Redirige al panel una vez logueado
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-black text-blue-900 mb-8 uppercase italic tracking-tighter text-center">Admin Access</h2>
        <div className="space-y-4">
          <input 
            type="email" placeholder="Email de Admin" 
            className="w-full p-4 rounded-2xl border bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Contraseña" 
            className="w-full p-4 rounded-2xl border bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black hover:bg-blue-800 transition-all shadow-lg shadow-blue-200">
            ENTRAR AL PANEL
          </button>
        </div>
        {error && <p className="mt-4 text-red-500 text-sm font-bold text-center">{error}</p>}
      </form>
    </div>
  );
}