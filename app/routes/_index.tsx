import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { LogInIcon } from "lucide-react"
import { Button } from "~/components/ui/ui/button"

export const meta: MetaFunction = () => {
  return [
    { title: "Ruller" },
    { name: "description", content: "Welcome to Ruller!" },
  ]
}

export default function Index() {
  return (
    <div className="grid h-[100dvh] place-content-center text-center">
      <img src="/theruller.png" alt="The Ruller App" className="w-48" />
      <div className="p-4">
        <Button asChild>
          <Link to={`/dashboard`}>
            Entrar
            <LogInIcon className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
