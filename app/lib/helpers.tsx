import { isAfter, isBefore, isToday, parseISO } from "date-fns"
import {
  CircleDashedIcon,
  Code2Icon,
  ComponentIcon,
  DollarSignIcon,
  ImageIcon,
  ListChecksIcon,
  LucideIcon,
  MegaphoneIcon,
  PenToolIcon,
  PlayIcon,
  PrinterIcon,
  SignalIcon,
  SignalLowIcon,
  SignalMediumIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"
import { CSSProperties } from "react"
import { Avatar, AvatarFallback } from "~/components/ui/ui/avatar"
import {
  FINISHED_ID,
  POST_ID,
  PRIORITY_HIGH,
  PRIORITY_LOW,
  PRIORITY_MEDIUM,
  VIDEO_ID,
} from "./constants"
import { cn } from "./utils"
import { Fetcher } from "@remix-run/react"

export function ShortText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const length = text.length
  return (
    <div
      className={cn(
        `text-center font-bold uppercase leading-none tracking-wide`,
        className
      )}
    >
      {length > 4 ? (
        <div className="scale-[0.65]">
          <div> {text.substring(0, Math.ceil(length / 2))} </div>
          <div> {text.substring(Math.ceil(length / 2))} </div>
        </div>
      ) : length === 4 ? (
        <div className="scale-[0.75]">
          <div> {text.substring(0, Math.ceil(length / 2))} </div>
          <div> {text.substring(Math.ceil(length / 2))} </div>
        </div>
      ) : (
        <div className="scale-[0.75]">{text}</div>
      )}
    </div>
  )
}

export function AvatarClient({
  client,
  size = "sm",
  style,
}: {
  client: Client
  size?: "xs" | "sm" | "md" | "lg"
  style?: CSSProperties
}) {
  return (
    <Avatar
      className={
        size === "xs"
          ? "h-4 w-4"
          : size === "sm"
            ? "h-6 w-6"
            : size === "md"
              ? "h-8 w-8"
              : "h-12 w-12"
      }
      style={style}
    >
      <AvatarFallback
        style={{
          backgroundColor: client.bgColor || "#999",
          color: client.fgColor || "#333",
        }}
      >
        <ShortText
          text={size === "xs" ? client.short[0] : client.short}
          className={
            size === "sm"
              ? "scale-[0.7]"
              : size === "md"
                ? "scale-[0.8]"
                : "scale-[1.3]"
          }
        />
      </AvatarFallback>
    </Avatar>
  )
}

export function sortActions(actions?: Action[] | null) {
  return actions
    ?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .sort((a, b) => Number(b.state_id) - Number(a.state_id))
}

export function getLateActions({
  actions,
  priority,
}: {
  actions?: Action[] | null
  priority?: PRIORITIES
}) {
  priority = priority
    ? ({ low: PRIORITY_LOW, mid: PRIORITY_MEDIUM, high: PRIORITY_HIGH }[
        priority
      ] as PRIORITIES)
    : undefined

  return sortActions(
    actions?.filter(
      (action) =>
        isBefore(parseISO(action.date), new Date()) &&
        action.state_id !== FINISHED_ID &&
        (priority ? action.priority_id === priority : true)
    )
  )
}

export function getNotFinishedActions({
  actions,
}: {
  actions?: Action[] | null
}) {
  return actions?.filter(
    (action) =>
      isAfter(parseISO(action.date), new Date()) &&
      action.state_id !== FINISHED_ID
  )
}

export function getUrgentActions(actions: Action[] | null) {
  return actions?.filter(
    (action) =>
      action.priority_id === PRIORITY_HIGH && action.state_id !== FINISHED_ID
  )
}

export function getTodayActions({
  actions,
  finished,
}: {
  actions?: Action[] | null
  finished?: boolean
}) {
  return actions?.filter(
    (action) =>
      isToday(parseISO(action.date)) &&
      (finished || action.state_id !== FINISHED_ID)
  )
}

export function getInstagramActions({
  actions,
}: {
  actions?: Action[] | null
}) {
  return actions?.filter((action) =>
    [POST_ID, VIDEO_ID].includes(Number(action.category_id))
  )
}
const iconsList: { [key: string]: LucideIcon } = {
  all: ComponentIcon,
  post: ImageIcon,
  video: PlayIcon,
  stories: CircleDashedIcon,
  todo: ListChecksIcon,
  finance: DollarSignIcon,
  print: PrinterIcon,
  meeting: UsersIcon,
  dev: Code2Icon,
  design: PenToolIcon,
  ads: MegaphoneIcon,
  low: SignalLowIcon,
  mid: SignalMediumIcon,
  high: SignalIcon,
  base: SignalIcon,
}

export const Icons = ({
  id,
  className,
  type = "category",
}: {
  id?: string
  className?: string
  type?: "category" | "priority"
}) => {
  const View = iconsList[id as string] ?? XIcon

  return type === "category" ? (
    <View className={cn(className)} />
  ) : (
    <div className="relative">
      <SignalIcon
        className={cn(["absolute left-0 top-0 z-0 opacity-20", className])}
      />
      <View
        className={cn([
          "isolate",
          id === "low"
            ? "text-green-400"
            : id === "mid"
              ? "text-amber-500"
              : "text-rose-600",
          className,
        ])}
      />
    </div>
  )
}

export function convertToAction(data: { [key: string]: unknown }): Action {
  const action: Action = {
    category_id: Number(data["category_id"]),
    client_id: Number(data["client_id"]),
    created_at: String(data["created_at"]),
    date: String(data["date"]),
    description: String(data["description"]),
    id: String(data["id"]),
    priority_id: String(data["priority_id"]),
    responsibles: String(data["responsibles"]).split(","),
    state_id: Number(data["state_id"]),
    title: String(data["title"]),
    updated_at: String(data["updated_at"]),
    user_id: String(data["user_id"]),
  }
  return action
}

export function getOptimisticActions({
  actions,
  fetchers,
}: {
  actions?: Action[] | null
  fetchers: (Fetcher & { key: string })[]
}): Action[] {
  return fetchers?.reduce<Action[]>((memo, fetcher) => {
    if (fetcher.formData) {
      const data = Object.fromEntries(fetcher.formData)

      if (data.action === "action-update") {
        const actionIndex = actions?.findIndex(
          (action) => action.id === data.id
        )

        const action: Action = { ...actions![actionIndex!], ...data }
        actions?.splice(actionIndex!, 1, action)
      } else if (data.action === "action-create") {
        if (actions?.find((action) => action.id !== data.id))
          memo.push(convertToAction(data))
      } else if (data.action === "action-delete") {
        const actionIndex = actions?.findIndex(
          (action) => action.id === data.id
        )
        actions?.splice(actionIndex!, 1)
      }
    }
    return memo
  }, [])
}
