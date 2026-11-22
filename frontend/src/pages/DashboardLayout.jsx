import { useCallback, useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import WalletService from '@/services/WalletService';
import { subscribeWalletEvents } from '@/lib/realtime';

const STORAGE_KEY = 'capital-atelier-active-wallet';

const DashboardLayout = () => {
  const token = localStorage.getItem('app-token');

  const [wallets, setWallets] = useState([]);
  const [activeWalletId, setActiveWalletId] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? Number(stored) : null;
    } catch {
      return null;
    }
  });
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [walletError, setWalletError] = useState('');
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [realtimeVersion, setRealtimeVersion] = useState(0);
  const [lastRealtimeEvent, setLastRealtimeEvent] = useState(null);

  const applyWalletsResult = useCallback((list) => {
    setWallets(list);
    setActiveWalletId((currentId) => {
      const exists = list.some((w) => w.id === currentId);
      const nextId = exists ? currentId : (list[0]?.id ?? null);
      try {
        if (nextId !== null) {
          localStorage.setItem(STORAGE_KEY, String(nextId));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        return nextId;
      }
      return nextId;
    });
  }, []);

  const fetchOrCreateWallets = useCallback(async () => {
    const response = await WalletService.getAll();
    let list = response.data || [];

    if (list.length === 0) {
      const created = await WalletService.create({
        name: 'Minha Carteira',
        description: 'Carteira principal do usuário',
      });
      if (created.data) {
        list = [created.data];
      }
    }

    return list;
  }, []);

  const refreshWallets = useCallback(async () => {
    setLoadingWallets(true);
    setWalletError('');
    try {
      const list = await fetchOrCreateWallets();
      applyWalletsResult(list);
    } catch (err) {
      setWalletError(
        err?.response?.data?.message ||
          'Não foi possível carregar suas carteiras.'
      );
    } finally {
      setLoadingWallets(false);
    }
  }, [fetchOrCreateWallets, applyWalletsResult]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    fetchOrCreateWallets()
      .then((list) => {
        if (!cancelled) {
          setWalletError('');
          applyWalletsResult(list);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setWalletError(
            err?.response?.data?.message ||
              'Não foi possível carregar suas carteiras.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingWallets(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, fetchOrCreateWallets, applyWalletsResult]);

  const selectWallet = useCallback((id) => {
    const numericId = Number(id);
    setActiveWalletId(numericId);
    setLastRealtimeEvent(null);
    try {
      localStorage.setItem(STORAGE_KEY, String(numericId));
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    if (!token || !activeWalletId) return;

    const unsubscribe = subscribeWalletEvents(activeWalletId, {
      onConnected: () => setRealtimeConnected(true),
      onDisconnect: () => setRealtimeConnected(false),
      onEvent: (event) => {
        setLastRealtimeEvent(event);
        setRealtimeVersion((v) => v + 1);
      },
    });

    return () => {
      unsubscribe();
      setRealtimeConnected(false);
    };
  }, [token, activeWalletId]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const activeWallet = wallets.find((w) => w.id === activeWalletId) || null;
  const isOwner = activeWallet?.role === 'OWNER';
  const canEdit =
    activeWallet?.role === 'OWNER' || activeWallet?.role === 'EDITOR';

  const walletOutletContext = {
    wallets,
    activeWallet,
    activeWalletId,
    loadingWallets,
    walletError,
    isOwner,
    canEdit,
    realtimeConnected,
    realtimeVersion,
    lastRealtimeEvent,
    selectWallet,
    refreshWallets,
  };

  return (
    <div className="bg-background text-foreground flex min-h-screen w-full">
      <Sidebar
        wallets={wallets}
        activeWallet={activeWallet}
        onSelectWallet={selectWallet}
      />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet context={walletOutletContext} />
      </main>
    </div>
  );
};

export default DashboardLayout;
