/* eslint-disable jsx-a11y/no-autofocus */
import { useEffect, useState } from "react"
import {
  ComboBox,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
} from "react-aria-components"
import { useDebounce } from "use-debounce"
import { Modal } from "../ui/Spectrum"
import { useMatches } from "@remix-run/react"
import { createBrowserClient } from "@supabase/ssr"

export default function Search() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [query] = useDebounce(value, 500)
  const [items, setItems] = useState<{ actions: Action[] }>()
  const matches = useMatches()

  const { env } = matches[0].data as {
    env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string }
  }

  const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === "k") {
        setOpen(true)
      }
    }

    document.addEventListener("keydown", keyDown)

    return () => document.removeEventListener("keydown", keyDown)
  }, [])

  useEffect(() => {
    if (query.length > 2) {
      console.log(query)
      supabase
        .rpc("search_for_actions", { query: `%${query}%` })
        .select("*")
        .then((value) => {
          setItems({ actions: value.data as Action[] })
        })
    }
  }, [query, supabase])

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ComboBox className="relative rounded-md" aria-label="Search">
        <Input
          className={`w-full rounded-md bg-background/50 px-6 py-4 text-xl font-light antialiased outline-none ring-2 ring-primary backdrop-blur-xl `}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoFocus={true}
        />

        <pre>{JSON.stringify(items)}</pre>

        <Popover className="top-0 -mt-1 w-[--trigger-width] rounded-md bg-background/50 p-2 ring-1 ring-white/10 backdrop-blur-xl entering:animate-in entering:slide-out-to-bottom-2">
          <ListBox>
            {items?.actions.map((action) => (
              <ListBoxItem
                className="rounded-sm px-4 py-2 text-sm font-medium text-gray-500 transition focus:bg-primary focus:text-primary-foreground"
                key={action.id}
              >
                {action.title}
              </ListBoxItem>
            ))}
          </ListBox>
        </Popover>
      </ComboBox>
    </Modal>
  )
}
