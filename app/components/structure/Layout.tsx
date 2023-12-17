import { ReactNode } from "react"
import Header from "./Header"
import CreateAction from "./CreateAction"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div
      className="container relative mx-auto
		 flex flex-col p-0 pt-16 font-light text-gray-300 antialiased md:h-[100dvh] md:overflow-hidden"
    >
      <Header />
      <div className="flex h-full flex-col md:overflow-hidden">{children}</div>
      <CreateAction />
    </div>
  )
}
