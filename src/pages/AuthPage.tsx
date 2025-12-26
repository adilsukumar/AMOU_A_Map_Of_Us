import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AmomLogo from '@/components/AmomLogo';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/map');
    }
  }, [user, navigate]);

  const validateForm = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login') || error.message.includes('Invalid credentials')) {
            setError('Invalid email or password');
          } else {
            setError(error.message);
          }
        }
      } else {
        const { data, error } = await signUp(email, password, username);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('An account with this email already exists');
          } else {
            setError(error.message);
          }
        } else if (data.user && !data.session) {
          setError('Please check your email to confirm your account, then try logging in.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <button 
        onClick={() => navigate('/')}
        className="mb-8 opacity-0 animate-fade-in"
      >
        <AmomLogo variant="full" className="w-16 h-16" />
      </button>
      
      <div 
        className="w-full max-w-sm opacity-0 animate-fade-in"
        style={{ animationDelay: '150ms' }}
      >
        <h1 className="text-2xl md:text-3xl font-playfair text-foreground text-center mb-2">
          {isLogin ? 'Welcome back' : 'Join AMOM'}
        </h1>
        <p className="text-muted-foreground font-playfair italic text-center mb-8">
          {isLogin ? 'Sign in to continue' : 'Create your account'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-playfair text-muted-foreground mb-1">
                Username (optional)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-sm 
                         text-foreground font-playfair placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-foreground/50 transition-colors"
                placeholder="Leave blank to be anonymous"
              />
              <p className="text-xs text-muted-foreground mt-1 font-playfair italic">
                If left blank, you'll appear as "Anonymous" to other users
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-playfair text-muted-foreground mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-sm 
                       text-foreground font-playfair placeholder:text-muted-foreground/50
                       focus:outline-none focus:border-foreground/50 transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-playfair text-muted-foreground mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-sm 
                       text-foreground font-playfair placeholder:text-muted-foreground/50
                       focus:outline-none focus:border-foreground/50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm font-playfair text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full amom-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="mt-6 text-center text-muted-foreground font-playfair text-sm">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-foreground hover:underline"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-8 text-muted-foreground font-playfair text-sm hover:text-foreground transition-colors opacity-0 animate-fade-in"
        style={{ animationDelay: '300ms' }}
      >
        ← Return to home
      </button>
    </div>
  );
};

export default AuthPage;
