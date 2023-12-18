import { LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useMatches } from "@remix-run/react"
import { useEffect } from "react"
import { BlockOfActions, ListOfActions } from "~/components/structure/Action"
import {
  getLateActions,
  getNotFinishedActions,
  getTodayActions,
} from "~/lib/helpers"
import { SupabaseServerClient } from "~/lib/supabase"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase } = SupabaseServerClient({ request })

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("slug", params["client"] as string)
    .single()

  const { data: actions } = await supabase
    .from("actions")
    .select("*")
    .eq("client_id", client!.id)

  return { actions, client }
}

export default function Actions() {
  const matches = useMatches()
  const { actions } = useLoaderData<typeof loader>() || {}
  const { categories, priorities, states, clients } = matches[1]
    .data as DashboardDataType

  console.log({ actions })

  const lateActions = getLateActions({ actions })
  const todayActions = getTodayActions({ actions })
  const notFinishedActions = getNotFinishedActions({ actions })

  useEffect(() => {
    console.log({ actions })
  }, [actions])

  return (
    <div className="container overflow-hidden">
      {lateActions?.length ? (
        <div className="mb-8">
          <div className="flex justify-between py-2">
            <h2 className="text-xl font-semibold">
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

      <div className="mb-8">
        <div className="flex justify-between py-2">
          <h2 className="text-xl font-semibold">
            Hoje ({todayActions?.length})
          </h2>
        </div>

        <BlockOfActions
          categories={categories}
          priorities={priorities}
          states={states}
          actions={todayActions}
          clients={clients}
        />
      </div>
      <div className="mb-8">
        <div className="flex justify-between py-2">
          <h2 className="text-xl font-semibold">
            Próximas ações ({notFinishedActions?.length})
          </h2>
        </div>

        <ListOfActions
          categories={categories}
          priorities={priorities}
          states={states}
          actions={notFinishedActions}
          max={3}
          showCategory={true}
          date={{ dateFormat: 2, timeFormat: 1 }}
        />
      </div>
    </div>
  )
}
