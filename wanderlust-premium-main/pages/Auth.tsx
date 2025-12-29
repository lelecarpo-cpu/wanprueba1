
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { SEOHelmet } from '../components/SEOHelmet';
import { Mail, Lock, ArrowRight, Loader, AlertCircle, Map } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('routex_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Registro exitoso. ¡Bienvenido!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      // Handle Remember Me logic
      if (rememberMe) {
        localStorage.setItem('routex_remember_email', email);
      } else {
        localStorage.removeItem('routex_remember_email');
      }

      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Ha ocurrido un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHelmet
        title={isSignUp ? "Crear Cuenta | Wanderlust" : "Iniciar Sesión | Wanderlust"}
        description="Accede a Wanderlust para gestionar tus rutas."
        image="https://wanderlust.app/og-auth.jpg"
        url="https://wanderlust.app/auth"
      />

      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-brand-200/30 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[100px]"></div>
        </div>

        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-white/50 relative z-10 overflow-hidden">
          <div className="p-8 md:p-10">

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl shadow-lg shadow-brand-500/30 mb-4">
                <Map className="text-white w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {isSignUp ? 'Únete a Wanderlust' : 'Bienvenido de nuevo'}
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                {isSignUp ? 'Descubre el mundo con rutas diseñadas por expertos.' : 'Ingresa para acceder a tus rutas y perfil.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-12 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-12 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer accent-brand-600"
                  />
                  <span className="text-sm text-slate-500 font-medium group-hover:text-slate-700 transition-colors">Recordar usuario</span>
                </label>

                {!isSignUp && (
                  <button type="button" className="text-sm font-bold text-brand-600 hover:text-brand-700 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-brand-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:shadow-brand-500/30 transition-all flex items-center justify-center gap-2 group mt-2"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : (
                  <>
                    {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="ml-2 font-bold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
                >
                  {isSignUp ? 'Inicia Sesión' : 'Regístrate Gratis'}
                </button>
              </p>
            </div>

          </div>

          {/* Bottom Decor */}
          <div className="h-2 bg-gradient-to-r from-brand-500 via-purple-500 to-blue-500"></div>
        </div>
      </div>
    </>
  );
};
