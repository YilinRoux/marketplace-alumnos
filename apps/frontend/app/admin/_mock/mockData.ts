// ─── Mock Data para Dashboard Admin ────────────────────────────────────────
// Datos de prueba centralizados. Cuando se integre el backend real,
// reemplazar estos imports por llamadas a adminApi.ts
// ───────────────────────────────────────────────────────────────────────────

export interface MockStats {
  totalUsers: number;
  activeSellers: number;
  totalProducts: number;
  reportedProducts: number;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "seller" | "superadmin";
  status: "active" | "blocked";
  avatar: string | null;
  createdAt: string;
}

export interface MockProduct {
  id: string;
  title: string;
  seller: string;
  sellerEmail: string;
  status: "active" | "inactive" | "reported" | "deleted" | "reviewed";
  price: number;
  image: string | null;
  createdAt: string;
}

export interface MockReport {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string | null;
  reportedBy: string;
  reportedByEmail: string;
  seller: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

// ─── Stats ────────────────────────────────────────────────────────────────

export const mockStats: MockStats = {
  totalUsers: 156,
  activeSellers: 34,
  totalProducts: 287,
  reportedProducts: 7,
};

// ─── Users ────────────────────────────────────────────────────────────────

export const mockUsers: MockUser[] = [
  {
    id: "usr-001",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@universidad.edu",
    role: "superadmin",
    status: "active",
    avatar: null,
    createdAt: "2025-08-15T10:30:00Z",
  },
  {
    id: "usr-002",
    name: "María García López",
    email: "maria.garcia@universidad.edu",
    role: "seller",
    status: "active",
    avatar: null,
    createdAt: "2025-09-20T14:15:00Z",
  },
  {
    id: "usr-003",
    name: "Juan Pérez Ramírez",
    email: "juan.perez@universidad.edu",
    role: "user",
    status: "active",
    avatar: null,
    createdAt: "2025-10-01T09:00:00Z",
  },
  {
    id: "usr-004",
    name: "Ana Torres Díaz",
    email: "ana.torres@universidad.edu",
    role: "seller",
    status: "active",
    avatar: null,
    createdAt: "2025-10-05T11:45:00Z",
  },
  {
    id: "usr-005",
    name: "Roberto Sánchez",
    email: "roberto.sanchez@universidad.edu",
    role: "user",
    status: "blocked",
    avatar: null,
    createdAt: "2025-10-10T16:30:00Z",
  },
  {
    id: "usr-006",
    name: "Laura Martínez",
    email: "laura.martinez@universidad.edu",
    role: "seller",
    status: "active",
    avatar: null,
    createdAt: "2025-11-02T08:20:00Z",
  },
  {
    id: "usr-007",
    name: "Diego Hernández",
    email: "diego.hernandez@universidad.edu",
    role: "user",
    status: "active",
    avatar: null,
    createdAt: "2025-11-15T13:10:00Z",
  },
  {
    id: "usr-008",
    name: "Sofía Ruiz Castillo",
    email: "sofia.ruiz@universidad.edu",
    role: "user",
    status: "blocked",
    avatar: null,
    createdAt: "2025-12-01T10:00:00Z",
  },
  {
    id: "usr-009",
    name: "Fernando Gómez",
    email: "fernando.gomez@universidad.edu",
    role: "seller",
    status: "active",
    avatar: null,
    createdAt: "2026-01-10T15:45:00Z",
  },
  {
    id: "usr-010",
    name: "Valentina López",
    email: "valentina.lopez@universidad.edu",
    role: "user",
    status: "active",
    avatar: null,
    createdAt: "2026-02-20T09:30:00Z",
  },
];

// ─── Products ─────────────────────────────────────────────────────────────

export const mockProducts: MockProduct[] = [
  {
    id: "prod-001",
    title: "Calculadora Científica Casio FX-991",
    seller: "María García López",
    sellerEmail: "maria.garcia@universidad.edu",
    status: "active",
    price: 450,
    image: null,
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "prod-002",
    title: "Libro Cálculo Integral - Stewart 8va Ed.",
    seller: "Ana Torres Díaz",
    sellerEmail: "ana.torres@universidad.edu",
    status: "active",
    price: 320,
    image: null,
    createdAt: "2026-01-20T14:30:00Z",
  },
  {
    id: "prod-003",
    title: "Laptop HP Pavilion 15 (usada)",
    seller: "Fernando Gómez",
    sellerEmail: "fernando.gomez@universidad.edu",
    status: "reported",
    price: 8500,
    image: null,
    createdAt: "2026-02-01T09:15:00Z",
  },
  {
    id: "prod-004",
    title: "Kit de Dibujo Técnico Profesional",
    seller: "Laura Martínez",
    sellerEmail: "laura.martinez@universidad.edu",
    status: "active",
    price: 280,
    image: null,
    createdAt: "2026-02-10T11:00:00Z",
  },
  {
    id: "prod-005",
    title: "Bata de Laboratorio Talla M",
    seller: "María García López",
    sellerEmail: "maria.garcia@universidad.edu",
    status: "inactive",
    price: 150,
    image: null,
    createdAt: "2026-02-15T16:45:00Z",
  },
  {
    id: "prod-006",
    title: "Arduino Uno R3 + Kit de Sensores",
    seller: "Ana Torres Díaz",
    sellerEmail: "ana.torres@universidad.edu",
    status: "active",
    price: 650,
    image: null,
    createdAt: "2026-03-01T08:30:00Z",
  },
  {
    id: "prod-007",
    title: "Silla de Escritorio Ergonómica",
    seller: "Fernando Gómez",
    sellerEmail: "fernando.gomez@universidad.edu",
    status: "reported",
    price: 1200,
    image: null,
    createdAt: "2026-03-10T13:20:00Z",
  },
  {
    id: "prod-008",
    title: "Audífonos Sony WH-1000XM4",
    seller: "Laura Martínez",
    sellerEmail: "laura.martinez@universidad.edu",
    status: "deleted",
    price: 3800,
    image: null,
    createdAt: "2026-03-15T10:10:00Z",
  },
];

// ─── Reports ──────────────────────────────────────────────────────────────

export const mockReports: MockReport[] = [
  {
    id: "rep-001",
    productId: "prod-003",
    productTitle: "Laptop HP Pavilion 15 (usada)",
    productImage: null,
    reportedBy: "Juan Pérez Ramírez",
    reportedByEmail: "juan.perez@universidad.edu",
    seller: "Fernando Gómez",
    reason: "El precio parece sospechosamente bajo para una laptop de estas características. Posible estafa.",
    status: "pending",
    createdAt: "2026-02-05T14:30:00Z",
  },
  {
    id: "rep-002",
    productId: "prod-007",
    productTitle: "Silla de Escritorio Ergonómica",
    productImage: null,
    reportedBy: "Diego Hernández",
    reportedByEmail: "diego.hernandez@universidad.edu",
    seller: "Fernando Gómez",
    reason: "Las fotos del producto no coinciden con la descripción. Parece ser una silla diferente.",
    status: "pending",
    createdAt: "2026-03-12T09:15:00Z",
  },
  {
    id: "rep-003",
    productId: "prod-003",
    productTitle: "Laptop HP Pavilion 15 (usada)",
    productImage: null,
    reportedBy: "Valentina López",
    reportedByEmail: "valentina.lopez@universidad.edu",
    seller: "Fernando Gómez",
    reason: "El vendedor no responde mensajes y tiene múltiples reportes.",
    status: "pending",
    createdAt: "2026-02-08T11:00:00Z",
  },
  {
    id: "rep-004",
    productId: "prod-008",
    productTitle: "Audífonos Sony WH-1000XM4",
    productImage: null,
    reportedBy: "Roberto Sánchez",
    reportedByEmail: "roberto.sanchez@universidad.edu",
    seller: "Laura Martínez",
    reason: "Producto falsificado. Los audífonos recibidos no son originales Sony.",
    status: "resolved",
    createdAt: "2026-03-16T15:45:00Z",
  },
  {
    id: "rep-005",
    productId: "prod-002",
    productTitle: "Libro Cálculo Integral - Stewart 8va Ed.",
    productImage: null,
    reportedBy: "Sofía Ruiz Castillo",
    reportedByEmail: "sofia.ruiz@universidad.edu",
    seller: "Ana Torres Díaz",
    reason: "Es una copia pirata escaneada, no un libro original como se anuncia.",
    status: "pending",
    createdAt: "2026-01-25T10:30:00Z",
  },
];
