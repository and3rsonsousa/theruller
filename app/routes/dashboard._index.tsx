import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node"
import { Link, useFetchers, useLoaderData, useMatches } from "@remix-run/react"
import { useState } from "react"
import { BlockOfActions, ListOfActions } from "~/components/structure/Action"
import CreateAction from "~/components/structure/CreateAction"
import { ScrollArea } from "~/components/ui/ui/scroll-area"
import { Toggle } from "~/components/ui/ui/toggle"
import {
  AvatarClient,
  getDelayedActions,
  getNotFinishedActions,
  getOptimisticActions,
  getTodayActions,
  sortActions,
} from "~/lib/helpers"
import { SupabaseServerClient } from "~/lib/supabase"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { headers, supabase } = SupabaseServerClient({ request })

  const { data: actions } = await supabase.from("actions").select("*")

  return json({ actions }, { headers })
}

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard / Ruller" },
    { name: "description", content: "Welcome to Ruller!" },
  ]
}

export default function DashboardIndex() {
  let { actions } = useLoaderData<typeof loader>()
  const matches = useMatches()
  const fetchers = useFetchers()
  const [allActions, setAllActions] = useState(false)

  const { categories, priorities, states, clients } = matches[1]
    .data as DashboardDataType

  const optimisticActions = getOptimisticActions({ actions, fetchers })
  actions = sortActions([...actions!, ...optimisticActions]) as Action[]

  const lateActions = getDelayedActions({ actions })
  const todayActions = getTodayActions({ actions, finished: allActions })
  const notFinishedActions = getNotFinishedActions({ actions })

  return (
    <div className="container overflow-hidden">
      <ScrollArea className="h-full w-full px-4 md:px-8">
        <div className="pt-16"></div>
        {lateActions?.length ? (
          <div className="mb-8">
            <div className="flex justify-between py-2">
              <h2 className="text-xl font-medium">
                Atrasados ({lateActions?.length})
              </h2>
            </div>

            <ListOfActions
              categories={categories}
              priorities={priorities}
              states={states}
              actions={lateActions}
              showCategory={true}
              max={3}
              date={{ dateFormat: 1 }}
              clients={clients}
            />
          </div>
        ) : null}
        {todayActions?.length ? (
          <div className="mb-8">
            <div className="flex justify-between py-2">
              <h2 className="text-xl font-medium">
                Hoje ({todayActions?.length})
              </h2>
              <div>
                <Toggle pressed={allActions} onPressedChange={setAllActions}>
                  Mostrar Todas
                </Toggle>
              </div>
            </div>

            <BlockOfActions
              categories={categories}
              priorities={priorities}
              states={states}
              actions={todayActions}
              clients={clients}
            />
          </div>
        ) : (
          <div className="grid place-content-center p-8 text-xl">
            <div className="space-y-4 rounded-lg bg-gray-900 p-8 text-center">
              {getTodayActions({ actions, finished: true })?.length ? (
                <div>Todas as ações de hoje já foram concluídas</div>
              ) : (
                <div>Nenhuma ação para hoje</div>
              )}
              <CreateAction mode="button" />
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-medium">Clientes</h2>
          <div className="flex flex-wrap justify-between gap-4">
            {clients.map((client) => (
              <Link to={`/dashboard/${client.slug}`} key={client.id}>
                <AvatarClient client={client} size="lg" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between py-2">
            <h2 className="text-xl font-medium">
              Próximas Ações ({notFinishedActions?.length})
            </h2>
          </div>

          <ListOfActions
            categories={categories}
            priorities={priorities}
            states={states}
            actions={notFinishedActions}
            showCategory={true}
            max={3}
            date={{ dateFormat: 1 }}
            clients={clients}
          />
        </div>
      </ScrollArea>
    </div>
  )
}
