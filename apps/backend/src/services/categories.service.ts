import { SupabaseClient } from "@supabase/supabase-js";

export interface CategoryItem {
    id: string;
    name: string;
    slug: string;
}

export async function getCategoriesService(
    supabase: SupabaseClient
): Promise<CategoryItem[]> {
    const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name", { ascending: true });

    if (error) {
        throw new Error(`Supabase query failed: ${error.message}`);
    }

    return data ?? [];
}
