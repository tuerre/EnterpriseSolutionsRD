import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: string;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  sku: string;
  minimo: number;
  maximo: number;
  estado: string;
  imagen?: string;
}

export interface Venta {
  id: string;
  cliente: string;
  items: number;
  total: number;
  fecha: string;
  estado: string;
}

export interface Empleado {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  departamento: string;
  cargo: string;
  estado: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  time: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface DataStoreContextType {
  clientes: Cliente[];
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
  productos: Producto[];
  setProductos: React.Dispatch<React.SetStateAction<Producto[]>>;
  ventas: Venta[];
  setVentas: React.Dispatch<React.SetStateAction<Venta[]>>;
  empleados: Empleado[];
  setEmpleados: React.Dispatch<React.SetStateAction<Empleado[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  addNotification: (title: string, message: string, type: Notification['type']) => void;
  logs: AuditLog[];
  addLog: (action: string, details: string) => void;
  categorias: string[];
  setCategorias: React.Dispatch<React.SetStateAction<string[]>>;
  addCategoria: (nombre: string) => void;
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined);

export function DataStoreProvider({ children }: { children: ReactNode }) {
  // Initial Mock Data
  const initialClientes: Cliente[] = [
    { id: '1', nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '555-0101', direccion: 'Calle 1 #123', estado: 'Activo' },
    { id: '2', nombre: 'María González', email: 'maria@email.com', telefono: '555-0102', direccion: 'Av. Principal 456', estado: 'Activo' },
    { id: '3', nombre: 'Carlos Ruiz', email: 'carlos@email.com', telefono: '555-0103', direccion: 'Calle 5 #789', estado: 'Inactivo' },
    { id: '4', nombre: 'Ana Martínez', email: 'ana@email.com', telefono: '555-0104', direccion: 'Av. Secundaria 321', estado: 'Activo' },
  ];

  const initialProductos: Producto[] = [
    { id: '1', nombre: 'Laptop HP 15', categoria: 'Computadoras', precio: 899.99, stock: 15, sku: 'LAP-HP-001', minimo: 10, maximo: 30, estado: 'normal' },
    { id: '2', nombre: 'Mouse Logitech M185', categoria: 'Accesorios', precio: 15.99, stock: 45, sku: 'MOU-LOG-001', minimo: 10, maximo: 50, estado: 'normal' },
    { id: '3', nombre: 'Teclado Mecánico RGB', categoria: 'Accesorios', precio: 79.99, stock: 8, sku: 'TEC-RGB-001', minimo: 10, maximo: 20, estado: 'bajo' },
    { id: '4', nombre: 'Monitor Dell 24"', categoria: 'Monitores', precio: 249.99, stock: 22, sku: 'MON-DEL-001', minimo: 5, maximo: 25, estado: 'normal' },
  ];

  const initialVentas: Venta[] = [
    { id: 'F-001', cliente: 'Juan Pérez', items: 3, total: 450.00, fecha: '2026-05-08 10:30', estado: 'Completada' },
    { id: 'F-002', cliente: 'María González', items: 5, total: 1200.50, fecha: '2026-05-08 11:15', estado: 'Completada' },
    { id: 'F-003', cliente: 'Carlos Ruiz', items: 2, total: 325.75, fecha: '2026-05-08 12:00', estado: 'Completada' },
    { id: 'F-004', cliente: 'Ana Martínez', items: 1, total: 899.99, fecha: '2026-05-08 14:20', estado: 'Pendiente' },
  ];

  const initialEmpleados: Empleado[] = [
    { id: '1', nombre: 'Roberto García', email: 'roberto@serd.com', telefono: '555-1001', departamento: 'Ventas', cargo: 'Vendedor', estado: 'Activo' },
    { id: '2', nombre: 'Laura Sánchez', email: 'laura@serd.com', telefono: '555-1002', departamento: 'Bodega', cargo: 'Bodeguero', estado: 'Activo' },
    { id: '3', nombre: 'Pedro Ramírez', email: 'pedro@serd.com', telefono: '555-1003', departamento: 'Administración', cargo: 'Administrador', estado: 'Activo' },
    { id: '4', nombre: 'Sofia López', email: 'sofia@serd.com', telefono: '555-1004', departamento: 'Ventas', cargo: 'Vendedor', estado: 'Inactivo' },
  ];

  // Helper function to read from localStorage or use initial data
  const getInitialState = <T,>(key: string, initialData: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialData;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialData;
    }
  };

  const [clientes, setClientes] = useState<Cliente[]>(() => getInitialState('clientes', initialClientes));
  const [productos, setProductos] = useState<Producto[]>(() => getInitialState('productos', initialProductos));
  const [ventas, setVentas] = useState<Venta[]>(() => getInitialState('ventas', initialVentas));
  const [empleados, setEmpleados] = useState<Empleado[]>(() => getInitialState('empleados', initialEmpleados));
  const [notifications, setNotifications] = useState<Notification[]>(() => getInitialState('notifications', []));
  const [logs, setLogs] = useState<AuditLog[]>(() => getInitialState('system_logs', []));
  const [categorias, setCategorias] = useState<string[]>(() => getInitialState('system_categorias', ['Electrónica', 'Accesorios', 'Software', 'Servicios']));

  const addNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      time: 'Recién ahora',
      read: false,
      type
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
  };

  const addLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: Date.now().toString(),
      action,
      details,
      time: 'Recién',
      timestamp: Date.now()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
  };

  const addCategoria = (nombre: string) => {
    if (!categorias.includes(nombre)) {
      setCategorias(prev => [...prev, nombre]);
    }
  };

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('clientes', JSON.stringify(clientes)); }, [clientes]);
  useEffect(() => { localStorage.setItem('productos', JSON.stringify(productos)); }, [productos]);
  useEffect(() => { localStorage.setItem('ventas', JSON.stringify(ventas)); }, [ventas]);
  useEffect(() => { localStorage.setItem('empleados', JSON.stringify(empleados)); }, [empleados]);
  useEffect(() => { localStorage.setItem('notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('system_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('system_categorias', JSON.stringify(categorias)); }, [categorias]);

  return (
    <DataStoreContext.Provider value={{
      clientes, setClientes,
      productos, setProductos,
      ventas, setVentas,
      empleados, setEmpleados,
      notifications, setNotifications,
      addNotification,
      logs, addLog,
      categorias, setCategorias, addCategoria
    }}>
      {children}
    </DataStoreContext.Provider>
  );
}

export function useDataStore() {
  const context = useContext(DataStoreContext);
  if (context === undefined) {
    throw new Error('useDataStore must be used within a DataStoreProvider');
  }
  return context;
}
