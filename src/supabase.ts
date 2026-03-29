import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
	process.env.SUPABASE_URL || "https://dpuzkuigsrajcpgkpxrv.supabase.co";
const supabaseAnonKey =
	process.env.SUPABASE_ANON_KEY ||
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdXprdWlnc3JhamNwZ2tweHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MDg5MjksImV4cCI6MjA5MDM4NDkyOX0.22HN9t4oAFrAsPhxWq11gaFfmqWuyKaP6acSr36Da7E";

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
