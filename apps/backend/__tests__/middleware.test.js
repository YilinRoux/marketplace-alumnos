"use strict";

const mockSessions = new Map();

jest.mock("../src/services/sessions.service", () => ({
  validateToken: jest.fn(),
  createSession: jest.fn(),
  mockUsers: [
    { id: "user-001", email: "omar@universidad.edu", name: "Omar Lazaro", role: "seller" },
    { id: "user-002", email: "yilin@universidad.edu", name: "Yilin Roux", role: "seller" },
    { id: "user-003", email: "admin@universidad.edu", name: "Admin User", role: "superadmin" },
  ],
  deleteAllUserSessions: jest.fn(),
  getSessionsByUser: jest.fn(),
  deleteSession: jest.fn(),
  findUserByCredentials: jest.fn(),
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
      refreshSession: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      admin: { signOut: jest.fn() },
    },
    from: jest.fn(),
  })),
}));

const { validateToken } = require("../src/services/sessions.service");

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

function mockNext() { return jest.fn(); }
function mockReq(overrides = {}) { return { headers: {}, ...overrides }; }

function createFakeSession(role = "seller") {
  return {
    id: `sess_${Date.now()}`,
    userId: `user-${role}`,
    email: `${role}@test.com`,
    role,
    token: `fake_token_${role}_${Date.now()}`,
    device: "Test",
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  };
}

// ─── authenticate ─────────────────────────────────────────────

describe("Middleware: authenticate", () => {
  let authenticate;

  beforeAll(() => {
    authenticate = require("../dist/middleware/authenticate").authenticate;
  });

  beforeEach(() => jest.clearAllMocks());

  test("❌ sin header Authorization — retorna 401", () => {
    const req = mockReq({ headers: {} });
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("❌ header sin formato Bearer — retorna 401", () => {
    const req = mockReq({ headers: { authorization: "Token abc123" } });
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("❌ token inválido — retorna 401", () => {
    validateToken.mockReturnValueOnce(null);
    const req = mockReq({ headers: { authorization: "Bearer token_invalido" } });
    const res = mockRes();
    const next = mockNext();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("✅ token válido — adjunta sesión y llama next()", () => {
  const session = createFakeSession("seller");
  // Forzar que validateToken retorne la sesión
  validateToken.mockImplementation(() => session);

  const req = mockReq({ headers: { authorization: `Bearer ${session.token}` } });
  const res = mockRes();
  const next = mockNext();

  authenticate(req, res, next);

  expect(next).toHaveBeenCalled();
  expect(req.session).toBeDefined();
  expect(req.session.role).toBe("seller");
});
});

// ─── authorize ────────────────────────────────────────────────

describe("Middleware: authorize", () => {
  let authorize;

  beforeAll(() => {
    authorize = require("../dist/middleware/authorize").authorize;
  });

  beforeEach(() => jest.clearAllMocks());

  test("❌ sin sesión — retorna 401", () => {
    const req = mockReq({});
    const res = mockRes();
    const next = mockNext();

    authorize("seller")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("❌ user intenta ruta de seller — retorna 403", () => {
    const req = mockReq({ session: createFakeSession("user") });
    const res = mockRes();
    const next = mockNext();

    authorize("seller")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("❌ seller intenta ruta de superadmin — retorna 403", () => {
    const req = mockReq({ session: createFakeSession("seller") });
    const res = mockRes();
    const next = mockNext();

    authorize("superadmin")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("✅ seller accede a ruta de seller — llama next()", () => {
    const req = mockReq({ session: createFakeSession("seller") });
    const res = mockRes();
    const next = mockNext();

    authorize("seller")(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("✅ superadmin accede a ruta de seller — llama next()", () => {
    const req = mockReq({ session: createFakeSession("superadmin") });
    const res = mockRes();
    const next = mockNext();

    authorize("seller")(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("✅ múltiples roles — seller puede acceder", () => {
    const req = mockReq({ session: createFakeSession("seller") });
    const res = mockRes();
    const next = mockNext();

    authorize("seller", "superadmin")(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});