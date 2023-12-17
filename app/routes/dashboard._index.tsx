import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node"
import { useFetchers, useLoaderData, useMatches } from "@remix-run/react"
import { BlockOfActions, ListOfActions } from "~/components/structure/Action"
import CreateAction from "~/components/structure/CreateAction"
import { ScrollArea } from "~/components/ui/ui/scroll-area"
import { convertToAction, getLateActions, getTodayActions } from "~/lib/helpers"
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

  const { categories, priorities, states, clients } = matches[1]
    .data as DashboardDataType

  const optimisticActions = fetchers?.reduce<Action[]>((memo, fetcher) => {
    if (fetcher.formData) {
      const data = Object.fromEntries(fetcher.formData)

      if (data.action === "action-update") {
        const actionIndex = actions?.findIndex(
          (action) => action.id === data.id
        )

        const action: Action = { ...actions![actionIndex!], ...data }
        actions?.splice(actionIndex!, 1, action)
      } else if (data.action === "action-create") {
        memo.push(convertToAction(data))
      }
    }
    return memo
  }, [])

  actions = [...actions!, ...optimisticActions]

  const lateActions = getLateActions({ actions })
  const todayActions = getTodayActions({ actions })

  return (
    <div className="container overflow-hidden">
      <ScrollArea className="h-full w-full">
        {lateActions?.length && (
          <div className="mb-8">
            <div className="flex justify-between py-2">
              <h2 className="text-xl font-semibold">
                Atrasados ({lateActions?.length})
              </h2>
            </div>
            <div className="flex">
              <ScrollArea className="max-h-[300px] w-full">
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
              </ScrollArea>
            </div>
          </div>
        )}
        {todayActions?.length ? (
          <div className="mb-8">
            <div className="flex justify-between py-2">
              <h2 className="text-xl font-semibold">
                Hoje ({todayActions?.length})
              </h2>
            </div>
            <div className="flex">
              <ScrollArea className="max-h-[300px] w-full">
                <BlockOfActions
                  categories={categories}
                  priorities={priorities}
                  states={states}
                  actions={todayActions}
                  clients={clients}
                />
              </ScrollArea>
            </div>
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
      </ScrollArea>
    </div>
  )
}
