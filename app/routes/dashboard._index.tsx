import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node"
import { Link, useLoaderData, useMatches } from "@remix-run/react"
import { addDays, addMonths, format, isSameMonth, isThisMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { LaughIcon } from "lucide-react"
import { useState } from "react"
import invariant from "tiny-invariant"
import { BlockOfActions, ListOfActions } from "~/components/structure/Action"
import CreateAction from "~/components/structure/CreateAction"
import { Toggle } from "~/components/ui/Spectrum"
import { ScrollArea } from "~/components/ui/ui/scroll-area"
import { FINISHED_ID } from "~/lib/constants"
import {
  AvatarClient,
  getActionsForThisDay,
  getDelayedActions,
  getNotFinishedActions,
  sortActions,
  useIDsToRemove,
  usePendingActions,
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
  const [allActions, setAllActions] = useState(false)

  invariant(actions)

  const _actions = new Map<string, Action>(
    actions.map((action) => [action.id, action])
  )

  const { categories, priorities, states, clients } = matches[1]
    .data as DashboardDataType

  const pendingActions = usePendingActions()
  const idsToRemove = useIDsToRemove()

  for (const action of pendingActions as Action[]) {
    _actions.set(action.id, action)
  }

  for (const id of idsToRemove) {
    _actions.delete(id)
    actions.splice(
      actions.findIndex((action) => action.id === id),
      1
    )
  }

  actions = sortActions(Array.from(_actions, ([, v]) => v))

  const lateActions = getDelayedActions({ actions: actions as Action[] })
  const todayActions = getActionsForThisDay({ actions })
  const tomorrowActions = getActionsForThisDay({
    actions,
    date: addDays(new Date(), 1),
  })
  const notFinishedActions = getNotFinishedActions({ actions })

  return (
    <div className="container overflow-hidden">
      <ScrollArea className="h-full w-full px-4 md:px-8">
        <div className="pt-16"></div>
        {/* Ações em Atraso */}
        {lateActions?.length ? (
          <div className="mb-4">
            <div className="flex justify-between py-8">
              <h2 className="text-3xl font-medium tracking-tight">
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
        {/* Clientes - Parceiros - Contas */}
        <div className="mb-8 mt-4">
          <h4 className="mb-4 text-xl font-medium">Contas</h4>
          <div className="flow flex flex-wrap justify-center gap-4">
            {clients.map((client) => (
              <Link to={`/dashboard/${client.slug}`} key={client.id}>
                <AvatarClient client={client} size="lg" />
              </Link>
            ))}
          </div>
        </div>
        {/* Ações de Hoje */}
        {todayActions?.length ? (
          <div className="mb-8">
            <div className="flex justify-between py-8">
              <h2 className="text-3xl font-medium tracking-tight">
                Hoje ({todayActions?.length})
              </h2>
              <div>
                <Toggle
                  aria-pressed={allActions}
                  size={"sm"}
                  onChange={setAllActions}
                >
                  {allActions
                    ? "Exibir apenas as não conluídas"
                    : "Exibir ações concluídas"}
                </Toggle>
              </div>
            </div>

            {todayActions.filter((action) => action.state_id !== FINISHED_ID)
              .length > 0 || allActions ? (
              <BlockOfActions
                categories={categories}
                priorities={priorities}
                states={states}
                actions={
                  allActions
                    ? todayActions
                    : todayActions.filter(
                        (action) => action.state_id !== FINISHED_ID
                      )
                }
                clients={clients}
              />
            ) : (
              <div className="flex items-center justify-center gap-4">
                <LaughIcon className="size-6 text-gray-400" />
                <div>Todas as ações de hoje já foram concluídas</div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid place-content-center p-8 text-xl">
            <div className="space-y-4 rounded-lg bg-gray-900 p-8 text-center">
              <div>Nenhuma ação para hoje</div>
              <CreateAction mode="button" />
            </div>
          </div>
        )}
        {/* Ações de Amanhã */}
        {tomorrowActions?.length ? (
          <div className="mb-8">
            <div className="flex justify-between py-2">
              <h2 className="text-xl font-medium">
                Amanhã ({tomorrowActions?.length})
              </h2>
            </div>

            {tomorrowActions ? (
              <ListOfActions
                categories={categories}
                priorities={priorities}
                states={states}
                actions={tomorrowActions}
                clients={clients}
                max={2}
                date={{
                  dateFormat: 0,
                  timeFormat: 1,
                }}
              />
            ) : null}
          </div>
        ) : (
          <div className="grid place-content-center p-8 text-xl">
            <div className="space-y-4 rounded-lg bg-gray-900 p-8 text-center">
              <div>Nenhuma ação para hoje</div>
              <CreateAction mode="button" />
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-between pb-4 pt-8">
            <h2 className="text-3xl font-medium tracking-tight">
              Próximas Ações ({notFinishedActions?.length})
            </h2>
          </div>
          {/* Nesse Mês */}
          <>
            <h4 className="pb-4 text-xl font-medium tracking-tight">
              Nesse Mês
            </h4>

            <ListOfActions
              categories={categories}
              priorities={priorities}
              states={states}
              actions={notFinishedActions.filter((action) =>
                isThisMonth(action.date)
              )}
              showCategory={true}
              max={3}
              date={{ dateFormat: 2, timeFormat: 1 }}
              clients={clients}
              isFoldable={true}
            />
          </>

          <>
            <h4 className="py-4 text-xl font-medium tracking-tight">
              <span className="capitalize">
                {format(addMonths(new Date(), 1), "MMMM", { locale: ptBR })}
              </span>
              {format(addMonths(new Date(), 1), " 'de' yyyy", { locale: ptBR })}
            </h4>

            <ListOfActions
              categories={categories}
              priorities={priorities}
              states={states}
              actions={notFinishedActions.filter((action) =>
                isSameMonth(action.date, addMonths(new Date(), 1))
              )}
              showCategory={true}
              max={3}
              date={{ dateFormat: 2, timeFormat: 1 }}
              clients={clients}
              isFoldable={true}
            />
          </>
        </div>
      </ScrollArea>
    </div>
  )
}
