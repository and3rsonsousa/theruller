import { cva } from "class-variance-authority"
import { Button, ButtonProps, Link, LinkProps } from "react-aria-components"
import { cn } from "~/lib/utils"

export function SpectrumLink(props: LinkProps) {
  return (
    <Link
      {...props}
      className={cn(
        "highlight pressed:highlight-down inline-flex cursor-pointer items-center gap-2 rounded-md px-5 py-3 text-center  outline-none ring-primary ring-offset-2 ring-offset-background transition pressed:scale-95 pressed:bg-primary/50",
        props.className
      )}
    >
      {props.children}
    </Link>
  )
}

export function SpectrumButton(
  props: ButtonProps & {
    variant?: "primary" | "default" | "ghost" | null
    size?: "sm" | "md" | "lg" | "icon" | null
  }
) {
  const classNames = cva(
    "inline-flex highlight text-center font-medium text-white cursor-pointer outline-none items-center bg-gradient-to-b gap-2 transition-all rounded-md bg-[center_bottom] bg-[length:500px_130%] hover:bg-[length:500px_100%] from-white/30 via-transparent  leading-none back pressed:scale-95",
    {
      variants: {
        variant: {
          primary: "pressed:bg-primary/90 button-primary",
          default: "",
          ghost: "no-highlight hover:highlight pressed:bg-gray-900",
        },
        size: {
          sm: "px-4 py-3 text-sm ",
          md: "px-5 py-4",
          lg: "px-8 py-5 text-xl",
          icon: "p-0 size-12 inline-grid place-content-center",
        },
      },
      defaultVariants: {
        variant: "default",
        size: "md",
      },
    }
  )

  return (
    <Button
      {...props}
      className={classNames({
        variant: props.variant,
        size: props.size,
        className: props.className,
      })}
    >
      {props.children}
    </Button>
  )
}
