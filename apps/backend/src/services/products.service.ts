import { SupabaseClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortOption = "recent" | "price_asc" | "price_desc";

export interface GetProductsParams {
    search?: string;
    category?: string;   // slug
    minPrice?: number;
    maxPrice?: number;
    condition?: string;  // reserved for future schema extension
    page?: number;
    limit?: number;
    sort?: SortOption;
}

export interface ProductResponse {
    id: string;
    title: string;
    price: number;
    condition: string | null;
    created_at: string;
    category: { name: string; slug: string } | null;
    seller: { id: string; full_name: string | null } | null;
}

export interface PaginatedProducts {
    data: ProductResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export async function getProductsService(
    supabase: SupabaseClient,
    params: GetProductsParams
): Promise<PaginatedProducts> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const sort = params.sort ?? "recent";
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Base query — only active products, join category and seller
    let query = supabase
        .from("products")
        .select(
            `
      id,
      title,
      price,
      status,
      created_at,
      categories!inner ( name, slug ),
      profiles!seller_id ( id, full_name )
      `,
            { count: "exact" }
        )
        .eq("status", "active");

    // ── Filters ──────────────────────────────────────────────────────────────

    if (params.search?.trim()) {
        query = query.ilike("title", `%${params.search.trim()}%`);
    }

    if (params.category?.trim()) {
        // categories is already joined with !inner, filter by slug
        query = query.eq("categories.slug", params.category.trim());
    }

    if (params.minPrice !== undefined && !isNaN(params.minPrice)) {
        query = query.gte("price", params.minPrice);
    }

    if (params.maxPrice !== undefined && !isNaN(params.maxPrice)) {
        query = query.lte("price", params.maxPrice);
    }

    // NOTE: `condition` column does not exist in the current schema.
    // This filter is reserved for a future ALTER TABLE migration.

    // ── Sorting ───────────────────────────────────────────────────────────────

    switch (sort) {
        case "price_asc":
            query = query.order("price", { ascending: true });
            break;
        case "price_desc":
            query = query.order("price", { ascending: false });
            break;
        case "recent":
        default:
            query = query.order("created_at", { ascending: false });
            break;
    }

    // ── Pagination ────────────────────────────────────────────────────────────

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
        throw new Error(`Supabase query failed: ${error.message}`);
    }

    // ── Shape response ────────────────────────────────────────────────────────

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shaped: ProductResponse[] = (data ?? []).map((row: any) => ({
        id: row.id,
        title: row.title,
        price: row.price,
        condition: null,          // reserved — no schema column yet
        created_at: row.created_at,
        category: row.categories
            ? { name: row.categories.name, slug: row.categories.slug }
            : null,
        seller: row.profiles
            ? { id: row.profiles.id, full_name: row.profiles.full_name }
            : null,
    }));

    return {
        data: shaped,
        pagination: {
            page,
            limit,
            total: count ?? 0,
        },
    };
}
