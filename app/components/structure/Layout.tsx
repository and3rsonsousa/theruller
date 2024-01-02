import { ReactNode, useLayoutEffect, useState } from "react"
import {
  ComboBox,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
} from "react-aria-components"
import { Modal } from "../ui/Spectrum"
import CreateAction from "./CreateAction"
import Header from "./Header"

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  useLayoutEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === "k") {
        setOpen(true)
      }
    }

    document.addEventListener("keydown", keyDown)

    return () => document.removeEventListener("keydown", keyDown)
  }, [])
  return (
    <div
      className="container relative mx-auto
		 flex h-[100dvh] flex-col font-light text-gray-300 antialiased md:overflow-hidden"
    >
      <Header />
      <div className="flex h-full flex-col overflow-hidden">{children}</div>
      <CreateAction />
      <Modal open={open} onOpenChange={setOpen}>
        <ComboBox className="relative rounded-md" aria-label="Search">
          <Input
            className={`w-full rounded-md bg-background/50 px-6 py-4 text-xl font-light antialiased outline-none ring-1 ring-white/10 backdrop-blur-xl `}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Popover className="top-0 -mt-1 w-[--trigger-width] rounded-md bg-background/50 p-2 ring-1 ring-white/10 backdrop-blur-xl entering:animate-in entering:slide-out-to-bottom-2">
            <ListBox>
              {["Lorem", "Ipsum", "dolor"].map((item) => (
                <ListBoxItem
                  className="rounded-sm px-4 py-2 text-sm font-medium text-gray-500 transition focus:bg-primary focus:text-primary-foreground"
                  key={item}
                >
                  {item}
                </ListBoxItem>
              ))}
            </ListBox>
          </Popover>
        </ComboBox>
      </Modal>
    </div>
  )
}
