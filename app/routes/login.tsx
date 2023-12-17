import { ActionFunctionArgs, redirect } from "@remix-run/node"
import { useActionData } from "@remix-run/react"
import { AlertCircleIcon, LogInIcon } from "lucide-react"
import { Button } from "~/components/ui/ui/button"
import { Input } from "~/components/ui/ui/input"
import { Label } from "~/components/ui/ui/label"
import { SupabaseServerClient } from "~/lib/supabase"

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { supabase, headers } = await SupabaseServerClient({ request })

  const {
    data: { user },
  } = await supabase.auth.signInWithPassword({ email, password })

  if (user) {
    return redirect("/dashboard", {
      headers,
    })
  } else {
    return { errors: { email: "Verifique o email ou a senha usada." } }
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>()
  return (
    <div className="grid h-[100dvh] place-content-center ">
      <div className="w-full p-8 sm:w-80">
        <img src="rul-ler.png" alt="" className="mb-8 w-20" />
        {actionData && (
          <div className="my-8 flex gap-4 rounded-lg bg-rose-900 p-4 leading-none text-orange-100">
            <AlertCircleIcon className="h-8 w-8" />
            <div>{actionData.errors.email}</div>
          </div>
        )}
        <form className="" method="post">
          <Label className="mb-4 block w-full">
            <span className="mb-2 block w-full font-bold">E-mail</span>

            <Input name="email" />
          </Label>
          <Label className="mb-4 block w-full">
            <span className="mb-2 block w-full font-bold">Senha</span>

            <Input type="password" name="password" />
          </Label>

          <div className="flex justify-end">
            <Button type="submit">
              Fazer Login <LogInIcon className="ml-2 h-4 w-4" />{" "}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
