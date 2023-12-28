import { LoaderFunctionArgs, redirect } from "@remix-run/node"
import { SupabaseServerClient } from "~/lib/supabase"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, headers } = SupabaseServerClient({ request })

  await supabase.auth.signOut()

  return redirect("/", { headers })
}
