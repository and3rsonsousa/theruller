import { ReactNode } from "react"
import Header from "./Header"
import CreateAction from "./CreateAction"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div
      className="container relative mx-auto
		 flex h-[100dvh] flex-col font-light text-gray-300 antialiased md:overflow-hidden"
    >
      <Header />
      <div className="flex h-full flex-col overflow-hidden">{children}</div>
      <CreateAction />
    </div>
  )
}
