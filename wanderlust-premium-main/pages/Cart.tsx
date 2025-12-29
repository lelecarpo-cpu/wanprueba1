import React, { useState } from 'react';
import { RouteModel } from '../types';
import { SEOHelmet } from '../components/SEOHelmet';
import { Trash2, Lock, CheckCircle, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartProps {
   items: RouteModel[];
   onRemoveItem: (id: string) => void;
   onClearCart: () => void;
}

type CheckoutStep = 'cart' | 'payment' | 'success';

export const Cart: React.FC<CartProps> = ({ items, onRemoveItem, onClearCart }) => {
   const [step, setStep] = useState<CheckoutStep>('cart');
   const [isProcessing, setIsProcessing] = useState(false);
   const navigate = useNavigate();

   const total = items.reduce((acc, item) => acc + item.price, 0);
   const formatPrice = (p: number) => p === 0 ? 'Gratis' : `${p.toFixed(2)}€`;

   const handlePayment = () => {
      setIsProcessing(true);
      setTimeout(() => {
         setIsProcessing(false);
         setStep('success');
         onClearCart();
      }, 2000);
   };

   if (step === 'success') {
      return (
         <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center animate-fade-in">
               <div className="w-20 h-20 bg-brand-500 rounded flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand-500/20">
                  <CheckCircle className="w-10 h-10 text-white" />
               </div>
               <h1 className="text-4xl font-black uppercase italic mb-4 tracking-tighter">Acceso Concedido</h1>
               <p className="text-gray-400 mb-10 leading-relaxed font-medium">Tus nuevas piezas editoriales han sido añadidas a tu biblioteca. El aprendizaje comienza ahora.</p>

               <div className="space-y-4">
                  <button onClick={() => navigate('/profile')} className="w-full bg-white text-black py-4 rounded font-black uppercase text-xs tracking-widest hover:bg-gray-100 transition-all">
                     Ver Mi Biblioteca
                  </button>
                  <button onClick={() => navigate('/')} className="w-full bg-transparent border border-white/10 text-gray-400 py-4 rounded font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all">
                     Explorar Más
                  </button>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="bg-[#141414] min-h-screen text-white pt-32 pb-20 overflow-x-hidden">
         <SEOHelmet
            title="Carrito de Compras | Wanderlust"
            description="Finaliza tu adquisición de rutas editoriales."
            image="https://wanderlust.app/og-cart.jpg"
            url="https://wanderlust.app/cart"
         />

         <div className="max-w-[1400px] mx-auto px-[4%]">

            <h1 className="text-4xl md:text-7xl font-black mb-16 leading-tight tracking-tighter uppercase italic">
               {step === 'cart' ? 'Tu Selección' : 'Finalizar Adquisición'}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

               <div className="lg:col-span-8">
                  {step === 'cart' ? (
                     <div className="space-y-8">
                        {items.length === 0 ? (
                           <div className="text-center py-40 bg-white/5 rounded border border-dashed border-white/10">
                              <p className="text-gray-500 font-black uppercase tracking-[0.2em] mb-8">No has seleccionado ninguna ruta todavía</p>
                              <button onClick={() => navigate('/')} className="bg-white text-black px-10 py-4 rounded font-black uppercase text-xs tracking-widest hover:bg-gray-100 transition-all">Ir al Catálogo</button>
                           </div>
                        ) : (
                           <div className="divide-y divide-white/5">
                              {items.map(item => (
                                 <div key={item.id} className="py-10 flex flex-col sm:flex-row items-center gap-10 group">
                                    <img src={item.thumbnail} className="w-40 aspect-video rounded object-cover border border-white/10 group-hover:border-brand-500 transition-all" alt={item.title} />
                                    <div className="flex-grow text-center sm:text-left">
                                       <h3 className="font-black text-2xl uppercase italic tracking-tight mb-2 group-hover:text-brand-500 transition-colors">{item.title}</h3>
                                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">{item.category}</p>
                                       <div className="flex items-center justify-center sm:justify-start gap-2 text-[8px] font-black uppercase text-brand-500 border border-brand-500/30 inline-flex px-3 py-1 rounded">
                                          <CheckCircle className="w-2.5 h-2.5" /> Propiedad Permanente
                                       </div>
                                    </div>
                                    <div className="flex flex-col items-center sm:items-end gap-4">
                                       <span className="text-3xl font-black italic tracking-tighter">{formatPrice(item.price)}</span>
                                       <button
                                          onClick={() => onRemoveItem(item.id)}
                                          className="text-gray-600 hover:text-red-500 transition-colors"
                                       >
                                          <Trash2 className="w-5 h-5" />
                                       </button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  ) : (
                     <div className="space-y-10">
                        <div className="bg-white/5 p-12 rounded border border-white/10">
                           <h3 className="text-2xl font-black uppercase italic mb-10 flex items-center gap-4 tracking-tight">
                              <CreditCard className="w-8 h-8 text-brand-500" /> Método de Pago
                           </h3>

                           <div className="space-y-8">
                              <div>
                                 <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Nombre en la tarjeta</label>
                                 <input type="text" placeholder="ESTRUCTURA EDITORIAL" className="w-full bg-white/5 border border-white/10 rounded px-5 py-4 focus:border-brand-500 outline-none font-black uppercase italic tracking-tighter" />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Número de identificación</label>
                                 <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full bg-white/5 border border-white/10 rounded px-5 py-4 focus:border-brand-500 outline-none font-black tracking-widest" />
                              </div>
                              <div className="grid grid-cols-2 gap-8">
                                 <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Expiración</label>
                                    <input type="text" placeholder="MM/YY" className="w-full bg-white/5 border border-white/10 rounded px-5 py-4 focus:border-brand-500 outline-none font-black text-center" />
                                 </div>
                                 <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Seguridad</label>
                                    <input type="text" placeholder="CVV" className="w-full bg-white/5 border border-white/10 rounded px-5 py-4 focus:border-brand-500 outline-none font-black text-center" />
                                 </div>
                              </div>
                           </div>
                        </div>

                        <button onClick={() => setStep('cart')} className="text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all">
                           ← Volver a la selección
                        </button>
                     </div>
                  )}
               </div>

               <div className="lg:col-span-4">
                  <div className="bg-white/5 p-10 rounded border border-white/10 sticky top-32 shadow-2xl backdrop-blur-xl">
                     <h3 className="font-black text-xl uppercase italic mb-10 tracking-tight">Resumen Editorial</h3>

                     <div className="space-y-6 mb-10">
                        <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                           <span>Piezas ({items.length})</span>
                           <span className="text-white">{formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                           <span>Tasa de Producción</span>
                           <span className="text-white">0,00€</span>
                        </div>
                        <div className="border-t border-white/10 pt-8 flex justify-between items-baseline">
                           <span className="text-white font-black uppercase italic text-lg tracking-tighter">Total</span>
                           <span className="text-5xl font-black text-brand-500 tracking-tighter italic">{formatPrice(total)}</span>
                        </div>
                     </div>

                     {step === 'cart' ? (
                        <button
                           onClick={() => setStep('payment')}
                           disabled={items.length === 0}
                           className="w-full bg-white text-black py-5 rounded font-black shadow-xl transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em] group disabled:opacity-20"
                        >
                           Confirmar Inversión <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </button>
                     ) : (
                        <button
                           onClick={handlePayment}
                           disabled={isProcessing}
                           className="w-full bg-brand-500 text-white py-5 rounded font-black shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]"
                        >
                           {isProcessing ? (
                              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                           ) : (
                              <>
                                 <Lock className="w-4 h-4" /> Proceder al Pago
                              </>
                           )}
                        </button>
                     )}

                     <div className="mt-10 flex items-center justify-center gap-3 text-[9px] font-black uppercase text-gray-600 tracking-widest">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Transacción Editorial Segura
                     </div>
                  </div>
               </div>

            </div>
         </div>
      </div>
   );
};
