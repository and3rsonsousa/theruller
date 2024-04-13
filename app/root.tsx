import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react"

import { json } from "@vercel/remix"
import "./index.css"
import { createBrowserClient } from "@supabase/ssr"

export async function loader() {
  return json(
    {
      env: {
        SUPABASE_URL: process.env.SUPABASE_URL!,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
      },
    },
    200
  )
}

export default function App() {
  const { env } = useLoaderData<typeof loader>()

  const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)

  return (
    <html lang="pt-br" className="dark font-inter antialiased">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.png" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={{ supabase }} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
