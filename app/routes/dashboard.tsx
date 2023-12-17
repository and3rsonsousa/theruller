import { LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import Layout from "~/components/structure/Layout"
import { SupabaseServerClient } from "~/lib/supabase"

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = SupabaseServerClient({ request })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return redirect("/login")
  }

  const [
    { data: clients },
    { data: people },
    { data: categories },
    { data: states },
    { data: priorities },
  ] = await Promise.all([
    supabase.from("clients").select("*").order("title", { ascending: true }),
    supabase.from("people").select("*").order("name", { ascending: true }),
    supabase
      .from("categories")
      .select("*")
      .order("priority", { ascending: true }),
    supabase.from("states").select("*").order("order", { ascending: true }),
    supabase.from("priority").select("*").order("order", { ascending: true }),
  ])

  const user = people?.find(
    (person) => person.user_id === session.user.id
  ) as Person

  return json(
    {
      clients,
      people,
      categories,
      user,
      states,
      priorities,
      session,
    } as DashboardDataType,
    200
  )
}

export default function Dashboard() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
