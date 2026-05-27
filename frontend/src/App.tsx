import React, { useEffect, useState } from 'react';
import { useTheme } from './app/providers/ThemeProvider';
import { useUserStore } from './entities/user/model/store';
import { db, encryptPayload, decryptPayload } from './shared/db/schema';
// Standard useEffect is used to read from Dexie db to keep dependencies lightweight.
import { 
  Wifi, 
  WifiOff, 
  Moon, 
  Sun, 
  Eye, 
  Lock, 
  Plus, 
  Trash2, 
  User, 
  Shield, 
  Layers 
} from 'lucide-react';

const App: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, userName, role, login, logout } = useUserStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [simulationName, setSimulationName] = useState('');

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch offline queue items
  const fetchQueue = async () => {
    try {
      const items = await db.offlineQueue.toArray();
      const decrypted = items.map(item => {
        try {
          return {
            id: item.id,
            url: item.url,
            method: item.method,
            timestamp: item.timestamp,
            data: decryptPayload(item.payload),
          };
        } catch {
          return {
            id: item.id,
            url: item.url,
            method: item.method,
            timestamp: item.timestamp,
            data: { error: 'Falha ao descriptografar (Chave ausente/inválida)' },
          };
        }
      });
      setQueueItems(decrypted);
      setQueueCount(items.length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Simulates offline data insertion (LGPD compliant)
  const handleAddSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulationName.trim()) return;

    const payloadObj = {
      aluno: simulationName,
      presenca: true,
      data: new Date().toISOString(),
    };

    // Encrypt payload before saving (LGPD constraint)
    const encrypted = encryptPayload(payloadObj);

    await db.offlineQueue.add({
      url: '/api/chamadas',
      method: 'POST',
      payload: encrypted,
      timestamp: Date.now(),
    });

    setSimulationName('');
    fetchQueue();
  };

  // Simulates syncing (clearing queue)
  const handleSyncQueue = async () => {
    if (queueCount === 0) return;
    
    // Simulate sending payloads to server
    console.log('Sincronizando payloads descriptografados...', queueItems);
    
    // Purge queue after successful sync (LGPD requirement)
    await db.offlineQueue.clear();
    fetchQueue();
  };

  // Clear single queue item
  const handleDeleteQueueItem = async (id: number) => {
    await db.offlineQueue.delete(id);
    fetchQueue();
  };

  return (
    <div className="min-h-screen w-full transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-tr from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 rounded-2xl bg-card shadow-lg border border-border/50 backdrop-blur-md">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">SGES Frontend</h1>
              <p className="text-sm text-muted-foreground">Arquitetura Base Inicializada (Feature-Sliced Design)</p>
            </div>
          </div>

          {/* Theme & Network Status */}
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {/* Network Indicator */}
            <div 
              id="network-status"
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                isOnline 
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5 mr-1" /> : <WifiOff className="w-3.5 h-3.5 mr-1" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>

            {/* High Contrast Mode Toggle */}
            <button
              id="btn-high-contrast"
              onClick={() => setTheme(theme === 'high-contrast' ? 'light' : 'high-contrast')}
              className="p-2 rounded-lg border border-border hover:bg-muted/50 text-foreground transition-colors"
              title="Alternar Alto Contraste"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="btn-theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg border border-border hover:bg-muted/50 text-foreground transition-colors"
              title="Alternar Tema Escuro"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Column 1: Zustand Auth State */}
          <section className="p-6 rounded-2xl bg-card shadow-lg border border-border/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Estado de Autenticação (Zustand)</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Gerencia o estado global de autenticação dos usuários de forma reativa e leve.
              </p>

              {isAuthenticated ? (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Usuário:</span>
                    <span className="text-sm font-semibold">{userName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Perfil:</span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase">
                      {role}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-center mb-6">
                  <span className="text-sm text-muted-foreground">Nenhum usuário autenticado.</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="btn-login-volunteer"
                    onClick={() => login('Maria Silva', 'volunteer')}
                    className="w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 active:scale-95 transition-all text-sm"
                  >
                    Entrar como Voluntário
                  </button>
                  <button
                    id="btn-login-admin"
                    onClick={() => login('Carlos Gestor', 'admin')}
                    className="w-full py-2 px-4 bg-secondary text-secondary-foreground font-medium rounded-xl border border-border hover:bg-muted/80 active:scale-95 transition-all text-sm"
                  >
                    Entrar como Gestor
                  </button>
                </div>
              ) : (
                <button
                  id="btn-logout"
                  onClick={logout}
                  className="w-full py-2 px-4 bg-destructive text-destructive-foreground font-medium rounded-xl hover:opacity-90 active:scale-95 transition-all text-sm"
                >
                  Sair do Sistema
                </button>
              )}
            </div>
          </section>

          {/* Column 2: Offline Queue & LGPD encryption */}
          <section className="p-6 rounded-2xl bg-card shadow-lg border border-border/50 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold">Fila Offline Criptografada</h2>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 mr-1" /> LGPD Ativo
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Simula o registro de chamadas offline. Os dados são encriptados localmente e purgados após envio.
              </p>
            </div>

            {/* Insert Form */}
            <form onSubmit={handleAddSimulation} className="flex space-x-2">
              <input
                id="input-student-name"
                type="text"
                value={simulationName}
                onChange={(e) => setSimulationName(e.target.value)}
                placeholder="Nome do Aluno (Presença)"
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                id="btn-add-offline"
                type="submit"
                className="p-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            {/* Queue List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold px-1">
                <span>Registros Aguardando Envio ({queueCount})</span>
                {queueCount > 0 && (
                  <button 
                    id="btn-sync-all"
                    type="button"
                    onClick={handleSyncQueue}
                    className="text-primary hover:underline"
                  >
                    Sincronizar Todos
                  </button>
                )}
              </div>

              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {queueItems.length === 0 ? (
                  <div className="text-center py-4 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                    Nenhum registro pendente de sincronização.
                  </div>
                ) : (
                  queueItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-3 rounded-xl bg-muted/50 border border-border/40 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground">{item.data.aluno || 'Presença'}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.method} {item.url} • {new Date(item.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteQueueItem(item.id)}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

        </div>

        {/* Footer Technical Metadata */}
        <footer className="text-center py-6 text-xs text-muted-foreground space-y-2 border-t border-border/40">
          <p>
            Tecnologias: React 18, Vite, Tailwind CSS 3, Zustand, TanStack Query 5, Dexie IndexedDB.
          </p>
          <p>
            Princípio de Arquitetura: Feature-Sliced Design (FSD).
          </p>
        </footer>

      </div>
    </div>
  );
};

export default App;
