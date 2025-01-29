import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Create a singleton instance for client components
const supabase = createClientComponentClient();

export { supabase };
