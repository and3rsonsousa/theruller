import { LoaderFunctionArgs, json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { ScrollArea } from "~/components/ui/ui/scroll-area"
import { AvatarClient } from "~/lib/helpers"
import { SupabaseServerClient } from "~/lib/supabase"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, headers } = await SupabaseServerClient({ request })

  const { data: clients } = await supabase.from("clients").select("*")

  return json({ clients, headers })
}

export default function AdminClients() {
  const { clients } = useLoaderData<typeof loader>()
  return (
    <div className="container overflow-hidden">
      <ScrollArea className="h-full w-full px-4 md:px-8">
        <div className="pt-16"></div>
        <div className="grid py-4 sm:grid-cols-2">
          {clients?.map((client) => (
            <div
              className="flex items-center gap-2 rounded py-4 font-medium   hover:bg-gray-900"
              key={client.id}
            >
              <AvatarClient client={client} size="lg" />
              <Link
                to={`/dashboard/admin/client/${client.slug}`}
                className="text-2xl"
              >
                {client.title}
              </Link>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
