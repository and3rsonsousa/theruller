/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-autofocus */
import { ActionFunctionArgs, redirect } from "@remix-run/node"
import { Form, useMatches } from "@remix-run/react"
import { Button } from "~/components/ui/Spectrum"
import { Checkbox } from "~/components/ui/ui/checkbox"
import { Input } from "~/components/ui/ui/input"
import { Label } from "~/components/ui/ui/label"
import { ScrollArea } from "~/components/ui/ui/scroll-area"
import { SupabaseServerClient } from "~/lib/supabase"

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = SupabaseServerClient({ request })

  const formData = await request.formData()

  const data = {
    title: String(formData.get("title")),
    short: String(formData.get("short")),
    slug: String(formData.get("slug")),
    bgColor: String(formData.get("bgColor")),
    fgColor: String(formData.get("fgColor")),
    user_ids: String(formData.getAll("user_id")).split(","),
  }

  const { data: client, error } = await supabase
    .from("clients")
    .insert(data)
    .select()
    .single()

  if (client) {
    return redirect(`/dashboard/${client.slug}`)
  } else {
    console.log(error)
  }

  return { ok: true }
}

export default function NewClients() {
  const matches = useMatches()

  const { people } = matches[1].data as DashboardDataType

  return (
    <div className="overflow-hidden">
      <ScrollArea className="h-full w-full">
        <div className="pt-16"></div>
        <div className="px-4 md:px-8">
          <div className="gap-2 rounded py-4 text-center text-2xl font-medium">
            Novo cliente
          </div>
          <Form className="mx-auto max-w-md" method="post">
            <div className="mb-4">
              <Label className="mb-2 block">Nome</Label>
              <Input name="title" type="text" tabIndex={0} autoFocus />
            </div>
            <div className="mb-4">
              <Label className="mb-2 block">Slug</Label>
              <Input name="slug" />
            </div>
            <div className="mb-4">
              <Label className="mb-2 block">Short</Label>
              <Input name="short" />
            </div>
            <div className="mb-4">
              <Label className="mb-2 block">Usuários</Label>

              {people.map((person) => (
                <div key={person.id} className="mb-2 flex gap-4">
                  <Checkbox value={person.user_id} name="user_id">
                    {person.name}
                  </Checkbox>
                  <Label>{person.name}</Label>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <Label className="mb-2 block">Background Color</Label>
              <Input defaultValue={"#ffffff"} name="bgColor" type="color" />
            </div>
            <div className="mb-4">
              <Label className="mb-2 block">Foreground Color</Label>
              <Input defaultValue={"#000000"} name="fgColor" type="color" />
            </div>
            <div className="mb-4 text-right">
              <Button type="submit">Adicionar</Button>
            </div>
          </Form>
        </div>
      </ScrollArea>
    </div>
  )
}
