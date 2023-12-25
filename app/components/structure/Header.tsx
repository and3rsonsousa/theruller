import {
  Link,
  useFetchers,
  useMatches,
  useNavigation,
  useOutletContext,
} from "@remix-run/react"
import { ChevronDownIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/ui/avatar"
import { Button } from "../ui/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/ui/dropdown-menu"

export default function Header() {
  const { supabase } = useOutletContext<OutletContextType>()

  const matches = useMatches()
  const navigation = useNavigation()

  const { clients, user } = matches[1].data as DashboardDataType
  const { client } = matches[1].params

  const fetchers = useFetchers()

  return (
    <header className="container fixed left-0 right-0 top-0 z-20 mx-auto flex h-16 flex-shrink-0 flex-grow items-center justify-between bg-background/25 px-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-2">
        <Link to="/dashboard" unstable_viewTransition>
          <img src="/theruller.png" className="w-28" alt="The Ruller" />
        </Link>

        {(navigation.state !== "idle" ||
          fetchers.filter((f) => f.formData).length > 0) && (
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-b-primary/50"></div>
        )}
      </div>
      <div className="flex items-center justify-end gap-2 text-sm font-medium">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="flex items-center gap-2 text-xs font-medium"
            >
              <div className="w-32 overflow-hidden text-ellipsis text-right sm:w-auto">
                {client
                  ? clients.find((c) => c.slug === client)?.title
                  : "Clientes"}
              </div>
              <div>
                <ChevronDownIcon className="w-4" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-content">
            {clients.map((client) => (
              <DropdownMenuItem key={client.id} asChild>
                <Link
                  to={`/dashboard/${client.slug}`}
                  className="bg-item focus:bg-primary"
                >
                  {client.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={user.image} />
              <AvatarFallback>
                {user.name.split(" ")[0][0].concat(user.name.split(" ")[1][0])}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-content">
            <DropdownMenuItem
              onSelect={() => supabase.auth.signOut()}
              className="bg-item focus:bg-primary"
            >
              Sair
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-300/20" />
            <DropdownMenuLabel className="mx-2">Clientes</DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={() => supabase.auth.signOut()}
              className="bg-item focus:bg-primary"
            >
              Ver todos os Clientes
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => supabase.auth.signOut()}
              className="bg-item focus:bg-primary"
            >
              Adicionar novo Cliente
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-300/20" />
            <DropdownMenuLabel className="mx-2">Usuários</DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={() => supabase.auth.signOut()}
              className="bg-item focus:bg-primary"
            >
              Ver todos os Usuários
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => supabase.auth.signOut()}
              className="bg-item focus:bg-primary"
            >
              Adicionar novo Usuário
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="absolute bottom-0 h-[1px] w-full bg-gradient-to-r  from-transparent via-gray-700"></div>
    </header>
  )
}
