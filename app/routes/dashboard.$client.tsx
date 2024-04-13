import { LoaderFunctionArgs, MetaFunction, json, redirect } from "@vercel/remix"
import { Link, Outlet, useLoaderData, useMatches } from "@remix-run/react"
import { CalendarDaysIcon, Grid3X3Icon, ListTodoIcon } from "lucide-react"
import Progress from "~/components/structure/Progress"
import { Button } from "~/components/ui/ui/button"
import { ScrollArea } from "~/components/ui/ui/scroll-area"
import { AvatarClient } from "~/lib/helpers"

import { SupabaseServerClient } from "~/lib/supabase"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { headers, supabase } = SupabaseServerClient({ request })

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("slug", params["client"] as string)
    .single()

  if (client) {
    return json(
      { client, instagram: request.url.indexOf("/instagram") },
      { headers }
    )
  } else {
    return redirect("/", 400)
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data?.client?.title,
    },
  ]
}

export default function Client() {
  const { client } = useLoaderData<typeof loader>()
  const matches = useMatches()

  const { states } = matches[1].data as DashboardDataType
  const { actions } = matches[3].data as { actions: Action[] }

  return (
    <div className="flex flex-col overflow-y-hidden">
      <ScrollArea className="px-4 pb-4 md:px-8" id="scrollarea">
        <div className="pt-16"></div>
        <div className="flex justify-between pt-2">
          <Link
            to={`/dashboard/${client.slug}`}
            className="flex items-center gap-4 "
          >
            <AvatarClient client={client} size="lg" />
            <div className="text-2xl font-medium tracking-tight">
              <div>{client?.title}</div>
              <Progress
                total={actions.length}
                values={states
                  // .filter((state) => state.id !== FINISHED_ID)
                  .map((state) => ({
                    id: state.id,
                    title: state.title,
                    value: actions?.filter(
                      (action) => action.state_id === state.id
                    ).length,
                    color: `bg-${state.slug}`,
                  }))}
              />
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="flex gap-2 font-medium"
            >
              <Link to={`/dashboard/${client?.slug}/`}>
                <CalendarDaysIcon className="h-4 w-4" />
                <div className="hidden md:block">Calendário</div>
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="flex gap-2 font-medium"
            >
              <Link to={`/dashboard/${client?.slug}/instagram`}>
                <Grid3X3Icon className="h-4 w-4" />
                <div className="hidden md:block">Instagram</div>
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="flex gap-2 font-medium"
            >
              <Link to={`/dashboard/${client?.slug}/actions`}>
                <ListTodoIcon className="h-4 w-4" />
                <div className="hidden md:block">Ações</div>
              </Link>
            </Button>
          </div>
        </div>

        <Outlet />
      </ScrollArea>
    </div>
  )
}
