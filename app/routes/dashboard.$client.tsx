import { LoaderFunctionArgs, json } from "@remix-run/node"
import {
  Link,
  useLoaderData,
  useMatches,
  useSearchParams,
} from "@remix-run/react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { ListOfActions } from "~/components/structure/Action"
import CreateAction from "~/components/structure/CreateAction"
import { Button } from "~/components/ui/ui/button"
import { ScrollArea } from "~/components/ui/ui/scroll-area"
import { SupabaseServerClient } from "~/lib/supabase"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  let date = new URL(request.url).searchParams.get("date")

  date ||= format(new Date(), "yyyy-MM-dd")

  const { headers, supabase } = SupabaseServerClient({ request })

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("slug", params["client"] as string)
    .single()

  const { data: actions } = await supabase
    .from("actions")
    .select("*")
    .eq("client_id", client!.id)
    .gte(
      "date",
      format(startOfWeek(startOfMonth(parseISO(date))), "yyyy-MM-dd HH:mm:ss")
    )
    .lte(
      "date",
      format(endOfWeek(endOfMonth(parseISO(date))), "yyyy-MM-dd HH:mm:ss")
    )

  return json({ actions, client }, { headers })
}

export default function Client() {
  const { actions, client } = useLoaderData<typeof loader>()
  const matches = useMatches()
  const { categories, priorities, states } = matches[1]
    .data as DashboardDataType

  const [searchParams] = useSearchParams()

  const date = searchParams.get("date") || format(new Date(), "yyyy-MM-dd")
  const currentDate = parseISO(date)

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  })

  const calendar = days.map((day) => {
    return {
      date: day,
      actions: actions?.filter((action) =>
        isSameDay(parseISO(action.date), day)
      ),
    }
  })

  return (
    <div className="container flex flex-col overflow-hidden px-8 ">
      <ScrollArea className="pb-8">
        <div className="flex items-center gap-1 py-4 text-xl font-semibold capitalize">
          <div>{format(currentDate, "MMMM", { locale: ptBR })}</div>
          <Button size="icon" variant="ghost" asChild>
            <Link
              to={`/dashboard/${client?.slug}?date=${format(
                subMonths(currentDate, 1),
                "yyyy-MM-dd"
              )}`}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="icon" variant="ghost" asChild>
            <Link
              to={`/dashboard/${client?.slug}?date=${format(
                addMonths(currentDate, 1),
                "yyyy-MM-dd"
              )}`}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-7 py-2 text-center text-xs font-semibold uppercase tracking-wide">
          {eachDayOfInterval({
            start: startOfWeek(new Date()),
            end: endOfWeek(new Date()),
          }).map((day, j) => {
            return <div key={j}>{format(day, "EEE", { locale: ptBR })}</div>
          })}
        </div>
        <div
          className={`grid min-h-screen grid-cols-7 gap-2 ${
            calendar.length === 35 ? "grid-rows-5" : "grid-rows-6"
          }`}
        >
          {calendar.map((day, i) => (
            <div key={i}>
              <div className="mb-2 flex justify-between">
                <div
                  className={`grid h-6 w-6 place-content-center rounded-full text-xs ${
                    isToday(day.date) ? "bg-primary" : "-ml-1"
                  } ${
                    isSameMonth(day.date, currentDate)
                      ? "font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {day.date.getDate()}
                </div>
                <div>
                  <CreateAction
                    mode="day"
                    date={day.date}
                    key={format(day.date, "yyyy-MM-dd")}
                  />
                </div>
              </div>
              <ListOfActions
                categories={categories}
                priorities={priorities}
                states={states}
                actions={day.actions}
                showCategory
                date={{ timeFormat: 1 }}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
