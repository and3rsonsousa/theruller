import { useNavigate, useSubmit } from "@remix-run/react"
import {
  addHours,
  format,
  formatDistanceToNow,
  isSameYear,
  parseISO,
} from "date-fns"
import ptBR from "date-fns/locale/pt-BR"
import { CopyIcon, PencilLineIcon, TimerIcon, TrashIcon } from "lucide-react"
import { Fragment, useEffect, useState } from "react"
import {
  FINISHED_ID,
  PRIORITY_HIGH,
  PRIORITY_LOW,
  PRIORITY_MEDIUM,
} from "~/lib/constants"
import { AvatarClient, Icons } from "~/lib/helpers"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../ui/ui/context-menu"

export function ActionLine({
  action,
  categories,
  states,
  priorities,
  showCategory,
  client,
  date,
}: {
  action: Action
  categories: Category[]
  states: State[]
  priorities: Priority[]
  showCategory?: boolean
  client?: Client
  date?: { dateFormat?: 0 | 1 | 2 | 3 | 4; timeFormat?: 0 | 1 }
}) {
  const [edit, setEdit] = useState(false)
  const [isHover, setHover] = useState(false)
  const submit = useSubmit()
  const navigate = useNavigate()

  const handleActions = (data: { [key: string]: string | number }) => {
    submit(
      { ...data },
      {
        action: "/handle-actions",
        method: "post",
        navigate: false,
      }
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          title={action.title}
          className={`@[180px]:px-4 flex w-full cursor-pointer select-none items-center justify-between gap-2 overflow-hidden rounded border-l-4 px-2  py-1 text-xs font-medium transition ${
            edit
              ? "bg-gray-700"
              : "bg-gray-900 hover:bg-gray-800 hover:text-gray-200"
          } border-${states.find(
            (state) => state.id === Number(action.state_id)
          )?.slug}`}
          onClick={(e) => {
            if (e.shiftKey) {
              setEdit(true)
            } else {
              navigate(`/dashboard/action/${action.id}`)
            }
          }}
          onMouseEnter={() => {
            setHover(true)
          }}
          onMouseLeave={() => {
            setHover(false)
          }}
          role="button"
          tabIndex={-1}
          onKeyDown={() => {}}
        >
          {/* Atalhos */}
          {isHover && !edit && !edit ? (
            <ShortcutActions action={action} handleActions={handleActions} />
          ) : null}
          <div className="flex shrink grow items-center gap-2">
            {showCategory && (
              <Icons
                id={
                  categories.find(
                    (category) => category.id === action.category_id
                  )?.slug
                }
                className="h-4 w-4 text-gray-600"
              />
            )}
            {client && (
              <AvatarClient size="xs" client={client} />
              // <div className="w-12 shrink-0 overflow-hidden text-center text-[8px] font-semibold uppercase tracking-wider">
              //   {
              //     clients.find((client) => client.id === action.client_id)
              //       ?.short
              //   }
              // </div>
            )}
            <div className="relative w-full">
              <input
                readOnly={!edit}
                type="text"
                defaultValue={action.title}
                className={`w-full bg-transparent outline-none ${
                  !edit ? "cursor-pointer opacity-0" : "opacity-100"
                }`}
                onBlur={(e) => {
                  if (e.target.value !== action.title)
                    handleActions({
                      action: "action-update",
                      id: action.id,
                      title: e.target.value,
                    })

                  setEdit(() => false)
                }}
              />
              <span
                className={`pointer-events-none absolute left-0 right-0 top-0 line-clamp-1 ${
                  edit ? "opacity-0 " : "opacity-100"
                }`}
              >
                {action.title}
              </span>
            </div>
          </div>

          {date && (
            <div className="shrink grow-0 whitespace-nowrap text-right text-[10px] text-gray-500">
              {formatActionDatetime({
                date: action.date,
                dateFormat: date.dateFormat,
                timeFormat: date.timeFormat,
              })}
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuItems
        action={action}
        categories={categories}
        handleActions={handleActions}
        states={states}
        priorities={priorities}
      />
    </ContextMenu>
  )
}

export function ActionBlock({
  action,
  categories,
  priorities,
  states,
  client,
}: {
  action: Action
  categories: Category[]
  priorities: Priority[]
  states: State[]
  client?: Client
}) {
  const submit = useSubmit()
  const navigate = useNavigate()
  const [edit, setEdit] = useState(false)
  const [isHover, setHover] = useState(false)

  const handleActions = (data: { [key: string]: string | number }) => {
    submit(
      { ...data },
      {
        action: "/handle-actions",
        method: "post",
        navigate: false,
      }
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          role="button"
          tabIndex={-1}
          onKeyDown={() => {}}
          title={action.title}
          className={`flex cursor-pointer flex-col justify-between gap-2 overflow-hidden rounded border-l-4 px-4 py-2 text-sm transition border-${states.find(
            (state) => state.id === Number(action.state_id)
          )?.slug} ${
            edit
              ? "bg-gray-700 text-gray-100"
              : "bg-gray-900 hover:bg-gray-800 hover:text-gray-200"
          }`}
          onMouseEnter={() => {
            setHover(true)
          }}
          onMouseLeave={() => {
            setHover(false)
          }}
          onClick={(e) => {
            if (e.shiftKey) {
              setEdit(true)
            } else {
              navigate(`/dashboard/action/${action.id}`)
            }
          }}
        >
          {isHover && !edit ? (
            <ShortcutActions handleActions={handleActions} action={action} />
          ) : null}
          {/* Title */}
          <div className="relative text-lg font-medium leading-tight">
            <input
              readOnly={!edit}
              type="text"
              defaultValue={action.title}
              className={`bg-transparent outline-none ${
                !edit ? "cursor-pointer opacity-0" : "opacity-100"
              }`}
              onBlur={(e) => {
                if (e.target.value !== action.title)
                  handleActions({
                    action: "action-update",
                    id: action.id,
                    title: e.target.value,
                  })

                setEdit(() => false)
              }}
            />
            <span
              className={`pointer-events-none absolute left-0 top-0 line-clamp-1 ${
                edit ? "opacity-0 " : "opacity-100"
              }`}
            >
              {action.title}
            </span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <div className="flex items-center gap-2">
              {/* Cliente */}
              {client ? <AvatarClient client={client} /> : null}
              <div>
                <Icons
                  id={
                    categories.find(
                      (category) => category.id === Number(action.category_id)
                    )?.slug
                  }
                  className="w-4"
                />
              </div>
              {action.priority_id === PRIORITY_HIGH ? (
                <div>
                  <Icons id={"high"} className="w-4" type="priority" />
                </div>
              ) : null}
            </div>
            <div className="whitespace-nowrap text-right text-xs">
              {formatActionDatetime({
                date: action.date,
                dateFormat: 2,
                timeFormat: 1,
              })}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuItems
        action={action}
        categories={categories}
        handleActions={handleActions}
        states={states}
        priorities={priorities}
      />
    </ContextMenu>
  )
}

export function ActionGrid({
  action,
  states,
  categories,
  priorities,
}: {
  action: Action
  states: State[]
  categories: Category[]
  priorities: Priority[]
}) {
  const [isHover, setHover] = useState(false)
  const submit = useSubmit()

  const handleActions = (data: { [key: string]: string | number }) => {
    submit(
      { ...data },
      {
        action: "/handle-actions",
        method: "post",
        navigate: false,
      }
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={`flex aspect-square select-none flex-col items-center justify-between rounded-xl p-4 ${
            action.state_id === FINISHED_ID
              ? "bg-gray-900 text-gray-500"
              : "bg-gray-800"
          }`}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {isHover ? (
            <ShortcutActions action={action} handleActions={handleActions} />
          ) : null}
          <div></div>
          <div
            className={`line-clamp-4 py-4 text-center font-medium ${
              action.title.length > 30
                ? "text-sm leading-tight"
                : action.title.length > 18
                  ? "text-lg leading-[1.15] tracking-tight"
                  : "text-2xl leading-none tracking-tight"
            }`}
          >
            {action.title}
          </div>
          <div className="flex items-center justify-center gap-2 leading-none">
            <div
              className={`h-2 w-2 rounded-full bg-${states.find(
                (state) => state.id === Number(action.state_id)
              )?.slug}`}
            ></div>

            <div className="text-[10px] text-gray-400">
              {format(parseISO(action.date), "E, d 'de' MMM", {
                locale: ptBR,
              })}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuItems
        action={action}
        categories={categories}
        handleActions={handleActions}
        states={states}
        priorities={priorities}
      />
    </ContextMenu>
  )
}

export function ListOfActions({
  actions,
  categories,
  states,
  priorities,
  clients,
  showCategory,
  date,
  max,
}: {
  actions?: Action[] | null
  categories: Category[]
  states: State[]
  priorities: Priority[]
  clients?: Client[]
  showCategory?: boolean
  date?: { dateFormat?: 0 | 1 | 2 | 3 | 4; timeFormat?: 0 | 1 }
  max?: 1 | 2 | 3
}) {
  return (
    <div
      className={`@container  min-h-full ${
        max === 2
          ? "grid grid-cols-2"
          : max === 3
            ? "grid grid-cols-3"
            : "flex flex-col"
      }  gap-x-4 gap-y-0.5`}
    >
      {actions?.map((action) => (
        <ActionLine
          key={action.id}
          action={action}
          categories={categories}
          states={states}
          priorities={priorities}
          showCategory={showCategory}
          client={
            clients
              ? clients.find((client) => client.id === action.client_id)
              : undefined
          }
          date={date}
        />
      ))}
    </div>
  )
}

export function BlockOfActions({
  actions,
  categories,
  states,
  priorities,
  clients,
  max,
}: {
  actions?: Action[] | null
  categories: Category[]
  states: State[]
  priorities: Priority[]
  clients: Client[]
  max?: 1 | 2
}) {
  return (
    <div
      className={`grid h-full grid-cols-2 ${
        !max
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
          : max === 2
            ? "grid-cols-2"
            : ""
      } gap-2`}
    >
      {actions?.map((action) => (
        <ActionBlock
          action={action}
          categories={categories}
          states={states}
          key={action.id}
          priorities={priorities}
          client={
            clients
              ? clients.find((client) => client.id === action.client_id)
              : undefined
          }
        />
      ))}
    </div>
  )
}

export function GridOfActions({
  actions,
  categories,
  states,
  priorities,
}: {
  actions?: Action[]
  categories: Category[]
  states: State[]
  priorities: Priority[]
}) {
  return (
    <div className="scrollbars">
      <div className="grid h-full grid-cols-3 place-content-start gap-2">
        {actions?.map((action) => (
          <ActionGrid
            action={action}
            categories={categories}
            states={states}
            key={action.id}
            priorities={priorities}
          />
        ))}
      </div>
    </div>
  )
}

function ShortcutActions({
  action,
  handleActions,
}: {
  action: Action
  handleActions: (data: { [key: string]: string | number }) => void
}) {
  const navigate = useNavigate()

  useEffect(() => {
    const keyDown = async function (event: KeyboardEvent) {
      const key = event.key.toLowerCase()
      if (["i", "f", "z", "t", "a", "c"].find((k) => k === key)) {
        let state_id = 0
        if (key === "i") {
          state_id = 1
        }
        if (key === "f") {
          state_id = 2
        }
        if (key === "z") {
          state_id = 3
        }
        if (key === "a") {
          state_id = 4
        }
        if (key === "t") {
          state_id = 5
        }
        if (key === "c") {
          state_id = 6
        }

        handleActions({
          action: "action-update",
          id: action.id,
          state_id,
        })
      }

      if (key === "e") {
        navigate(`/dashboard/action/${action.id}`)
      }
      if (key === "d") {
        handleActions({
          id: action.id,
          newId: window.crypto.randomUUID(),
          created_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          updated_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          action: "action-duplicate",
        })
      }

      if (key === "x") {
        handleActions({ id: action.id, action: "action-delete" })
      }

      if (key === "1") {
        handleActions({
          id: action.id,
          action: "action-update",
          priority_id: PRIORITY_LOW,
        })
      }
      if (key === "2") {
        handleActions({
          id: action.id,
          action: "action-update",
          priority_id: PRIORITY_MEDIUM,
        })
      }
      if (key === "3") {
        handleActions({
          id: action.id,
          action: "action-update",
          priority_id: PRIORITY_HIGH,
        })
      }
    }
    window.addEventListener("keydown", keyDown)

    return () => window.removeEventListener("keydown", keyDown)
  }, [action, handleActions, navigate])

  return <></>
}

function ContextMenuItems({
  action,
  categories,
  states,
  priorities,
  handleActions,
}: {
  action: Action
  categories: Category[]
  states: State[]
  priorities: Priority[]
  handleActions: (data: { [key: string]: string | number }) => void
}) {
  const navigate = useNavigate()

  return (
    <ContextMenuContent className="bg-content">
      <ContextMenuItem
        className="bg-item flex items-center gap-2 focus:bg-primary"
        onSelect={() => navigate(`/dashboard/action/${action.id}`)}
      >
        <PencilLineIcon className="h-3 w-3" />
        <span>Editar</span>
      </ContextMenuItem>
      <ContextMenuItem className="bg-item flex items-center gap-2 focus:bg-primary">
        <CopyIcon className="h-3 w-3" />
        <span>Duplicar</span>
      </ContextMenuItem>
      {/* Adiar */}
      <ContextMenuSub>
        <ContextMenuSubTrigger className="bg-item flex items-center gap-2 focus:bg-primary">
          <TimerIcon className="h-3 w-3" />
          <span>Adiar</span>
        </ContextMenuSubTrigger>
        <ContextMenuPortal>
          <ContextMenuSubContent className="bg-content">
            {[
              {
                title: "Horas",
                periods: [
                  { time: 1, text: "daqui a 1 hora" },
                  { time: 3, text: "daqui a 3 horas" },
                  { time: 8, text: "daqui a 8 horas" },
                ],
              },
              {
                title: "Dias",
                periods: [
                  { time: 24, text: "1 dia" },
                  { time: 3 * 24, text: "3 dias" },
                ],
              },
              {
                title: "Outros",
                periods: [
                  { time: 7 * 24, text: "1 semana" },
                  { time: 30 * 24, text: "1 mês" },
                ],
              },
            ].map((group, i) => (
              <Fragment key={i}>
                {i > 0 && (
                  <ContextMenuSeparator
                    key={`separator-${i}`}
                    className="bg-gray-300/20"
                  />
                )}
                <ContextMenuLabel className="mx-2" key={`label-${i}`}>
                  {group.title}
                </ContextMenuLabel>
                {group.periods.map((period) => (
                  <ContextMenuItem
                    key={`period-${period.time}`}
                    className="bg-item flex items-center gap-2 focus:bg-primary"
                    onSelect={() => {
                      const date = format(
                        period.time > 20
                          ? addHours(parseISO(action.date), period.time)
                          : addHours(
                              new Date().setHours(
                                parseISO(action.date).getHours(),
                                parseISO(action.date).getMinutes()
                              ),
                              period.time
                            ),
                        "yyyy-MM-dd'T'HH:mm:ss"
                      )

                      handleActions({
                        action: "action-update",
                        id: action.id,
                        date,
                      })
                    }}
                  >
                    {period.text}
                  </ContextMenuItem>
                ))}
              </Fragment>
            ))}
          </ContextMenuSubContent>
        </ContextMenuPortal>
      </ContextMenuSub>
      {/* Deletar */}
      <ContextMenuItem className="bg-item flex items-center gap-2 focus:bg-primary">
        <TrashIcon className="h-3 w-3" />
        <span>Deletar</span>
      </ContextMenuItem>
      <ContextMenuSeparator className="bg-gray-300/20 " />
      {/* Prioridade */}
      <ContextMenuSub>
        <ContextMenuSubTrigger className="bg-item flex items-center gap-2 focus:bg-primary">
          <Icons
            id={
              priorities.find((priority) => priority.id === action.priority_id)
                ?.slug
            }
            className="h-3 w-3"
            type="priority"
          />
          <span>
            {
              priorities.find((priority) => priority.id === action.priority_id)
                ?.title
            }
          </span>
        </ContextMenuSubTrigger>
        <ContextMenuPortal>
          <ContextMenuSubContent className="bg-content">
            {priorities.map((priority) => (
              <ContextMenuItem
                key={priority.id}
                className="bg-item flex items-center gap-2"
                onSelect={() => {
                  handleActions({
                    id: action.id,
                    priority_id: priority.id,
                    action: "action-update",
                  })
                }}
              >
                <Icons id={priority.slug} type="priority" className="h-3 w-3" />
                {priority.title}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuPortal>
      </ContextMenuSub>
      {/* Categoria */}
      <ContextMenuSub>
        <ContextMenuSubTrigger className="bg-item flex items-center gap-2 focus:bg-primary">
          <Icons
            id={
              categories.find((category) => category.id === action.category_id)
                ?.slug
            }
            className="h-3 w-3"
          />
          <span>
            {
              categories.find(
                (category) => category.id === Number(action.category_id)
              )?.title
            }
          </span>
        </ContextMenuSubTrigger>
        <ContextMenuPortal>
          <ContextMenuSubContent className="bg-content">
            {categories.map((category) => (
              <ContextMenuItem
                key={category.id}
                className="bg-item flex items-center gap-2"
                onSelect={() => {
                  handleActions({
                    id: action.id,
                    category_id: category.id,
                    action: "action-update",
                  })
                }}
              >
                <Icons id={category.slug} className="h-3 w-3" />
                {category.title}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuPortal>
      </ContextMenuSub>
      {/* States */}
      <ContextMenuSub>
        <ContextMenuSubTrigger className="bg-item flex items-center gap-2 focus:bg-primary">
          <div
            className={`h-2 w-2 rounded-full border-2 border-${states.find(
              (state) => state.id === Number(action.state_id)
            )?.slug}`}
          ></div>
          <span>
            {
              states.find((state) => state.id === Number(action.state_id))
                ?.title
            }
          </span>
        </ContextMenuSubTrigger>
        <ContextMenuPortal>
          <ContextMenuSubContent className="bg-content">
            {states.map((state) => (
              <ContextMenuItem
                key={state.id}
                className="bg-item flex items-center gap-2 focus:bg-primary"
                onSelect={() => {
                  handleActions({
                    id: action.id,
                    state_id: state.id,
                  })
                }}
              >
                <div
                  className={`h-2 w-2 rounded-full border-2 border-${state?.slug}`}
                ></div>
                <span>{state.title}</span>
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuPortal>
      </ContextMenuSub>
    </ContextMenuContent>
  )
}

export function formatActionDatetime({
  date,
  dateFormat,
  timeFormat,
}: {
  date: Date | string
  dateFormat?: 0 | 1 | 2 | 3 | 4
  timeFormat?: 0 | 1
}) {
  // 0 - Sem informação de data
  // 1 - Distância
  // 2 - Curta
  // 3 - Média
  // 4 - Longa

  // 0 - Sem informação de horas
  // 1 - Com horas

  date = typeof date === "string" ? parseISO(date) : date
  const formatString = (
    dateFormat === 2
      ? `d/M${
          !isSameYear(date.getFullYear(), new Date().getUTCFullYear())
            ? "/yy"
            : ""
        }`
      : dateFormat === 3
        ? `d 'de' MMM${
            !isSameYear(date.getFullYear(), new Date().getUTCFullYear())
              ? " 'de' yy"
              : ""
          }`
        : dateFormat === 4
          ? `E, d 'de' MMMM${
              !isSameYear(date.getFullYear(), new Date().getUTCFullYear())
                ? " 'de' yyy"
                : ""
            }`
          : ""
  ).concat(
    timeFormat
      ? `${dateFormat ? (dateFormat === 4 ? " 'às' " : " - ") : ""}H'h'${
          date.getMinutes() > 0 ? "m" : ""
        }`
      : ""
  )

  return dateFormat === 1
    ? formatDistanceToNow(date, { locale: ptBR, addSuffix: true })
    : format(date, formatString, { locale: ptBR })
}
