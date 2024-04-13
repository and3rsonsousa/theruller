import { LoaderFunctionArgs, redirect } from "@vercel/remix"
import { Outlet } from "@remix-run/react"
import { SupabaseServerClient } from "~/lib/supabase"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, headers } = SupabaseServerClient({ request })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return redirect("/auth/login", { headers })

  const { data: adminUser } = await supabase
    .from("people")
    .select("*")
    .eq("user_id", session.user.id)
    .is("admin", true)
    .single()

  if (!adminUser) return redirect("/dashboard", { headers })

  return { headers, adminUser }
}

export default function AdminClients() {
  return <Outlet />
}
