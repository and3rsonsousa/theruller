import type { MetaFunction } from "@vercel/remix"

import { LogInIcon } from "lucide-react"
import { SpectrumLink } from "~/components/ui/Spectrum"

export const meta: MetaFunction = () => {
  return [
    { title: "Ruller" },
    { name: "description", content: "Welcome to Ruller!" },
  ]
}

export default function Index() {
  return (
    <div className="grid h-dvh place-content-center text-center">
      <img src="/theruller.png" alt="The Ruller App" className="mb-4 w-44" />
      <div className="p-4">
        <SpectrumLink href={`/dashboard`}>
          <span>Entrar</span>
          <LogInIcon className="size-4" />
        </SpectrumLink>
      </div>
    </div>
  )
}
