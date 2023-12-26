import { LoaderFunctionArgs, json } from "@remix-run/node"
import {
  Link,
  useLoaderData,
  useMatches,
  useSearchParams,
  useSubmit,
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
import { useEffect, useState } from "react"
import invariant from "tiny-invariant"
import { ListOfActions } from "~/components/structure/Action"
import CreateAction from "~/components/structure/CreateAction"
import { Button } from "~/components/ui/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/ui/dropdown-menu"
import {
  Icons,
  sortActions,
  useOptimisticAddedActions,
  useOptimisticRemovedActions,
} from "~/lib/helpers"
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
  let { actions } = useLoaderData<typeof loader>()
  const { client } = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const matches = useMatches()
  const submit = useSubmit()
  const [draggedAction, setDraggedAction] = useState<Action>()
  const [stateFilter, setStateFilter] = useState<State>()
  const [categoryFilter, setCategoryFilter] = useState<Category>()

  const { categories, priorities, states } = matches[1]
    .data as DashboardDataType

  const date = searchParams.get("date") || format(new Date(), "yyyy-MM-dd")
  const currentDate = parseISO(date)

  invariant(actions)

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  })

  const optimisticAddedActions = useOptimisticAddedActions()
  const optimisticRemovedIDs = useOptimisticRemovedActions()

  for (const action of optimisticAddedActions) {
    if (!actions.find((a) => a.id === action.id)) {
      actions.push(action as Action)
    }
  }

  for (const id of optimisticRemovedIDs) {
    actions.splice(
      actions.findIndex((action) => action.id === id),
      1
    )
  }

  actions = sortActions(actions)

  const calendar = days.map((day) => {
    return {
      date: day,
      actions: actions?.filter((action) =>
        isSameDay(parseISO(action.date), day)
      ),
    }
  })

  useEffect(() => {
    if (draggedAction) {
      const day = document.querySelector(".dragover") as HTMLElement
      const date = day?.getAttribute("data-date") as string

      //
      submit(
        {
          id: draggedAction.id,
          date: date?.concat(
            `T${new Date(draggedAction.date).getHours()}:${new Date(
              draggedAction.date
            ).getMinutes()}`
          ),
          action: "action-update",
        },
        {
          action: "/handle-actions",
          method: "POST",
          navigate: false,
        }
      )
      //reset
      setDraggedAction(undefined)
    }
  }, [draggedAction, submit])

  useEffect(() => {
    document
      .querySelector("[data-radix-scroll-area-viewport]")!
      .addEventListener("scroll", function (e: unknown) {
        const header = document.querySelector("#daysheader")
        const calendar = document.querySelector("#calendar")
        const divider = document.querySelector("#divider")
        if ((e as React.UIEvent<HTMLElement>).currentTarget.scrollTop > 60) {
          header?.classList.add("fixed", "top-[64px]", "-ml-8", "px-9")
          calendar?.classList.add("mt-20")
          divider?.classList.remove("hidden")
        } else {
          header?.classList.remove("fixed", "-ml-8", "px-9")
          calendar?.classList.remove("mt-20")
          divider?.classList.add("hidden")
        }
      })
  }, [])

  return (
    <div className="container relative flex flex-col overflow-hidden">
      <div
        id="daysheader"
        className="container z-10 bg-background/25 backdrop-blur-lg"
      >
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-1 text-xl font-semibold capitalize">
            <div className="mr-4">
              {format(currentDate, "MMMM", { locale: ptBR })}
            </div>
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
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"sm"}
                  variant={"ghost"}
                  className={`bg-${stateFilter?.slug} text-xs font-semibold`}
                >
                  {stateFilter ? stateFilter.title : "Filtre pelo Status"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-content">
                <DropdownMenuCheckboxItem
                  className="bg-select-item flex gap-2"
                  onCheckedChange={() => {
                    setStateFilter(undefined)
                  }}
                >
                  <div
                    className={`h-3 w-3 rounded-full border-2 border-white`}
                  ></div>
                  <div>Todos os Status</div>
                </DropdownMenuCheckboxItem>
                {states.map((state) => (
                  <DropdownMenuCheckboxItem
                    className="bg-select-item flex gap-2"
                    key={state.id}
                    checked={state.id === stateFilter?.id}
                    onCheckedChange={(checked) => {
                      if (!checked && state.id === stateFilter?.id) {
                        setStateFilter(undefined)
                      } else {
                        setStateFilter(state)
                      }
                    }}
                  >
                    <div
                      className={`h-3 w-3 rounded-full border-2 border-${state.slug}`}
                    ></div>
                    <div>{state.title}</div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"sm"}
                  variant={"ghost"}
                  className={`text-xs font-semibold`}
                >
                  {categoryFilter ? (
                    <>
                      <Icons
                        id={categoryFilter.slug}
                        className="mr-1 h-4 w-4"
                      />
                      <div>{categoryFilter.title}</div>
                    </>
                  ) : (
                    "Filtre pela Categoria"
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-content">
                <DropdownMenuCheckboxItem
                  className="bg-select-item flex gap-2"
                  checked={categoryFilter === undefined}
                  onCheckedChange={() => {
                    setCategoryFilter(undefined)
                  }}
                >
                  <Icons className="h-3 w-3" id="all" />
                  <div>Todas as Categorias</div>
                </DropdownMenuCheckboxItem>
                {categories.map((category) => (
                  <DropdownMenuCheckboxItem
                    className="bg-select-item flex gap-2"
                    key={category.id}
                    checked={category.id === categoryFilter?.id}
                    onCheckedChange={(checked) => {
                      if (!checked && category.id === categoryFilter?.id) {
                        setCategoryFilter(undefined)
                      } else {
                        setCategoryFilter(category)
                      }
                    }}
                  >
                    <Icons id={category.slug} className="h-3 w-3" />
                    <div>{category.title}</div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="hidden grid-cols-7  px-0 pb-2 text-center text-xs font-medium uppercase tracking-wide  md:grid">
          {eachDayOfInterval({
            start: startOfWeek(new Date()),
            end: endOfWeek(new Date()),
          }).map((day, j) => {
            return <div key={j}>{format(day, "EEE", { locale: ptBR })}</div>
          })}
        </div>
        <div
          id="divider"
          className="absolute bottom-0 hidden h-[1px] w-full bg-gradient-to-r  from-transparent via-gray-700"
        ></div>
      </div>
      <div
        id="calendar"
        className={`grid-cols-7 md:grid ${
          calendar.length === 35 ? "grid-rows-5" : "grid-rows-6"
        }`}
      >
        {calendar.map((day, i) => (
          <div
            className={`${
              !isSameMonth(day.date, currentDate) ? "hidden md:block" : ""
            } group/day relative border-t bg-gradient-to-b py-2 transition hover:from-gray-900 hover:via-transparent md:px-1 md:pt-0`}
            key={i}
            data-date={format(day.date, "yyyy-MM-dd")}
            onDragOver={(e) => {
              e.stopPropagation()
              e.preventDefault()
              document
                .querySelectorAll(".dragover")
                .forEach((e) => e.classList.remove("dragover"))
              e.currentTarget.classList.add("dragover")
            }}
          >
            <div className="absolute -top-[1px] left-0 right-0 mt-24 h-[1px] bg-gradient-to-r from-transparent via-gray-500 opacity-0 transition group-hover/day:opacity-100"></div>
            <div className="my-1 flex justify-between">
              <div
                className={`grid h-6 w-6 place-content-center rounded-full text-xs ${
                  isToday(day.date) ? "bg-primary" : "-ml-1"
                } ${
                  isSameMonth(day.date, currentDate)
                    ? "font-medium"
                    : "text-gray-700"
                }`}
              >
                {day.date.getDate()}
              </div>
              <div className="transition group-hover/day:opacity-100 md:opacity-0">
                <CreateAction
                  mode="day"
                  date={day.date}
                  key={format(day.date, "yyyy-MM-dd")}
                />
              </div>
            </div>
            <div className="relative">
              <ListOfActions
                categories={categories}
                priorities={priorities}
                states={states}
                actions={day.actions}
                showCategory
                date={{ timeFormat: 1 }}
                onDrag={(action) => {
                  setDraggedAction(action)
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
