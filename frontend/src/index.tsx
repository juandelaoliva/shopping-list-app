import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import api from './services/api'; // Importamos la instancia centralizada

/* ========================================
   AUTH CONTEXT
   Gestiona el estado de autenticación
======================================== */

interface User {
  id: number;
  email: string;
  username: string;
}

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
  const [username, setUsername] = React.useState('');
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

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin
      ? { loginIdentifier: email, password }
      : { username, email, password, passwordConfirmation };

    try {
      const response = await api.post(endpoint, payload);
      const data = response.data;

      if (isLogin) {
        login(data.token, data.user);
      } else {
        setIsLogin(true);
        setSuccessMessage('¡Registro exitoso! Ahora puedes iniciar sesión.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Algo salió mal';
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
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">{isLogin ? 'Email o Nombre de Usuario' : 'Email'}</label>
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

// Types
interface List {
  id: number;
  name: string;
  description?: string;
  total_budget?: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  total_items: number;
  purchased_items: number;
  estimated_total: number;
  items?: ListItem[];
}

interface ListItem {
  id: number;
  product_id?: number;
  custom_product_name?: string;
  quantity: number;
  unit: string;
  estimated_price?: number;
  actual_price?: number;
  is_purchased: boolean;
  notes?: string;
  product_name?: string;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
}

interface Product {
  id: number;
  name: string;
  category_id?: number;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  estimated_price?: number;
  unit: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

// Component Props Interfaces
interface ListCardProps {
  list: List;
  onTap: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

interface ShoppingItemProps {
  item: ListItem;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

// Icons (using emoji for simplicity)
const Icons = {
  home: '🏠',
  list: '📝',
  products: '📦',
  add: '➕',
  back: '←',
  edit: '✏️',
  delete: '🗑️',
  check: '✓',
  cart: '🛒',
  search: '🔍',
  filter: '🔽',
  close: '✕',
  menu: '☰',
  more: '⋯'
};

// Main App Component
const App = () => {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = React.useState('home');
  const [selectedListId, setSelectedListId] = React.useState<number | null>(null);

  const navigate = (view: string, listId?: number) => {
    setCurrentView(view);
    if (listId) setSelectedListId(listId);
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
    </div>
  );
};

// Home Screen Component
const HomeScreen = ({ onNavigate }: { onNavigate: (view: string, listId?: number) => void }) => {
  const [lists, setLists] = React.useState<List[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showNewListModal, setShowNewListModal] = React.useState(false);
  const [showEditListModal, setShowEditListModal] = React.useState(false);
  const [editingList, setEditingList] = React.useState<List | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { token, logout, user } = useAuth(); // Obtener token, logout y user

  const loadLists = async () => {
    if (!token) return;
    try {
      // Usamos el api service que ya tiene el token inyectado
      const response = await api.get('/shopping-lists');
      setLists(response.data);
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
      await api.delete(`/shopping-lists/${listId}`);
      setLists(lists.filter(list => list.id !== listId));
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const editList = (list: List) => {
    setEditingList(list);
    setShowEditListModal(true);
  };

  React.useEffect(() => {
    loadLists();
  }, [token]);

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
              <p className="text-xs text-slate-500">Hola, {user?.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
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
  const progress = list.total_items > 0 ? (list.purchased_items / list.total_items) * 100 : 0;
  
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
        {list.total_items > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-sm text-slate-600 mb-1">
              <span>{list.purchased_items} de {list.total_items}</span>
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
  const [list, setList] = React.useState<List | null>(null);
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
      const response = await api.get(`/shopping-lists/${listId}`);
      setList(response.data);
      setItems(response.data.items || []);
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
      await api.put(`/shopping-lists/${listId}/items/${itemId}`, { is_purchased: !isPurchased });
      setItems(items.map(item => 
        item.id === itemId ? { ...item, is_purchased: !isPurchased } : item
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
      await api.delete(`/shopping-lists/${listId}/items/${itemId}`);
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
        <div className="flex items-center space-x-2 mb-1">
          <div className={`font-medium transition-all duration-300 ${item.is_purchased ? 'line-through text-slate-500' : 'text-slate-900'}`}>
            {item.custom_product_name || item.product_name}
          </div>
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
  onNavigate: (view: string) => void;
}) => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [sortBy, setSortBy] = React.useState('created'); // created, name, price_asc, price_desc, category
  const [showEditProductModal, setShowEditProductModal] = React.useState(false);
  const [showNewProductModal, setShowNewProductModal] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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
      await api.delete(`/products/${productId}`);
      setProducts(products.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
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

  if (loading) {
    return <LoadingScreen />;
  }

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
              <h1 className="text-lg font-semibold text-slate-900">Productos</h1>
              <p className="text-xs text-slate-500">{products.length} productos</p>
            </div>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setShowNewProductModal(true)}
          >
            {Icons.add}
            <span className="ml-1">Crear</span>
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
              <option value="name">🔤 Nombre A-Z</option>
              <option value="price_asc">💰 Precio ↑</option>
              <option value="price_desc">💰 Precio ↓</option>
              <option value="category">🏷️ Categoría A-Z</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredAndSortedProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onEdit={() => editProduct(product)}
              onDelete={() => deleteProduct(product.id)}
            />
          ))}
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
          categories={categories}
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
          onClose={() => setShowNewProductModal(false)}
          onSave={loadData}
        />
      )}
    </>
  );
};

// Product Card Component
const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  return (
    <div className="card relative group">
      {/* Botones de acción */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
          className="p-1 bg-white rounded-full shadow-md hover:bg-slate-50 transition-colors"
          title="Editar producto"
        >
          <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
          title="Eliminar producto"
        >
          <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="card-content">
        <div className="text-center mb-3">
          <div 
            className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center text-white text-lg"
            style={{ backgroundColor: product.category_color || '#6366f1' }}
          >
            {product.category_icon || Icons.products}
          </div>
          <h3 className="font-medium text-slate-900 text-sm leading-tight">
            {product.name}
          </h3>
        </div>
        
        <div className="text-center space-y-1">
          {product.estimated_price && (
            <div className="text-sm font-medium text-slate-900">
              {Number(product.estimated_price).toFixed(2)}€
            </div>
          )}
          <div className="text-xs text-slate-500">
            por {product.unit}
          </div>
          {product.category_name && (
            <div className="badge badge-success text-xs">
              {product.category_name}
            </div>
          )}
        </div>
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

// Bottom Navigation Component
const BottomNavigation: React.FC<{
  currentScreen: 'home' | 'products' | 'list';
  onNavigate: (view: string) => void;
}> = ({ currentScreen, onNavigate }) => (
  <nav className="bottom-nav">
    <div className="flex items-center justify-around">
      <button 
        className={currentScreen === 'home' ? 'nav-item-active' : 'nav-item-inactive'}
        onClick={() => onNavigate('home')}
      >
        <span className="nav-icon">{Icons.home}</span>
        <span>Inicio</span>
      </button>
      <button 
        className={currentScreen === 'products' ? 'nav-item-active' : 'nav-item-inactive'}
        onClick={() => onNavigate('products')}
      >
        <span className="nav-icon">{Icons.products}</span>
        <span>Productos</span>
      </button>
    </div>
  </nav>
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

      const response = await api.post('/shopping-lists', payload);
      const newList = response.data;
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
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
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
        
        const productResponse = await api.post('/products', newProductData);
        const createdProduct = productResponse.data;
        
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

      await api.post(`/shopping-lists/${listId}/items`, payload);
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
                               <div className="flex items-center gap-2">
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
  list: List;
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
      await api.put(`/shopping-lists/${list.id}`, { 
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
      await api.put(`/shopping-lists/${listId}/items/${item.id}`, {
          quantity,
          estimated_price: estimatedPrice ? parseFloat(estimatedPrice) : null,
          notes: notes.trim() || null
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
  categories,
  onClose, 
  onSave 
}: { 
  product: Product;
  categories: Category[];
  onClose: () => void; 
  onSave: () => void;
}) => {
  const [name, setName] = React.useState(product.name);
  const [categoryId, setCategoryId] = React.useState(product.category_id?.toString() || '');
  const [estimatedPrice, setEstimatedPrice] = React.useState(product.estimated_price?.toString() || '');
  const [unit, setUnit] = React.useState(product.unit || 'ud');

  const handleSave = async () => {
    if (!name.trim()) return;
    
    try {
      const updatedProductData = {
        name: name.trim(),
        category_id: categoryId ? parseInt(categoryId) : null,
        estimated_price: estimatedPrice ? parseFloat(estimatedPrice) : null,
        unit: unit
      };

      await api.put(`/products/${product.id}`, updatedProductData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <div className="modal-overlay slide-up">
      <div className="modal-content">
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-slate-900">Editar Producto</h2>
        </div>
        <div className="modal-body space-y-4">
          <div className="form-group">
            <label className="form-label">Nombre del producto *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="Ej: Leche"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
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
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                className="form-input"
                placeholder="0.00"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Unidad</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
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
        <div className="modal-footer">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn-primary flex-1" 
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

// New Product Modal Component
const NewProductModal = ({ 
  categories,
  onClose, 
  onSave 
}: { 
  categories: Category[];
  onClose: () => void; 
  onSave: () => void;
}) => {
  const [name, setName] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [estimatedPrice, setEstimatedPrice] = React.useState('');
  const [unit, setUnit] = React.useState('ud');

  const handleSave = async () => {
    if (!name.trim()) return;
    
    try {
      const newProductData = {
        name: name.trim(),
        category_id: categoryId ? parseInt(categoryId) : null,
        estimated_price: estimatedPrice ? parseFloat(estimatedPrice) : null,
        unit: unit
      };

      await api.post('/products', newProductData);
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
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="Ej: Leche entera"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
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
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                className="form-input"
                placeholder="1.50"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Unidad</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
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
        <div className="modal-footer">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn-primary flex-1" 
            onClick={handleSave}
            disabled={!name.trim()}
          >
            {Icons.add} Crear Producto
          </button>
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