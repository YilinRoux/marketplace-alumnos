"use strict";
const request = require("supertest");
const app = require("../dist/index").default;

jest.mock("@supabase/supabase-js", () => {
    const mockSingle = jest.fn().mockResolvedValue({
        data: {
            id: "user-123",
            email: "test@test.com",
            full_name: "Test User",
            role: "user",
            avatar_url: null,
            phone: null,
        },
        error: null,
    });

    const mockFrom = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: mockSingle,
    }));

    const mockAuth = {
        signInWithPassword: jest.fn(),
        getUser: jest.fn(),
        refreshSession: jest.fn(),
        resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
        admin: {
            signOut: jest.fn().mockResolvedValue({}),
        },
    };

    return {
        createClient: jest.fn(() => ({
            auth: mockAuth,
            from: mockFrom,
        })),
    };
});

const { createClient } = require("@supabase/supabase-js");
const supabaseMock = createClient();

// ─── POST /auth/login ─────────────────────────────────────────
describe("POST /auth/login", () => {

    beforeEach(() => jest.clearAllMocks());

    test("✅ login exitoso — devuelve usuario con rol y setea cookies", async () => {
        supabaseMock.auth.signInWithPassword.mockResolvedValue({
            data: {
                session: {
                    access_token: "valid-access-token",
                    refresh_token: "valid-refresh-token",
                },
                user: { id: "user-123" },
            },
            error: null,
        });

        supabaseMock.from.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: {
                    email: "test@test.com",
                    full_name: "Test User",
                    role: "seller",
                    avatar_url: null,
                },
                error: null,
            }),
        });

        const res = await request(app)
            .post("/auth/login")
            .send({ email: "test@test.com", password: "password123" });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.user).toHaveProperty("role");
        expect(res.body.user.email).toBe("test@test.com");
        expect(res.headers["set-cookie"]).toBeDefined();
    });

    test("❌ contraseña incorrecta — devuelve 401 con mensaje genérico", async () => {
        supabaseMock.auth.signInWithPassword.mockResolvedValue({
            data: { session: null, user: null },
            error: { message: "Invalid login credentials" },
        });

        const res = await request(app)
            .post("/auth/login")
            .send({ email: "test@test.com", password: "wrongpassword" });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Credenciales inválidas");
        expect(res.body.error).not.toContain("contraseña");
    });

    test("❌ usuario inexistente — devuelve 401 con mismo mensaje genérico", async () => {
        supabaseMock.auth.signInWithPassword.mockResolvedValue({
            data: { session: null, user: null },
            error: { message: "User not found" },
        });

        const res = await request(app)
            .post("/auth/login")
            .send({ email: "noexiste@test.com", password: "cualquiera" });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("Credenciales inválidas");
    });

    test("❌ faltan campos — devuelve 400", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ email: "test@test.com" });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("requeridos");
    });
});

// ─── GET /auth/me ─────────────────────────────────────────────
describe("GET /auth/me", () => {

    beforeEach(() => jest.clearAllMocks());

    test("✅ token válido — devuelve perfil del usuario", async () => {
        supabaseMock.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-123" } },
            error: null,
        });

        supabaseMock.from.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: {
                    id: "user-123",
                    email: "test@test.com",
                    full_name: "Test User",
                    role: "seller",
                    avatar_url: null,
                    phone: null,
                },
                error: null,
            }),
        });

        const res = await request(app)
            .get("/auth/me")
            .set("Cookie", ["access_token=valid-token"]);

        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty("id");
        expect(res.body.user).toHaveProperty("role");
    });

    test("❌ token inválido — devuelve 401", async () => {
        supabaseMock.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: "JWT expired" },
        });
        supabaseMock.auth.refreshSession.mockResolvedValue({
            data: { session: null },
            error: { message: "Refresh token expired" },
        });

        const res = await request(app)
            .get("/auth/me")
            .set("Cookie", ["access_token=invalid-token"]);

        expect(res.status).toBe(401);
    });

    test("❌ sin token — devuelve 401", async () => {
        const res = await request(app).get("/auth/me");

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("No autenticado");
    });
});

// ─── POST /auth/logout ────────────────────────────────────────
describe("POST /auth/logout", () => {

    beforeEach(() => jest.clearAllMocks());

    test("✅ logout — limpia cookies y responde ok", async () => {
        supabaseMock.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-123" } },
            error: null,
        });

        const res = await request(app)
            .post("/auth/logout")
            .set("Cookie", ["access_token=valid-token"]);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        const cookies = res.headers["set-cookie"] || [];
        const cleared = cookies.filter(c =>
            c.includes("access_token=;") || c.includes("refresh_token=;")
        );
        expect(cleared.length).toBeGreaterThan(0);
    });
});

// ─── POST /api/products (rutas protegidas) ────────────────────
describe("POST /api/products", () => {

    beforeEach(() => jest.clearAllMocks());

    test("❌ sin token — devuelve 401", async () => {
        const res = await request(app)
            .post("/api/products")
            .send({ title: "Producto test", price: 100 });

        expect(res.status).toBe(401);
    });

    test("❌ rol insuficiente (user) — devuelve 403", async () => {
        supabaseMock.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-123" } },
            error: null,
        });

        supabaseMock.from.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: {
                    id: "user-123",
                    email: "user@test.com",
                    full_name: "User Normal",
                    role: "user",
                    avatar_url: null,
                    phone: null,
                },
                error: null,
            }),
        });

        const res = await request(app)
            .post("/api/products")
            .set("Cookie", ["access_token=valid-token"])
            .send({ title: "Producto test", price: 100 });

        expect(res.status).toBe(403);
        expect(res.body.error).toContain("rol insuficiente");
    });
});