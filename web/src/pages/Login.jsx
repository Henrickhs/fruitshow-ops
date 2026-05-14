import { useState } from 'react';
import toast from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { BrandLogo } from '../components/BrandLogo.jsx';

export function Login() {
  const { login, token } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bem-vindo ao FruitShow Ops.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-acai-900 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg bg-white p-8 shadow-panel">
        <div className="mb-8">
          <div className="mb-5 flex justify-center rounded-lg bg-acai-900 px-4 py-4">
            <BrandLogo showText={false} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-950">FruitShow Ops</h1>
          <p className="mt-1 text-sm text-slate-600">Acesse a gestão operacional da rede Açaí FruitShow.</p>
        </div>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-semibold">E-mail</span>
          <input className="field w-full" type="text" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="mb-6 block">
          <span className="mb-1 block text-sm font-semibold">Senha</span>
          <input className="field w-full" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      </form>
    </div>
  );
}
