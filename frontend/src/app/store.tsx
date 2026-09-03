import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { mockOrders, initialPackages, type Order, type Package } from "./data";
import { api } from "./services/api";

interface StoreCtx {
  orders: Order[];
  addOrder: (o: Order) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<void>;
  packages: Package[];
  addPackage: (p: any) => Promise<void>;
  updatePackage: (p: any) => Promise<void>;
  deletePackage: (id: number | string) => Promise<void>;
  togglePackageActive: (id: number | string) => Promise<void>;
  refreshPackages: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  isLoading: boolean;
}

const Ctx = createContext<StoreCtx | null>(null);
const LS_ORDERS = "bmi_orders";
const LS_PACKAGES = "bmi_packages";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const s = localStorage.getItem(LS_ORDERS);
      return s ? JSON.parse(s) : mockOrders;
    } catch {
      return mockOrders;
    }
  });

  const [packages, setPackages] = useState<Package[]>(() => {
    try {
      const s = localStorage.getItem(LS_PACKAGES);
      return s ? JSON.parse(s) : initialPackages;
    } catch {
      return initialPackages;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(LS_PACKAGES, JSON.stringify(packages));
  }, [packages]);

  // Initial fetch from backend API
  const refreshPackages = async () => {
    try {
      const res = await api.packages.getAll();
      if (res.success && res.data?.packages && res.data.packages.length > 0) {
        setPackages(res.data.packages);
      }
    } catch (err) {
      console.warn("Could not fetch packages from backend, using local store:", err);
    }
  };

  const refreshOrders = async () => {
    try {
      const res = await api.orders.getMyOrders();
      if (res.success && res.data?.orders && res.data.orders.length > 0) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.warn("Could not fetch orders from backend, using local store:", err);
    }
  };

  useEffect(() => {
    refreshPackages();
    refreshOrders();
  }, []);

  const addOrder = (o: Order) => setOrders((p) => [o, ...p]);

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    setOrders((p) =>
      p.map((o) => (o.orderId === orderId ? { ...o, status } : o))
    );
    try {
      await api.orders.updateStatus(orderId, status);
    } catch (e) {
      console.warn("Failed to sync order status with backend:", e);
    }
  };

  const addPackage = async (p: any) => {
    // Generate temporary ID if missing
    const newPkg: Package = {
      ...p,
      id: p.id || Date.now(),
      active: p.active !== undefined ? p.active : true,
    };
    setPackages((prev) => [newPkg, ...prev]);

    try {
      const res = await api.packages.create(p);
      if (res.success && res.data?.package) {
        setPackages((prev) =>
          prev.map((x) => (x.id === newPkg.id ? res.data.package : x))
        );
      }
    } catch (e) {
      console.warn("Failed to create package on backend:", e);
    }
  };

  const updatePackage = async (p: any) => {
    setPackages((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    try {
      await api.packages.update(p.id || p._id, p);
    } catch (e) {
      console.warn("Failed to update package on backend:", e);
    }
  };

  const deletePackage = async (id: number | string) => {
    setPackages((prev) => prev.filter((x) => x.id !== id && (x as any)._id !== id));
    try {
      await api.packages.delete(id);
    } catch (e) {
      console.warn("Failed to delete package on backend:", e);
    }
  };

  const togglePackageActive = async (id: number | string) => {
    setPackages((prev) =>
      prev.map((x) =>
        x.id === id || (x as any)._id === id ? { ...x, active: !x.active } : x
      )
    );
    try {
      await api.packages.toggleActive(id);
    } catch (e) {
      console.warn("Failed to toggle package active on backend:", e);
    }
  };

  return (
    <Ctx.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        packages,
        addPackage,
        updatePackage,
        deletePackage,
        togglePackageActive,
        refreshPackages,
        refreshOrders,
        isLoading,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}
