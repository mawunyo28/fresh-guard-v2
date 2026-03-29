import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const handleSupabaseError = (error: any, operation: string) => {
	console.error(`Supabase Error during ${operation}:`, error);
	throw new Error(
		JSON.stringify({
			error: error.message,
			operationType: operation,
			code: error.code,
			details: error.details,
			hint: error.hint,
		}),
	);
};
