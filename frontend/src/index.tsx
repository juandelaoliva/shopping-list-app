import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { 
  Category, 
  Product, 
  ShoppingList, 
  ListItem, 
  Supermarket, 
  User,
  CreateProductRequest, 
  CreateShoppingListRequest,
  UpdateShoppingListRequest,
  CreateListItemRequest,
  UpdateListItemRequest,
  ProductCardProps,
  ListCardProps,
  ShoppingItemProps
} from './types';

// Import services
import { 
  authService, 
  categoryService, 
  productService, 
  shoppingListService, 
  supermarketService,
  alternativeGroupService
} from './services/supabase-api';
import { supabase } from './lib/supabase';
import { Icons } from './components/Layout/Icons';
import ProductDetailScreen from './pages/ProductDetailScreen';
import SupermarketsPage from './pages/SupermarketsPage';
import BottomNavigation from './components/Layout/BottomNavigation';
import { getContrastTextColor } from './components/ColorPicker';
import * as serviceWorker from './sw-registration';
import { Plus } from 'lucide-react';

// Helper function para crear badges de supermercados con el color correcto
const createSupermarketBadge = (name: string, color?: string | null, size: 'xs' | 'sm' = 'sm') => {
  const badgeColor = color || '#6366F1'; // Color por defecto
  const textColor = getContrastTextColor(badgeColor);
  
  const sizeClasses = {
    xs: 'px-1 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs'
  };
  
  return (
    <span 
      className={`inline-block rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: badgeColor,
        color: textColor
      }}
    >
      {name}
    </span>
  );
};

/* ========================================
   AUTH CONTEXT
   Gestiona el estado de autenticación
======================================== */



interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = React.useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = React.useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // Forzar recarga para limpiar estado de la app
    window.location.reload();
  };

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

/* ========================================
   AUTH SCREEN COMPONENT
   Pantalla de Login y Registro
======================================== */

const AuthScreen = () => {
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordConfirmation, setPasswordConfirmation] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        // Login con Supabase
        const { user } = await authService.login(email, password);
        const localUser: User = { 
          id: user.id, 
          email: user.email || '', 
          displayName: user.user_metadata?.display_name || user.email?.split('@')[0] 
        };
        login('supabase-token', localUser); // Token ficticio ya que Supabase maneja la sesión
      } else {
        // Registro con Supabase
        if (password !== passwordConfirmation) {
          setError('Las contraseñas no coinciden');
          return;
        }
        await authService.register(email, password, displayName);
        setIsLogin(true);
        setSuccessMessage('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
      }
    } catch (err: any) {
      const errorMessage = err.error?.message || err.message || 'Algo salió mal';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="app-container">
      <main className="mobile-content flex items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Shopping List</h1>
            <p className="text-slate-500">{isLogin ? 'Inicia sesión para continuar' : 'Crea una cuenta para empezar'}</p>
          </div>

          <form onSubmit={handleSubmit} className="card">
            <div className="card-content space-y-4">
              {!isLogin && (
                <div className="form-group">
                  <label className="form-label">Nombre de Usuario</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">{isLogin ? 'Email' : 'Email'}</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pr-10"
                    required
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500"
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.543 7S3.732 16.057 2.458 12z" /></svg>
                    )}
                  </button>
                </div>
              </div>
              {!isLogin && (
                <div className="form-group">
                  <label className="form-label">Confirmar Contraseña</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      className="form-input pr-10"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500"
                      title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.543 7S3.732 16.057 2.458 12z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              {successMessage && (
                <div className="text-emerald-600 text-sm text-center">{successMessage}</div>
              )}

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-sm text-indigo-600 hover:underline"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

/* ========================================
   MODERN MOBILE-FIRST SHOPPING APP
   Professional UX/UI Design
======================================== */

// Main App Component
const App = () => {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = React.useState('home');
  const [selectedListId, setSelectedListId] = React.useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = React.useState<number | null>(null);

  const navigate = (view: string, listId?: number, productId?: number, openModal?: string) => {
    setCurrentView(view);
    if (listId) setSelectedListId(listId);
    if (productId) setSelectedProductId(productId);
    // Si hay un modal que abrir, lo almacenamos temporalmente
    if (openModal) {
      setTimeout(() => {
        const event = new CustomEvent('openModal', { detail: openModal });
        window.dispatchEvent(event);
      }, 100); // Pequeño delay para asegurar que el componente esté montado
    }
  };

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="app-container">
      {/* Render Current View */}
      {currentView === 'home' && (
        <HomeScreen onNavigate={navigate} />
      )}
      {currentView === 'list-detail' && selectedListId && (
        <ListDetailScreen 
          listId={selectedListId} 
          onNavigate={navigate} 
        />
      )}
      {currentView === 'products' && (
        <ProductsScreen onNavigate={navigate} />
      )}
      {currentView === 'product-detail' && selectedProductId && (
        <ProductDetailScreen 
          productId={selectedProductId} 
          onNavigate={navigate} 
        />
      )}
      {currentView === 'supermarkets' && (
        <SupermarketsPage onNavigate={navigate} />
      )}
    </div>
  );
};

// Home Screen Component
const HomeScreen = ({ onNavigate }: { onNavigate: (view: string, listId?: number, productId?: number, openModal?: string) => void }) => {
  const [lists, setLists] = React.useState<ShoppingList[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showNewListModal, setShowNewListModal] = React.useState(false);
  const [showEditListModal, setShowEditListModal] = React.useState(false);
  const [editingList, setEditingList] = React.useState<ShoppingList | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { token, logout, user } = useAuth(); // Obtener token, logout y user

  const loadLists = async () => {
    if (!token) return;
    try {
      // Usar servicio Supabase
      const lists = await shoppingListService.getAll();
      setLists(lists);
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteList = async (listId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta lista?')) return;
    if (!token) return;
    
    try {
      await shoppingListService.delete(listId);
      setLists(lists.filter(list => list.id !== listId));
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const editList = (list: ShoppingList) => {
    setEditingList(list);
    setShowEditListModal(true);
  };

  React.useEffect(() => {
    loadLists();
  }, [token]);

  // Escuchar evento para abrir modal automáticamente
  React.useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      if (event.detail === 'newList') {
        setShowNewListModal(true);
      }
    };

    window.addEventListener('openModal', handleOpenModal as EventListener);
    
    return () => {
      window.removeEventListener('openModal', handleOpenModal as EventListener);
    };
  }, []);

  const filteredLists = lists.filter(list =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeLists = filteredLists.filter(list => !list.is_completed);
  const completedLists = filteredLists.filter(list => list.is_completed);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white text-lg">
              {Icons.cart}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Mis Listas</h1>
              <p className="text-xs text-slate-500">Hola, {user?.displayName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onNavigate('supermarkets')}
              className="btn-icon btn-ghost"
              title="Supermercados"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </button>
            <button 
              onClick={() => onNavigate('products')}
              className="btn-icon btn-ghost"
              title="Productos"
            >
              {Icons.products}
            </button>
            <button 
              onClick={logout}
              className="btn-icon btn-ghost text-red-500"
              title="Cerrar Sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mobile-content">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
              {Icons.search}
            </div>
            <input
              type="text"
              placeholder="Buscar listas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-12"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card text-center">
            <div className="card-content py-4">
              <div className="text-2xl font-bold text-slate-900">{lists.length}</div>
              <div className="text-xs text-slate-500">Total</div>
            </div>
          </div>
          <div className="card text-center">
            <div className="card-content py-4">
              <div className="text-2xl font-bold text-indigo-600">{activeLists.length}</div>
              <div className="text-xs text-slate-500">Activas</div>
            </div>
          </div>
          <div className="card text-center">
            <div className="card-content py-4">
              <div className="text-2xl font-bold text-emerald-600">{completedLists.length}</div>
              <div className="text-xs text-slate-500">Completadas</div>
            </div>
          </div>
        </div>

        {/* Active Lists */}
        {activeLists.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Listas Activas</h2>
            <div className="space-y-3">
              {activeLists.map(list => (
                <ListCard 
                  key={list.id} 
                  list={list} 
                  onTap={() => onNavigate('list-detail', list.id)}
                  onEdit={() => editList(list)}
                  onDelete={() => deleteList(list.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Lists */}
        {completedLists.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Completadas</h2>
            <div className="space-y-3">
              {completedLists.map(list => (
                <ListCard 
                  key={list.id} 
                  list={list} 
                  onTap={() => onNavigate('list-detail', list.id)}
                  onEdit={() => editList(list)}
                  onDelete={() => deleteList(list.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {lists.length === 0 && (
          <EmptyState 
            icon={Icons.cart}
            title="¡Empecemos!"
            subtitle="Crea tu primera lista de compra"
            action="Crear Lista"
            onAction={() => setShowNewListModal(true)}
          />
        )}

        {/* Thumb zone spacing */}
        <div className="thumb-zone" />
      </main>

      {/* Floating Action Button */}
      <button 
        className="fab"
        onClick={() => setShowNewListModal(true)}
      >
        {Icons.add}
      </button>

      {/* Bottom Navigation */}
      <BottomNavigation currentScreen="home" onNavigate={onNavigate} />

      {/* New List Modal */}
      {showNewListModal && (
        <NewListModal 
          onClose={() => setShowNewListModal(false)}
          onSave={loadLists}
          onNavigate={onNavigate}
        />
      )}

      {/* Edit List Modal */}
      {showEditListModal && editingList && (
        <EditListModal 
          list={editingList}
          onClose={() => {
            setShowEditListModal(false);
            setEditingList(null);
          }}
          onSave={loadLists}
        />
      )}
    </>
  );
};

// List Card Component
const ListCard: React.FC<ListCardProps> = ({ 
  list, 
  onTap, 
  onEdit, 
  onDelete 
}) => {
  const totalItems = list.total_items || 0;
  const purchasedItems = list.purchased_items || 0;
  const progress = totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0;
  
  return (
    <div className="card-interactive" onClick={onTap}>
      <div className="card-content">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="card-title flex items-center">
              {list.name}
              {list.is_completed && (
                <span className="ml-2 text-emerald-500">{Icons.check}</span>
              )}
            </h3>
            {list.description && (
              <p className="card-subtitle">{list.description}</p>
            )}
          </div>
          <div className="flex space-x-1">
            <button 
              className="btn-icon btn-sm btn-ghost"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
            >
              {Icons.edit}
            </button>
            <button 
              className="btn-icon btn-sm btn-ghost"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              {Icons.delete}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {totalItems > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-sm text-slate-600 mb-1">
              <span>{purchasedItems} de {totalItems}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  list.is_completed ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Budget Info */}
        {(list.total_budget || list.estimated_total) && (
          <div className="mb-3 p-3 bg-slate-50 rounded-lg">
            {list.total_budget && list.estimated_total ? (
              // Presupuesto vs Estimado
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600">PRESUPUESTO</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {Number(list.total_budget).toFixed(2)}€
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">Estimado</span>
                  <span className="text-sm text-slate-700">
                    {Number(list.estimated_total).toFixed(2)}€
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Restante</span>
                  <span className={`text-sm font-medium ${
                    Number(list.total_budget) - Number(list.estimated_total) >= 0 
                      ? 'text-emerald-600' 
                      : 'text-red-600'
                  }`}>
                    {(Number(list.total_budget) - Number(list.estimated_total) >= 0 ? '+' : '')}
                    {(Number(list.total_budget) - Number(list.estimated_total)).toFixed(2)}€
                  </span>
                </div>
                {/* Barra de presupuesto */}
                <div className="mt-2">
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        Number(list.estimated_total) <= Number(list.total_budget)
                          ? 'bg-emerald-500' 
                          : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (Number(list.estimated_total) / Number(list.total_budget)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </>
            ) : list.total_budget ? (
              // Solo presupuesto
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">PRESUPUESTO</span>
                <span className="text-sm font-semibold text-slate-900">
                  {Number(list.total_budget).toFixed(2)}€
                </span>
              </div>
            ) : (
              // Solo estimado
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">ESTIMADO</span>
                <span className="text-sm font-semibold text-slate-900">
                  {Number(list.estimated_total).toFixed(2)}€
                </span>
              </div>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>{new Date(list.created_at).toLocaleDateString()}</span>
          {list.is_completed && list.completed_at && (
            <span className="text-emerald-600 text-xs">
              ✓ {new Date(list.completed_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// List Detail Screen Component
const ListDetailScreen = ({ 
  listId, 
  onNavigate 
}: { 
  listId: number; 
  onNavigate: (view: string) => void;
}) => {
  const [list, setList] = React.useState<ShoppingList | null>(null);
  const [items, setItems] = React.useState<ListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortBy, setSortBy] = React.useState('order'); // order, name, price_asc, price_desc, category
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditItemModal, setShowEditItemModal] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ListItem | null>(null);
  const { token } = useAuth(); // Obtener token

  const loadListData = async () => {
    if (!token) return;
    try {
      const listData = await shoppingListService.getById(listId);
      setList(listData);
      setItems(listData.items || []); // ✅ Usar los datos transformados
    } catch (error) {
      console.error('Error loading list:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadListData();
  }, [listId, token]);

  const toggleItem = async (itemId: number, isPurchased: boolean) => {
    if (!token) return;
    try {
      const updatedItem = await shoppingListService.updateItem(listId, itemId, { is_purchased: !isPurchased });
      setItems(items.map(item => 
        item.id === itemId ? updatedItem : item // ✅ Usar datos transformados del servicio
      ));
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const editItem = (item: ListItem) => {
    setEditingItem(item);
    setShowEditItemModal(true);
  };

  const deleteItem = async (itemId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    if (!token) return;
    
    try {
      await shoppingListService.deleteItem(listId, itemId);
      setItems(items.filter(item => item.id !== itemId));
      loadListData(); // Recargar para actualizar totales
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Función para ordenar items
  const sortItems = (itemsToSort: ListItem[]) => {
    return [...itemsToSort].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const nameA = a.product_name || a.custom_product_name || '';
          const nameB = b.product_name || b.custom_product_name || '';
          return nameA.localeCompare(nameB);
        
        case 'price_asc':
          const priceA = a.estimated_price || 0;
          const priceB = b.estimated_price || 0;
          return priceA - priceB;
        
        case 'price_desc':
          const priceA2 = a.estimated_price || 0;
          const priceB2 = b.estimated_price || 0;
          return priceB2 - priceA2;
        
        case 'category':
          const categoryA = a.category_name || 'Sin categoría';
          const categoryB = b.category_name || 'Sin categoría';
          return categoryA.localeCompare(categoryB);
        
        case 'order':
        default:
          // Orden original (por ID)
          return a.id - b.id;
      }
    });
  };

  const pendingItems = sortItems(items.filter(item => !item.is_purchased));
  const completedItems = sortItems(items.filter(item => item.is_purchased));

  return (
    <>
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              className="btn-icon btn-sm btn-ghost"
              onClick={() => onNavigate('home')}
            >
              {Icons.back}
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 truncate">
                {list?.name}
              </h1>
              <p className="text-xs text-slate-500">
                {items.length} productos • {completedItems.length} completados
              </p>
            </div>
          </div>
          <button 
            className="btn-icon btn-ghost"
            onClick={() => setShowAddModal(true)}
          >
            {Icons.add}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mobile-content">
        {/* Progress Summary */}
        <div className="card mb-6">
          <div className="card-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {completedItems.length} / {items.length}
                </div>
                <div className="text-sm text-slate-500">Productos completados</div>
              </div>
              <div className="progress-ring">
                <CircularProgress 
                  progress={items.length > 0 ? (completedItems.length / items.length) * 100 : 0}
                />
              </div>
            </div>
            
            {/* Financial Summary */}
            {(list?.total_budget || list?.estimated_total) && (
              <div className="border-t border-slate-100 pt-3">
                {list?.total_budget && list?.estimated_total ? (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-blue-900">
                          {Number(list.total_budget).toFixed(2)}€
                        </div>
                        <div className="text-xs text-blue-600">Presupuesto</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-slate-900">
                          {Number(list.estimated_total).toFixed(2)}€
                        </div>
                        <div className="text-xs text-slate-500">Estimado</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-semibold ${
                          Number(list.total_budget) - Number(list.estimated_total) >= 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}>
                          {(Number(list.total_budget) - Number(list.estimated_total) >= 0 ? '+' : '')}
                          {(Number(list.total_budget) - Number(list.estimated_total)).toFixed(2)}€
                        </div>
                        <div className={`text-xs ${
                          Number(list.total_budget) - Number(list.estimated_total) >= 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}>
                          Restante
                        </div>
                      </div>
                    </div>
                    {/* Budget Progress Bar */}
                    <div className="relative">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            Number(list.estimated_total) <= Number(list.total_budget)
                              ? 'bg-emerald-500' 
                              : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (Number(list.estimated_total) / Number(list.total_budget)) * 100)}%` 
                          }}
                        />
                      </div>
                      <div className="text-xs text-slate-500 mt-1 text-center">
                        {((Number(list.estimated_total) / Number(list.total_budget)) * 100).toFixed(0)}% del presupuesto usado
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {list?.total_budget ? 'Presupuesto:' : 'Total estimado:'}
                    </span>
                    <span className="font-medium">
                      {Number(list?.total_budget || list?.estimated_total).toFixed(2)}€
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ordenamiento */}
        {items.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-700">Ordenar productos</h3>
              <span className="text-xs text-slate-500">{items.length} productos</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2"
            >
              <option value="order">📋 Orden original</option>
              <option value="name">🔤 Nombre A-Z</option>
              <option value="price_asc">💰 Precio menor → mayor</option>
              <option value="price_desc">💰 Precio mayor → menor</option>
              <option value="category">🏷️ Por categoría A-Z</option>
            </select>
          </div>
        )}

        {/* Pending Items */}
        {pendingItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Por comprar ({pendingItems.length})
            </h2>
            <div className="space-y-2">
              {pendingItems.map(item => (
                <ShoppingItem 
                  key={item.id}
                  item={item}
                  onToggle={() => toggleItem(item.id, item.is_purchased)}
                  onEdit={() => editItem(item)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Completados ({completedItems.length})
            </h2>
            <div className="space-y-2 opacity-60">
              {completedItems.map(item => (
                <ShoppingItem 
                  key={item.id}
                  item={item}
                  onToggle={() => toggleItem(item.id, item.is_purchased)}
                  onEdit={() => editItem(item)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <EmptyState 
            icon={Icons.cart}
            title="Lista vacía"
            subtitle="Agrega productos para empezar"
            action="Agregar Producto"
            onAction={() => setShowAddModal(true)}
          />
        )}

        {/* Thumb zone spacing */}
        <div className="thumb-zone" />
      </main>

      {/* Floating Action Button */}
      <button 
        className="fab"
        onClick={() => setShowAddModal(true)}
      >
        {Icons.add}
      </button>

      {/* Bottom Navigation */}
      <BottomNavigation currentScreen="list" onNavigate={onNavigate} />

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal 
          listId={listId}
          onClose={() => setShowAddModal(false)}
          onSave={loadListData}
        />
      )}

      {/* Edit Item Modal */}
      {showEditItemModal && editingItem && (
        <EditItemModal 
          listId={listId}
          item={editingItem}
          onClose={() => {
            setShowEditItemModal(false);
            setEditingItem(null);
          }}
          onSave={loadListData}
        />
      )}
    </>
  );
};

// Shopping Item Component
const ShoppingItem: React.FC<ShoppingItemProps> = ({ 
  item, 
  onToggle, 
  onEdit, 
  onDelete 
}) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handleToggle = () => {
    if (!item.is_purchased) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        onToggle();
      }, 600); // Duración de la animación
    } else {
      onToggle();
    }
  };

  return (
    <div className={`shopping-item ${item.is_purchased ? 'shopping-item-completed' : ''} ${isAnimating ? 'shopping-item-animating' : ''}`}>
      {/* Contenido principal del item */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1 flex-wrap">
          <div className={`font-medium transition-all duration-300 ${item.is_purchased ? 'line-through text-slate-500' : 'text-slate-900'}`}>
            {item.product_name || item.custom_product_name || 'Producto sin nombre'}
          </div>
          {item.supermarket_name && createSupermarketBadge(item.supermarket_name, item.supermarket_color, 'sm')}
          {/* Badge de categoría */}
          {item.category_name && (
            <span 
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
              style={{
                backgroundColor: item.category_color ? `${item.category_color}20` : '#f1f5f9',
                color: item.category_color || '#334155'
              }}
            >
              {item.category_icon && <span className="mr-1">{item.category_icon}</span>}
              {item.category_name}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {item.quantity} {item.unit}
            {item.estimated_price && ` • ${(Number(item.estimated_price) * item.quantity).toFixed(2)}€`}
          </div>
          {/* Botones de acción inline */}
          <div className="flex items-center space-x-1 ml-2">
            <button 
              className="btn-icon btn-sm btn-ghost opacity-60 hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              title="Editar"
            >
              {Icons.edit}
            </button>
            <button 
              className="btn-icon btn-sm btn-ghost opacity-60 hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="Eliminar"
            >
              {Icons.delete}
            </button>
          </div>
        </div>
      </div>

      {/* Área clickeable a la derecha */}
      <div 
        className="shopping-item-toggle"
        onClick={handleToggle}
      >
        <div className="shopping-item-toggle-inner">
          {item.is_purchased ? (
            <div className="completed-check">
              {Icons.check}
            </div>
          ) : (
            <div className="pending-circle" />
          )}
        </div>
      </div>

      {/* Animación de completado */}
      {isAnimating && (
        <div className="completion-animation">
          <div className="completion-ripple" />
          <div className="completion-check">
            ✨
          </div>
        </div>
      )}
    </div>
  );
};

// Products Screen Component
const ProductsScreen = ({ 
  onNavigate 
}: { 
  onNavigate: (view: string, listId?: number, productId?: number, openModal?: string) => void;
}) => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [supermarkets, setSupermarkets] = React.useState<Supermarket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [sortBy, setSortBy] = React.useState('created');
  const [showEditProductModal, setShowEditProductModal] = React.useState(false);
  const [showNewProductModal, setShowNewProductModal] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [alternativesMap, setAlternativesMap] = React.useState<Record<string, number[]>>({});
  const [expandedClusters, setExpandedClusters] = React.useState<Set<string>>(new Set());

  const loadData = async () => {
    try {
      // Test connection first
      const connectionTest = await productService.testConnection();
      
      if (!connectionTest.success) {
        throw new Error(`Connection failed: ${connectionTest.message}`);
      }

      // Ejecutar migración automática de alternativas a grupos
      try {
        await alternativeGroupService.migrateFromLegacyTable();
      } catch (migrationError) {
        console.warn('Migration failed, but continuing:', migrationError);
      }

      const [products, categories, supermarkets] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        supermarketService.getAll(),
      ]);
      
      setProducts(products);
      setCategories(categories);
      setSupermarkets(supermarkets);
      
      // Cargar mapa de alternativas desde Supabase
      await loadAlternativesMap(products);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para cargar el mapa de alternativas
  const loadAlternativesMap = async (products: Product[]) => {
    try {
      // Usar la nueva función del servicio
      const alternativesMap = await productService.getAllAlternativesMap();
      setAlternativesMap(alternativesMap);
    } catch (error) {
      console.error('Error loading alternatives map:', error);
      setAlternativesMap({});
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditProductModal(true);
  };

  const deleteProduct = async (productId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    try {
      await productService.delete(productId);
      setProducts(products.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const toggleClusterExpansion = (clusterId: string) => {
    const newExpanded = new Set(expandedClusters);
    if (newExpanded.has(clusterId)) {
      newExpanded.delete(clusterId);
    } else {
      newExpanded.add(clusterId);
    }
    setExpandedClusters(newExpanded);
  };

  const filteredAndSortedProducts = React.useMemo(() => {
    // Primero filtrar
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category_id?.toString() === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Luego ordenar
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        
        case 'price_asc':
          const priceA = a.estimated_price || 0;
          const priceB = b.estimated_price || 0;
          return priceA - priceB;
        
        case 'price_desc':
          const priceA2 = a.estimated_price || 0;
          const priceB2 = b.estimated_price || 0;
          return priceB2 - priceA2;
        
        case 'category':
          const categoryA = a.category_name || 'Sin categoría';
          const categoryB = b.category_name || 'Sin categoría';
          return categoryA.localeCompare(categoryB);
        
        case 'created':
        default:
          // Orden por ID (más reciente primero)
          return b.id - a.id;
      }
    });

    return sorted;
  }, [products, searchQuery, selectedCategory, sortBy]);

  const productClusters = React.useMemo(() => {
    const productMap = new Map(filteredAndSortedProducts.map(p => [p.id, p]));
    const clusters: { id: string; mainProduct: Product; alternatives: Product[]; isCluster: boolean }[] = [];
    const processedIds = new Set<number>();

    for (const product of filteredAndSortedProducts) {
      if (processedIds.has(product.id)) {
        continue;
      }

      const relatedIds = new Set([product.id]);
      const queue = [product.id];
      processedIds.add(product.id);

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const alternatives = alternativesMap[currentId] || [];
        for (const altId of alternatives) {
          if (!relatedIds.has(altId) && productMap.has(altId)) {
            relatedIds.add(altId);
            queue.push(altId);
            processedIds.add(altId);
          }
        }
      }

      const groupProducts = Array.from(relatedIds)
        .map(id => productMap.get(id))
        .filter((p): p is Product => p !== undefined);
      
      if (groupProducts.length > 1) {
        clusters.push({
          id: `cluster-${groupProducts[0].id}`,
          mainProduct: groupProducts[0],
          alternatives: groupProducts.slice(1),
          isCluster: true,
        });
      } else {
        clusters.push({
          id: product.id.toString(),
          mainProduct: product,
          alternatives: [],
          isCluster: false,
        });
      }
    }
    
    return clusters;

  }, [filteredAndSortedProducts, alternativesMap]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* Header */}
      <header className="mobile-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="btn-icon btn-sm btn-ghost" onClick={() => onNavigate('home')}>
              {Icons.back}
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Productos</h1>
              <p className="text-xs text-slate-500">{products.length} productos</p>
            </div>
          </div>
          <button onClick={() => setShowNewProductModal(true)} className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4 mr-1" />
            Añadir
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mobile-content">
        {/* Search and Filter */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
              {Icons.search}
            </div>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-12"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
            >
              <option value="created">📅 Más recientes</option>
              <option value="name">�� Nombre A-Z</option>
              <option value="price_asc">💰 Precio ↑</option>
              <option value="price_desc">💰 Precio ↓</option>
              <option value="category">🏷️ Categoría A-Z</option>
            </select>
          </div>
        </div>

        {/* Products List with Expandable Clusters */}
        <div className="space-y-4">
          {productClusters.map(cluster => {
            // Calcular todos los productos del cluster para usar en la vista expandida
            const allProducts = cluster.isCluster ? [cluster.mainProduct, ...cluster.alternatives] : [cluster.mainProduct];
            
            return (
              <div key={cluster.id} className="cluster-container">
                <ProductCard 
                  cluster={cluster} 
                  onEdit={editProduct}
                  onDelete={deleteProduct}
                  onClick={() => {
                    if (cluster.isCluster) {
                      toggleClusterExpansion(cluster.id);
                    } else {
                      onNavigate('product-detail', undefined, cluster.mainProduct.id, undefined);
                    }
                  }}
                  isExpanded={expandedClusters.has(cluster.id)}
                />
                
                {/* Expanded alternatives */}
                {cluster.isCluster && expandedClusters.has(cluster.id) && (
                  <div className="cluster-alternatives">
                    <div className="cluster-alternatives-header">
                      <span className="text-sm font-medium text-slate-600">
                        Productos del grupo ({allProducts.length})
                      </span>
                    </div>
                    <div className="cluster-alternatives-grid">
                      {allProducts.map(product => (
                        <div 
                          key={product.id} 
                          className="alternative-product-card cursor-pointer"
                          onClick={() => onNavigate('product-detail', undefined, product.id, undefined)}
                        >
                          <div className="alternative-product-main">
                            <div className="product-icon-sm" style={{ backgroundColor: product.category_color || '#6b7280' }}>
                              {product.category_icon || Icons.products}
                            </div>
                            <div className="alternative-product-info">
                              <h4 className="alternative-product-name">{product.name}</h4>
                              <div className="alternative-product-meta">
                                {product.supermarket_name && 
                                  createSupermarketBadge(product.supermarket_name, product.supermarket_color, 'xs')
                                }
                                {product.estimated_price && (
                                  <span className="text-xs text-slate-600">
                                    {Number(product.estimated_price).toFixed(2)}€
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="alternative-product-actions">
                            <button 
                              onClick={(e) => { e.stopPropagation(); editProduct(product); }} 
                              className="btn-icon btn-xs btn-ghost"
                              title="Editar"
                            >
                              {Icons.edit}
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteProduct(product.id); }} 
                              className="btn-icon btn-xs btn-ghost text-red-500"
                              title="Eliminar"
                            >
                              {Icons.delete}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAndSortedProducts.length === 0 && (
          <EmptyState 
            icon={Icons.products}
            title="No hay productos"
            subtitle="No se encontraron productos con esos criterios"
            action=""
            onAction={() => {}}
          />
        )}

        {/* Thumb zone spacing */}
        <div className="thumb-zone" />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation currentScreen="products" onNavigate={onNavigate} />

      {/* Edit Product Modal */}
      {showEditProductModal && editingProduct && (
        <EditProductModal 
          product={editingProduct}
          allProducts={products}
          categories={categories}
          supermarkets={supermarkets}
          onClose={() => {
            setShowEditProductModal(false);
            setEditingProduct(null);
          }}
          onSave={loadData}
        />
      )}

      {/* New Product Modal */}
      {showNewProductModal && (
        <NewProductModal 
          categories={categories}
          supermarkets={supermarkets}
          onClose={() => setShowNewProductModal(false)}
          onSave={loadData}
        />
      )}
    </>
  );
};

// Product Card Component - Expandable Design
const ProductCard: React.FC<{
  cluster: { mainProduct: Product; alternatives: Product[]; isCluster: boolean };
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
  onClick: () => void;
  isExpanded?: boolean;
}> = ({ cluster, onEdit, onDelete, onClick, isExpanded = false }) => {
  const { mainProduct, alternatives, isCluster } = cluster;

  // Para clusters, calculamos información resumida
  const allProducts = isCluster ? [mainProduct, ...alternatives] : [mainProduct];
  
  // Título representativo para clusters
  const getClusterTitle = () => {
    if (!isCluster) return mainProduct.name;
    
    // Buscamos palabras comunes en los nombres de productos
    const names = allProducts.map(p => p.name.toLowerCase());
    const words = names[0].split(' ');
    const commonWords = words.filter(word => 
      word.length > 3 && // Solo palabras de más de 3 caracteres
      names.every(name => name.includes(word))
    );
    
    if (commonWords.length > 0) {
      // Capitalizamos la primera letra de cada palabra común
      return commonWords.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    
    // Si no hay palabras comunes, usamos el nombre del producto principal + "alternativas"
    return `${mainProduct.name} + alternativas`;
  };

  // Combinaciones de supermercado + precio para mostrar en filas
  const supermarketPriceCombinations = React.useMemo(() => {
    const combinations: Array<{ supermarket: string; color: string | null; price: number | null }> = [];
    
    allProducts.forEach(product => {
      if (product.supermarket_name) {
        // Convertir el precio antes de comparar
        const productPrice = product.estimated_price 
          ? (typeof product.estimated_price === 'string' 
              ? parseFloat(product.estimated_price) 
              : product.estimated_price)
          : null;
        const normalizedProductPrice = (productPrice && !isNaN(productPrice)) ? productPrice : null;
        
        // Buscar si ya existe esta combinación
        const existing = combinations.find(
          combo => combo.supermarket === product.supermarket_name && 
                   combo.price === normalizedProductPrice
        );
        if (!existing) {
          combinations.push({
            supermarket: product.supermarket_name,
            color: product.supermarket_color || null,
            price: normalizedProductPrice
          });
        }
      }
    });
    
    // Ordenar por precio (los sin precio al final)
    return combinations.sort((a, b) => {
      if (a.price === null && b.price === null) return a.supermarket.localeCompare(b.supermarket);
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return a.price - b.price;
    });
  }, [allProducts]);

  // Categoría más común (para el ícono)
  const categoryCount = allProducts.reduce((acc, p) => {
    if (p.category_icon) {
      acc[p.category_icon] = (acc[p.category_icon] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonCategory = Object.entries(categoryCount)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0];
  
  const displayIcon = mostCommonCategory ? mostCommonCategory[0] : Icons.products;
  const displayColor = allProducts.find(p => p.category_color)?.category_color || '#6b7280';

  return (
    <div 
      className={`product-card-new ${isCluster ? 'product-card-cluster' : ''} ${isExpanded ? 'product-card-expanded' : ''}`} 
      onClick={onClick}
    >
      <div className="product-card-content">
        {/* Left: Product/Cluster Icon */}
        <div className="product-card-icon-container">
          <div className="product-icon-new" style={{ backgroundColor: displayColor }}>
            {displayIcon}
          </div>
        </div>
        
        {/* Center: Product/Cluster Info */}
        <div className="product-card-info-new">
          <div className="product-card-header">
            <h3 className="product-name-new">{getClusterTitle()}</h3>
            {isCluster && (
              <div className="cluster-indicator">
                <span className="cluster-count">{allProducts.length}</span>
                <span className="cluster-arrow">
                  {isExpanded ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  )}
                </span>
              </div>
            )}
          </div>
          
          <div className="product-meta-new">
            {/* Mostrar combinaciones de supermercado + precio en filas */}
            {supermarketPriceCombinations.length > 0 && (
              <div className="supermarket-price-rows">
                {supermarketPriceCombinations.slice(0, 3).map((combo, index) => (
                  <div key={index} className="supermarket-price-row">
                    {createSupermarketBadge(combo.supermarket, combo.color, 'xs')}
                    <span className="price-text">
                      {combo.price !== null && combo.price > 0 ? `${combo.price.toFixed(2)}€` : 'Sin precio'}
                    </span>
                  </div>
                ))}
                {supermarketPriceCombinations.length > 3 && (
                  <div className="supermarket-price-row">
                    <span className="more-items-text">+{supermarketPriceCombinations.length - 3} más...</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Para productos individuales sin precio, mostrar la unidad */}
            {!isCluster && !mainProduct.estimated_price && mainProduct.unit && (
              <span className="product-unit">por {mainProduct.unit}</span>
            )}
          </div>
        </div>
        
        {/* Right: Action buttons - Solo para productos individuales */}
        {!isCluster && (
          <div className="product-card-actions-new">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(mainProduct); }} 
              className="action-btn-new"
              title="Editar producto"
            >
              {Icons.edit}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(mainProduct.id); }} 
              className="action-btn-new action-btn-delete-new"
              title="Eliminar producto"
            >
              {Icons.delete}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Shared Components
const LoadingScreen = () => (
  <div className="app-container">
    <div className="mobile-content flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4" />
        <div className="text-slate-600">Cargando...</div>
      </div>
    </div>
  </div>
);

const EmptyState = ({ 
  icon, 
  title, 
  subtitle, 
  action, 
  onAction 
}: {
  icon: string;
  title: string;
  subtitle: string;
  action: string;
  onAction: () => void;
}) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4 opacity-50">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 mb-6">{subtitle}</p>
    {action && (
      <button className="btn-primary" onClick={onAction}>
        {action}
      </button>
    )}
  </div>
);

const CircularProgress = ({ progress }: { progress: number }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="progress-ring">
      <svg className="progress-circle" width="64" height="64">
        <circle
          className="progress-bg"
          cx="32"
          cy="32"
          r={radius}
        />
        <circle
          className="progress-fill"
          cx="32"
          cy="32"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-medium text-slate-900">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

// Modal Components
const NewListModal = ({ 
  onClose, 
  onSave,
  onNavigate 
}: { 
  onClose: () => void; 
  onSave: () => void;
  onNavigate: (view: string, listId?: number) => void;
}) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [totalBudget, setTotalBudget] = React.useState('');
  const { token } = useAuth(); // Obtener token

  const handleSave = async () => {
    if (!name.trim() || !token) return;
    
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        total_budget: totalBudget ? parseFloat(totalBudget) : null
      };

      const newList = await shoppingListService.create(payload);
      onSave();
      onClose();
      // Navegar automáticamente a la lista creada
      onNavigate('list-detail', newList.id);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  return (
    <div className="modal-overlay slide-up">
      <div className="modal-content">
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-slate-900">Nueva Lista de Compra</h2>
          <p className="text-sm text-slate-600">Crea una nueva lista para organizar tu próxima compra</p>
        </div>
        <div className="modal-body space-y-4">
          <div className="form-group">
            <label className="form-label">Nombre de la lista *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="Ej: Compra semanal"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input resize-none"
              rows={3}
              placeholder="Descripción de la lista..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Presupuesto (€, opcional)</label>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className="form-input"
              placeholder="100.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              name.trim() 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Crear y Abrir
          </button>
        </div>
      </div>
    </div>
  );
};

const AddItemModal = ({ 
  listId,
  onClose, 
  onSave 
}: { 
  listId: number;
  onClose: () => void; 
  onSave: () => void;
}) => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [sortBy, setSortBy] = React.useState('created');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [customName, setCustomName] = React.useState('');
  const [newProductPrice, setNewProductPrice] = React.useState('');
  const [newProductUnit, setNewProductUnit] = React.useState('ud');
  const [quantity, setQuantity] = React.useState(1);
  const [isCreatingNew, setIsCreatingNew] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const { token } = useAuth(); // Obtener token

  // Cargar productos y categorías al abrir el modal
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [products, categories] = await Promise.all([
          productService.getAll(),
          categoryService.getAll()
        ]);
        setProducts(products || []);
        setCategories(categories);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = React.useMemo(() => {
    // Primero filtrar
    let filtered = products.filter(p => {
      const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || p.category_id?.toString() === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Luego ordenar
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        
        case 'price_asc':
          const priceA = a.estimated_price || 0;
          const priceB = b.estimated_price || 0;
          return priceA - priceB;
        
        case 'price_desc':
          const priceA2 = a.estimated_price || 0;
          const priceB2 = b.estimated_price || 0;
          return priceB2 - priceA2;
        
        case 'category':
          const categoryA = a.category_name || 'Sin categoría';
          const categoryB = b.category_name || 'Sin categoría';
          return categoryA.localeCompare(categoryB);
        
        case 'created':
        default:
          return b.id - a.id;
      }
    });

    return sorted;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const handleSave = async () => {
    if (!token) return;
    if (isCreatingNew && !customName.trim()) return;
    if (!isCreatingNew && !selectedProduct) return;
    
    try {
      let payload;
      
      if (isCreatingNew) {
        // Primero crear el producto en la base de datos
        const newProductData = {
          name: customName,
          category_id: selectedCategory ? parseInt(selectedCategory) : null,
          estimated_price: newProductPrice ? parseFloat(newProductPrice) : null,
          unit: newProductUnit
        };
        
        const createdProduct = await productService.create(newProductData);
        
        // Luego añadir el producto creado a la lista
        payload = {
          product_id: createdProduct.id,
          quantity,
          unit: createdProduct.unit
        };
      } else {
        // Usar producto existente
        if (!selectedProduct) return; // Añadimos esta guarda para asegurar que no es nulo
        payload = {
          product_id: selectedProduct.id,
          quantity,
          unit: selectedProduct.unit || 'unidad',
          estimated_price: selectedProduct.estimated_price || null
        };
      }

      await shoppingListService.addItem(listId, payload);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const canSave = (isCreatingNew && customName.trim()) || (!isCreatingNew && selectedProduct);

  return (
    <div className="modal-overlay slide-up">
      <div className="modal-content">
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-slate-900">Agregar Producto</h2>
        </div>
        
        {/* Toggle buttons */}
        <div className="modal-body space-y-4">
          <div className="flex rounded-lg p-1 bg-slate-100">
            <button
              onClick={() => setIsCreatingNew(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isCreatingNew 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600'
              }`}
            >
              Buscar Existente
            </button>
            <button
              onClick={() => setIsCreatingNew(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isCreatingNew 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-600'
              }`}
            >
              Crear Nuevo
            </button>
          </div>

                     {isCreatingNew ? (
             /* Crear nuevo producto */
             <div className="space-y-3">
               <div className="form-group">
                 <label className="form-label">Nombre del producto *</label>
                 <input
                   type="text"
                   value={customName}
                   onChange={(e) => setCustomName(e.target.value)}
                   className="form-input"
                   placeholder="Ej: Leche"
                   autoFocus
                 />
               </div>
               
               <div className="form-group">
                 <label className="form-label">Categoría</label>
                 <select
                   value={selectedCategory}
                   onChange={(e) => setSelectedCategory(e.target.value)}
                   className="form-input"
                 >
                   <option value="">Sin categoría</option>
                   {categories.map(category => (
                     <option key={category.id} value={category.id}>
                       {category.icon} {category.name}
                     </option>
                   ))}
                 </select>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                 <div className="form-group">
                   <label className="form-label">Precio estimado (€)</label>
                   <input
                     type="number"
                     step="0.01"
                     min="0"
                     value={newProductPrice}
                     onChange={(e) => setNewProductPrice(e.target.value)}
                     className="form-input"
                     placeholder="0.00"
                   />
                 </div>
                 
                 <div className="form-group">
                   <label className="form-label">Unidad</label>
                   <select
                     value={newProductUnit}
                     onChange={(e) => setNewProductUnit(e.target.value)}
                     className="form-input"
                   >
                     <option value="ud">unidad</option>
                     <option value="kg">kilogramo</option>
                     <option value="g">gramo</option>
                     <option value="l">litro</option>
                     <option value="ml">mililitro</option>
                     <option value="pack">paquete</option>
                     <option value="caja">caja</option>
                   </select>
                 </div>
               </div>
             </div>
           ) : (
             /* Buscar producto existente */
             <div className="space-y-3">
               {selectedProduct ? (
                 /* Producto seleccionado */
                 <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                   <div className="flex items-start justify-between">
                     <div className="flex-1">
                       <div className="text-base font-medium text-indigo-900 mb-2">
                         {selectedProduct.name}
                       </div>
                       <div className="flex items-center gap-2 flex-wrap">
                         {selectedProduct.category_name && (
                           <span 
                             className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                             style={{ backgroundColor: selectedProduct.category_color || '#6366f1' }}
                           >
                             {selectedProduct.category_icon} {selectedProduct.category_name}
                           </span>
                         )}
                         {selectedProduct.estimated_price && (
                           <span className="text-sm text-indigo-600 font-medium">
                             {Number(selectedProduct.estimated_price).toFixed(2)}€ por {selectedProduct.unit}
                           </span>
                         )}
                       </div>
                     </div>
                     <button
                       onClick={() => {
                         setSelectedProduct(null);
                         setSearchTerm('');
                         setSelectedCategory('');
                         setSortBy('created');
                         setCustomName('');
                         setNewProductPrice('');
                         setNewProductUnit('ud');
                       }}
                       className="ml-3 p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                       title="Quitar selección"
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                     </button>
                   </div>
                 </div>
               ) : (
                 /* Búsqueda y lista de productos */
                 <>
                   <div className="space-y-3">
                     <div className="form-group">
                       <label className="form-label">Buscar producto</label>
                       <input
                         type="text"
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="form-input"
                         placeholder="Buscar producto existente..."
                         autoFocus
                       />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3">
                       <div className="form-group">
                         <label className="form-label">Categoría</label>
                         <select
                           value={selectedCategory}
                           onChange={(e) => setSelectedCategory(e.target.value)}
                           className="form-input"
                         >
                           <option value="">Todas</option>
                           {categories.map(category => (
                             <option key={category.id} value={category.id}>
                               {category.icon} {category.name}
                             </option>
                           ))}
                         </select>
                       </div>
                       
                       <div className="form-group">
                         <label className="form-label">Ordenar por</label>
                         <select
                           value={sortBy}
                           onChange={(e) => setSortBy(e.target.value)}
                           className="form-input"
                         >
                           <option value="created">Recientes</option>
                           <option value="name">Nombre</option>
                           <option value="price_asc">Precio ↑</option>
                           <option value="price_desc">Precio ↓</option>
                           <option value="category">Categoría</option>
                         </select>
                       </div>
                     </div>
                   </div>
                   
                   {loading ? (
                     <div className="text-center py-4 text-slate-500">Cargando productos...</div>
                   ) : filteredProducts.length > 0 ? (
                     <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                       {filteredProducts.map(product => (
                         <div
                           key={product.id}
                           onClick={() => setSelectedProduct(product)}
                           className="p-3 cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
                         >
                           <div className="flex items-start justify-between">
                             <div className="flex-1">
                               <div className="font-medium text-slate-900 mb-1">{product.name}</div>
                               <div className="flex items-center gap-2 flex-wrap">
                                 {product.supermarket_name && createSupermarketBadge(product.supermarket_name, product.supermarket_color, 'sm')}
                                 {product.category_name && (
                                   <span 
                                     className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                                     style={{ backgroundColor: product.category_color || '#6366f1' }}
                                   >
                                     {product.category_icon} {product.category_name}
                                   </span>
                                 )}
                                 {product.estimated_price && (
                                   <span className="text-xs text-slate-600 font-medium">
                                     {Number(product.estimated_price).toFixed(2)}€/{product.unit}
                                   </span>
                                 )}
                               </div>
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (searchTerm || selectedCategory) ? (
                     <div className="text-center py-4 text-slate-500">
                       No se encontraron productos
                       {(searchTerm || selectedCategory) && (
                         <button 
                           onClick={() => {
                             setSearchTerm('');
                             setSelectedCategory('');
                             setSortBy('created');
                             setCustomName('');
                             setNewProductPrice('');
                             setNewProductUnit('ud');
                           }}
                           className="block mx-auto mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                         >
                           Limpiar filtros
                         </button>
                       )}
                     </div>
                   ) : null}
                 </>
               )}
             </div>
           )}

          {/* Cantidad */}
          <div className="form-group">
            <label className="form-label">Cantidad</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="form-input"
              min="1"
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              canSave 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
            onClick={handleSave}
            disabled={!canSave}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

const EditListModal = ({ 
  list,
  onClose, 
  onSave 
}: { 
  list: ShoppingList;
  onClose: () => void; 
  onSave: () => void;
}) => {
  const [name, setName] = React.useState(list.name);
  const [description, setDescription] = React.useState(list.description || '');
  const [totalBudget, setTotalBudget] = React.useState(list.total_budget?.toString() || '');
  const { token } = useAuth(); // Obtener token

  const handleSave = async () => {
    if (!name.trim() || !token) return;
    
    try {
            await shoppingListService.update(list.id, { 
          name: name.trim(),
          description: description.trim() || null,
          total_budget: totalBudget ? parseFloat(totalBudget) : null
        });
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };

  return (
    <div className="modal-overlay slide-up">
      <div className="modal-content">
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-slate-900">Editar Lista</h2>
        </div>
        <div className="modal-body space-y-4">
          <div className="form-group">
            <label className="form-label">Nombre de la lista *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="Ej: Compra semanal"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input resize-none"
              placeholder="Descripción opcional..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Presupuesto (opcional)</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="form-input pr-8"
                placeholder="100.00"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">€</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary flex-1" onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

const EditItemModal = ({ 
  listId,
  item,
  onClose, 
  onSave 
}: { 
  listId: number;
  item: ListItem;
  onClose: () => void; 
  onSave: () => void;
}) => {
  const [quantity, setQuantity] = React.useState(item.quantity);
  const [estimatedPrice, setEstimatedPrice] = React.useState(item.estimated_price?.toString() || '');
  const [notes, setNotes] = React.useState(item.notes || '');
  const { token } = useAuth(); // Obtener token

  const handleSave = async () => {
    if (!token) return;
    try {
      await shoppingListService.updateItem(listId, item.id, {
          quantity,
          estimated_price: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
          notes: notes.trim() ? notes.trim() : undefined
      });
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  return (
    <div className="modal-overlay slide-up">
      <div className="modal-content">
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-slate-900">Editar Producto</h2>
          <p className="text-sm text-slate-600">{item.custom_product_name || item.product_name}</p>
        </div>
        <div className="modal-body space-y-4">
          <div className="form-group">
            <label className="form-label">Cantidad</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="form-input"
              min="1"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Precio estimado (€)</label>
            <input
              type="number"
              step="0.01"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
              className="form-input"
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input resize-none"
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary flex-1" onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

const EditProductModal = ({ 
  product,
  allProducts,
  categories,
  supermarkets,
  onClose, 
  onSave 
}: { 
  product: Product;
  allProducts: Product[];
  categories: Category[];
  supermarkets: Supermarket[];
  onClose: () => void; 
  onSave: () => void;
}) => {
  const [name, setName] = React.useState(product.name);
  const [supermarketId, setSupermarketId] = React.useState(product.supermarket_id?.toString() || '');
  const [categoryId, setCategoryId] = React.useState(product.category_id?.toString() || '');
  const [estimatedPrice, setEstimatedPrice] = React.useState(product.estimated_price?.toString() || '');
  const [unit, setUnit] = React.useState(product.unit);
  
  const [alternatives, setAlternatives] = React.useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loadingAlts, setLoadingAlts] = React.useState(true);

  React.useEffect(() => {
    loadAlternatives();
  }, [product.id]);

  const loadAlternatives = async () => {
    try {
      setLoadingAlts(true);
      const alts = await productService.getAlternatives(product.id);
      setAlternatives(alts);
    } catch (error) {
      console.error("Error loading alternatives", error);
    } finally {
      setLoadingAlts(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      const updatedProductData = {
        name: name.trim(),
        supermarket_id: supermarketId ? parseInt(supermarketId) : undefined,
        category_id: categoryId ? parseInt(categoryId) : undefined,
        estimated_price: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
        unit: unit
      };
      await productService.update(product.id, updatedProductData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleAddAlternative = async (altId: number) => {
    try {
      await productService.addAlternative(product.id, altId);
      loadAlternatives(); // Recargar alternativas del producto actual
      // Notificar al padre para recargar todos los productos y actualizar clusters
      if (onSave) onSave(); 
    } catch (error) {
      console.error("Error adding alternative", error);
    }
  };

  const handleRemoveAlternative = async (altId: number) => {
    try {
      await productService.removeAlternative(product.id, altId);
      loadAlternatives(); // Recargar alternativas del producto actual
      // Notificar al padre para recargar todos los productos y actualizar clusters  
      if (onSave) onSave();
    } catch (error) {
      console.error("Error removing alternative", error);
    }
  };
  
  const potentialAlternatives = allProducts.filter(p => 
    p.id !== product.id && // No puede ser él mismo
    !alternatives.some(alt => alt.id === p.id) && // No puede estar ya en la lista de alternativas
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="modal-overlay slide-up">
      <div className="modal-content">
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-slate-900">Editar Producto</h2>
        </div>
        <div className="modal-body space-y-4">
          {/* Formulario principal de edición */}
          <div className="form-group">
            <label className="form-label">Nombre del producto *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Supermercado (Opcional)</label>
            <select value={supermarketId} onChange={e => setSupermarketId(e.target.value)} className="form-input">
              <option value="">Ninguno</option>
              {supermarkets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Categoría (Opcional)</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="form-input">
              <option value="">Sin categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Precio estimado (€)</label>
              <input type="number" step="0.01" min="0" value={estimatedPrice} onChange={(e) => setEstimatedPrice(e.target.value)} className="form-input"/>
            </div>
            <div className="form-group">
              <label className="form-label">Unidad</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="form-input">
                <option value="ud">unidad</option>
                <option value="kg">kilogramo</option>
                <option value="g">gramo</option>
                <option value="l">litro</option>
                <option value="ml">mililitro</option>
                <option value="pack">paquete</option>
                <option value="caja">caja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sección de Alternativas */}
        <div className="modal-body space-y-4 border-t border-slate-200 mt-4 pt-4">
          <h3 className="text-md font-semibold text-slate-800">Productos Alternativos</h3>
          
          {loadingAlts ? <p>Cargando alternativas...</p> : (
            <div className="space-y-2">
              {alternatives.map(alt => (
                <div key={alt.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                  <span>{alt.name} ({alt.supermarket_name || 'Sin super'})</span>
                  <button onClick={() => handleRemoveAlternative(alt.id)} className="btn-icon btn-sm btn-ghost text-red-500">
                    {Icons.delete}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Buscar y añadir alternativa</label>
            <input 
              type="text" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input" 
              placeholder="Buscar producto para vincular..." 
            />
            {searchTerm && (
              <div className="mt-2 border border-slate-200 rounded-md max-h-40 overflow-y-auto">
                {potentialAlternatives.map(p => (
                  <div key={p.id} className="p-3 cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 mb-1">{p.name}</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {p.supermarket_name && createSupermarketBadge(p.supermarket_name, p.supermarket_color, 'sm')}
                          {p.category_name && (
                            <span 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: p.category_color || '#6366f1' }}
                            >
                              {p.category_icon} {p.category_name}
                            </span>
                          )}
                          {p.estimated_price && (
                            <span className="text-xs text-slate-600 font-medium">
                              {Number(p.estimated_price).toFixed(2)}€/{p.unit}
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => handleAddAlternative(p.id)} className="ml-3 btn btn-secondary btn-sm">
                        Vincular
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn-primary flex-1" onClick={handleSave}>Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
};

// New Product Modal Component
const NewProductModal = ({ 
  categories,
  supermarkets,
  onClose, 
  onSave 
}: { 
  categories: Category[];
  supermarkets: Supermarket[];
  onClose: () => void; 
  onSave: () => void;
}) => {
  const [name, setName] = React.useState('');
  const [supermarketId, setSupermarketId] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [estimatedPrice, setEstimatedPrice] = React.useState('');
  const [unit, setUnit] = React.useState('ud');

  const handleSave = async () => {
    if (!name.trim()) return;
    
    try {
      const newProductData: CreateProductRequest = {
        name: name.trim(),
        supermarket_id: supermarketId ? parseInt(supermarketId) : undefined,
        category_id: categoryId ? parseInt(categoryId) : undefined,
        estimated_price: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
        unit: unit
      };
      await productService.create(newProductData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <div className="modal-overlay slide-up">
      <div className="modal-content">
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-slate-900">Nuevo Producto</h2>
        </div>
        <div className="modal-body space-y-4">
          <div className="form-group">
            <label className="form-label">Nombre del producto *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-input" placeholder="Ej: Leche Entera Puleva" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Supermercado (Opcional)</label>
            <select value={supermarketId} onChange={e => setSupermarketId(e.target.value)} className="form-input">
              <option value="">Ninguno</option>
              {supermarkets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Categoría (Opcional)</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="form-input">
              <option value="">Sin categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Precio estimado (€)</label>
              <input type="number" step="0.01" min="0" value={estimatedPrice} onChange={(e) => setEstimatedPrice(e.target.value)} className="form-input" placeholder="1.50" />
            </div>
            <div className="form-group">
              <label className="form-label">Unidad</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="form-input">
                <option value="ud">unidad</option>
                <option value="kg">kilogramo</option>
                <option value="g">gramo</option>
                <option value="l">litro</option>
                <option value="ml">mililitro</option>
                <option value="pack">paquete</option>
                <option value="caja">caja</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn-primary flex-1" onClick={handleSave} disabled={!name.trim()}>{Icons.add} Crear Producto</button>
        </div>
      </div>
    </div>
  );
};

// Render App
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// 🚀 Registrar PWA Service Worker
serviceWorker.register({
  onSuccess: () => {
    console.log('🎉 PWA: App cached and ready for offline use!');
  },
  onUpdate: () => {
    console.log('🔄 PWA: New version available!');
  },
});

// 🌐 Configurar detección de red offline/online
serviceWorker.setupNetworkDetection();

// 📱 Configurar prompt de instalación PWA
serviceWorker.setupInstallPrompt(); 