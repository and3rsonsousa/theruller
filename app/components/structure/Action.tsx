import { Form, Link, useNavigate, useSubmit } from "@remix-run/react"
import {
  addHours,
  format,
  formatDistanceToNow,
  isSameYear,
  parseISO,
} from "date-fns"

import { ptBR } from "date-fns/locale"
import {
  CopyIcon,
  ExpandIcon,
  PencilLineIcon,
  ShrinkIcon,
  TimerIcon,
  TrashIcon,
} from "lucide-react"
import { Fragment, useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import { FINISHED_ID, INTENTS, PRIORITIES } from "~/lib/constants"
import { AvatarClient, Icons } from "~/lib/helpers"
import { Toggle } from "../ui/Spectrum"
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
  onDrag,
}: {
  action: Action
  categories: Category[]
  states: State[]
  priorities: Priority[]
  showCategory?: boolean
  client?: Client
  date?: { dateFormat?: 0 | 1 | 2 | 3 | 4; timeFormat?: 0 | 1 }
  onDrag?: (action: Action) => void
}) {
  const [edit, setEdit] = useState(false)
  const [isHover, setHover] = useState(false)
  const navigate = useNavigate()

  const submit = useSubmit()

  function handleActions(data: {
    [key: string]: string | number | null | string[]
  }) {
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
          className={`group/action relative flex w-full cursor-pointer select-none items-center justify-between gap-2 overflow-hidden rounded border-l-4 px-2 py-1  text-sm font-medium shadow transition @[180px]:px-4 md:text-xs ${
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
          tabIndex={0}
          onKeyDown={() => {}}
          draggable={!!onDrag}
          onDragEnd={() => {
            if (onDrag) onDrag(action)
          }}
        >
          {/* Atalhos */}
          {isHover && !edit && !edit ? (
            <ShortcutActions action={action} />
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
            {client && <AvatarClient size="xs" client={client} />}
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
                    submit({
                      intent: INTENTS.updateAction,
                      ...action,
                      title: e.target.value,
                      fetcherKey: `action:${action.id}:update:name`,
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
            <div className="shrink grow-0 whitespace-nowrap text-right text-xs text-gray-500 md:text-[10px]">
              {formatActionDatetime({
                date: action.date,
                dateFormat: date.dateFormat,
                timeFormat: date.timeFormat,
              })}
            </div>
          )}
          <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-gray-500 opacity-0 transition group-hover/action:opacity-100"></div>
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
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const submit = useSubmit()
  const [edit, setEdit] = useState(false)
  const [isHover, setHover] = useState(false)

  function handleActions(data: {
    [key: string]: string | number | null | string[]
  }) {
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
          className={`highlight-soft group/action flex w-full flex-col justify-between gap-2 overflow-hidden rounded border-l-4 px-4 py-2 text-sm transition @container border-${states.find(
            (state) => state.id === Number(action.state_id)
          )?.slug} ${
            edit
              ? "bg-gray-800 text-gray-200"
              : "border-white/20 bg-gray-900 from-white/5 hover:bg-gradient-to-b hover:text-gray-200"
          }`}
          onMouseEnter={() => {
            setHover(true)
          }}
          onMouseLeave={() => {
            setHover(false)
          }}
        >
          {isHover && !edit ? <ShortcutActions action={action} /> : null}
          {/* Title */}
          <div className="relative -ml-2 text-lg font-medium leading-tight">
            {edit ? (
              <Form
                method="POST"
                onSubmit={() => {
                  // event.preventDefault()
                  // if (event.currentTarget.value !== action.title) {
                  flushSync(() => {
                    setEdit(false)
                  })
                  buttonRef.current?.focus()
                  // }
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  defaultValue={action.title}
                  className={`rounded-md bg-background px-2 py-1 outline-none ring-1 ring-gray-700`}
                  onBlur={() => {
                    if (
                      inputRef.current?.value !== undefined &&
                      inputRef.current?.value !== action.title
                    )
                      handleActions({
                        intent: INTENTS.updateAction,
                        ...action,
                        title: inputRef.current?.value,
                      })

                    setEdit(() => false)
                  }}
                />
              </Form>
            ) : (
              <button
                ref={buttonRef}
                className={`block w-full overflow-hidden text-ellipsis text-nowrap rounded-md px-2 py-1 text-left outline-none ring-primary focus:ring-2`}
                onClick={() => {
                  flushSync(() => {
                    setEdit(true)
                  })
                  inputRef.current?.select()
                }}
              >
                {action.title}
              </button>
            )}
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
              {action.priority_id === PRIORITIES.high ? (
                <div>
                  <Icons id={"high"} className="w-4" type="priority" />
                </div>
              ) : null}
            </div>
            <div className="whitespace-nowrap text-right text-sm text-gray-500 md:text-xs">
              <span className="@[200px]:hidden">
                {formatActionDatetime({
                  date: action.date,
                  dateFormat: 2,
                  timeFormat: 1,
                })}
              </span>
              <span className="hidden @[200px]:block @[300px]:hidden">
                {formatActionDatetime({
                  date: action.date,
                  dateFormat: 3,
                  timeFormat: 1,
                })}
              </span>
              <span className="hidden @[300px]:block">
                {formatActionDatetime({
                  date: action.date,
                  dateFormat: 4,
                  timeFormat: 1,
                })}
              </span>
            </div>
          </div>
          <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-gray-400 opacity-0 transition group-hover/action:opacity-100"></div>
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

  function handleActions(data: {
    [key: string]: string | number | null | string[]
  }) {
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
          className={`group/action highlight-soft relative flex aspect-square select-none flex-col items-center justify-between rounded-xl from-white/5  p-4 hover:bg-gradient-to-b ${
            action.state_id === FINISHED_ID
              ? "bg-gray-900/50 text-gray-500"
              : "bg-gray-800"
          }`}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {isHover ? <ShortcutActions action={action} /> : null}
          <div></div>
          <div
            className={`line-clamp-4 py-4 text-center font-medium transition group-hover/action:text-gray-300 ${
              action.title.length > 30
                ? "text-sm leading-tight"
                : action.title.length > 18 || action.title.indexOf(" ") === -1
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
          <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-gray-400 opacity-0 transition group-hover/action:opacity-100"></div>
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
  onDrag,
  isFoldable,
}: {
  actions?: Action[] | null
  categories: Category[]
  states: State[]
  priorities: Priority[]
  clients?: Client[]
  showCategory?: boolean
  date?: { dateFormat?: 0 | 1 | 2 | 3 | 4; timeFormat?: 0 | 1 }
  max?: 1 | 2 | 3
  onDrag?: (action: Action) => void
  isFoldable?: boolean
}) {
  const foldCount = (max || 2) * 4
  const [fold, setFold] = useState(isFoldable ? foldCount : undefined)
  return (
    <>
      <div
        className={`min-h-full @container ${
          max === 2
            ? "grid sm:grid-cols-2"
            : max === 3
              ? "grid sm:grid-cols-2 md:grid-cols-3"
              : "flex flex-col"
        }  gap-x-4 gap-y-1`}
      >
        {actions
          ?.slice(0, fold)
          .map((action) => (
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
              onDrag={onDrag}
            />
          ))}
      </div>
      {actions && isFoldable && actions.length > foldCount ? (
        <div className="p-4 text-center">
          <Toggle
            size={"sm"}
            onChange={(isPressed) => {
              console.log({ isPressed })
              setFold(isPressed ? undefined : foldCount)
            }}
          >
            {fold ? (
              <>
                <span>Exibir todos</span>
                <ExpandIcon className="size-4" />
              </>
            ) : (
              <>
                <span>Exibir menos</span>
                <ShrinkIcon className="size-4" />
              </>
            )}
          </Toggle>
        </div>
      ) : null}
    </>
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
      className={`grid h-full ${
        !max ? "sm:grid-cols-3 md:grid-cols-4" : max === 2 ? "grid-cols-2" : ""
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
      <div className="grid h-full grid-cols-3 place-content-start gap-1">
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

function ShortcutActions({ action }: { action: Action }) {
  const navigate = useNavigate()
  const submit = useSubmit()

  function handleActions(data: {
    [key: string]: string | number | null | string[]
  }) {
    submit(
      { ...data },
      {
        action: "/handle-actions",
        method: "post",
        navigate: false,
      }
    )
  }

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
          intent: INTENTS.updateAction,
          ...action,
          state_id,
        })
      } else if (key === "e") {
        navigate(`/dashboard/action/${action.id}`)
      } else if (key === "d") {
        handleActions({
          ...action,
          newId: window.crypto.randomUUID(),
          created_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          updated_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          intent: INTENTS.duplicateAction,
        })
      } else if (key === "x") {
        handleActions({ ...action, intent: INTENTS.deleteAction })
      } else if (key === "1") {
        handleActions({
          ...action,
          intent: INTENTS.updateAction,
          priority_id: PRIORITIES.low,
        })
      } else if (key === "2") {
        handleActions({
          ...action,
          intent: INTENTS.updateAction,
          priority_id: PRIORITIES.medium,
        })
      } else if (key === "3") {
        handleActions({
          ...action,
          intent: INTENTS.updateAction,
          priority_id: PRIORITIES.high,
        })
      } else if (key === "h") {
        const date = parseISO(action.date)
        date.setDate(new Date().getDate())
        date.setHours(new Date().getHours() + 1)

        handleActions({
          ...action,
          intent: INTENTS.updateAction,
          date: format(date, "yyyy-MM-dd HH:mm:ss"),
        })
      }
    }
    window.addEventListener("keydown", keyDown)

    return () => window.removeEventListener("keydown", keyDown)
  }, [action, navigate])

  return <></>
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
  handleActions: (data: {
    [key: string]: string | number | null | string[]
  }) => void
}) {
  // const navigate = useNavigate()

  return (
    <ContextMenuContent className="bg-content">
      <ContextMenuItem
        asChild
        // onSelect={() => navigate(`/dashboard/action/${action.id}`)}
      >
        <Link
          className="bg-item flex items-center gap-2 focus:bg-primary"
          to={`/dashboard/action/${action.id}`}
        >
          <PencilLineIcon className="h-3 w-3" />
          <span>Editar</span>
        </Link>
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
                        intent: INTENTS.updateAction,
                        ...action,
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
                    ...action,
                    priority_id: priority.id,
                    intent: INTENTS.updateAction,
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
                    ...action,
                    category_id: category.id,
                    intent: INTENTS.updateAction,
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
                    ...action,
                    state_id: state.id,
                    intent: INTENTS.updateAction,
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
