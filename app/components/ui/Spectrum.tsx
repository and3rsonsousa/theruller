import { cva } from "class-variance-authority"
import { ReactNode } from "react"
import {
  ButtonProps,
  Link,
  LinkProps,
  MenuItemProps,
  PopoverProps,
  Button as SpectrumButton,
  Dialog as SpectrumDialog,
  MenuItem as SpectrumMenuItem,
  Modal as SpectrumModal,
  Popover as SpectrumPopover,
  ToggleButton,
  ToggleButtonProps,
} from "react-aria-components"
import { cn } from "~/lib/utils"

type SpectrumLinkType = LinkProps & {
  variant?: "primary" | "default" | "ghost" | null
  size?: "sm" | "md" | "lg" | "icon-sm" | "icon" | "icon-lg" | null
  children?: ReactNode
}

type SpectrumButtonType = ButtonProps & {
  variant?: "primary" | "default" | "ghost" | null
  size?: "sm" | "md" | "lg" | "icon-sm" | "icon" | "icon-lg" | null
  children?: ReactNode
}

type SpectrumToggleType = ToggleButtonProps & {
  size?: "sm" | "md" | "lg" | "icon-sm" | "icon" | "icon-lg" | null
  children?: ReactNode
}

export function SpectrumLink(props: SpectrumLinkType) {
  return (
    <Link
      {...props}
      className={classNames({
        variant: props.variant,
        size: props.size,
        className: props.className,
      })}
    >
      {props.children}
    </Link>
  )
}

export function Button(props: SpectrumButtonType) {
  return (
    <SpectrumButton
      {...props}
      className={classNames({
        variant: props.variant,
        size: props.size,
        className: props.className,
      })}
    >
      {props.children}
    </SpectrumButton>
  )
}

export function Toggle(props: SpectrumToggleType) {
  return (
    <ToggleButton
      {...props}
      className={classNames({
        variant: "ghost",
        size: props.size,
        className: cn([props.className, "highlight-selected"]),
      })}
    >
      {props.children}
    </ToggleButton>
  )
}

export function Modal({
  children,
  open,
  onOpenChange,
}: {
  children: ReactNode
  open?: boolean
  onOpenChange?: (isOpen: boolean) => void
}) {
  return (
    <SpectrumModal
      className={
        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
      }
      onOpenChange={onOpenChange}
      isOpen={open}
      isDismissable={true}
    >
      <SpectrumDialog
        aria-label="search"
        className="max-w-xl rounded-md outline-none sm:w-96"
      >
        {children}
      </SpectrumDialog>
    </SpectrumModal>
  )
}

export function Popover(props: PopoverProps) {
  return (
    <SpectrumPopover
      className={cn(
        "bg-content w-56 origin-top-left overflow-auto rounded-md p-1 fill-mode-forwards entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95",
        props.className
      )}
    >
      {props.children}
    </SpectrumPopover>
  )
}

export function MenuItem(props: MenuItemProps) {
  return (
    <SpectrumMenuItem
      {...props}
      className={cn(
        "bg-item bg-item group box-border flex w-full cursor-default items-center rounded-sm px-3 py-2 text-gray-300 outline-none  focus:bg-primary focus:text-primary-foreground",
        props.className
      )}
    >
      {props.children}
    </SpectrumMenuItem>
  )
}

const classNames = cva(
  "inline-flex highlight text-center font-medium text-white cursor-pointer outline-none items-center bg-gradient-to-b gap-2 transition-all rounded-md bg-[center_bottom] bg-[length:500px_130%] hover:bg-[length:500px_100%] from-white/30 via-transparent  leading-none back pressed:scale-95",
  {
    variants: {
      variant: {
        primary: "pressed:bg-primary/90 button-primary",
        default: "",
        ghost:
          "no-highlight bg-[length:500px_200%] hover:highlight pressed:bg-gray-900",
      },
      size: {
        sm: "px-4 py-3 text-sm",
        md: "px-5 py-4",
        lg: "px-8 py-5 text-xl",
        "icon-sm": "p-0 size-10 inline-grid place-content-center",
        icon: "p-0 size-12 inline-grid place-content-center",
        "icon-lg": "p-0 size-16 inline-grid place-content-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)
