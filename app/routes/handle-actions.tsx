import { ActionFunctionArgs, json } from "@remix-run/node"
import { format } from "date-fns"
import { INTENTS, PRIORITIES } from "~/lib/constants"
import { SupabaseServerClient } from "~/lib/supabase"

export const action = async ({ request }: ActionFunctionArgs) => {
  const { headers, supabase } = SupabaseServerClient({ request })

  const formData = await request.formData()
  const { intent, id, ...values } = Object.fromEntries(formData.entries())

  if (!intent) throw new Error("No intent was defined")

  if (intent === INTENTS.createAction) {
    const actionToInsert = {
      id: id.toString(),
      category_id: Number(values["category_id"]),
      state_id: Number(values["state_id"]),
      client_id: Number(values["client_id"]),
      date: values["date"].toString(),
      description: values["description"].toString(),
      title: values["title"].toString(),
      responsibles: values["responsibles"].toString().split(","),
      user_id: values["user_id"].toString(),
      priority_id: PRIORITIES.medium,
    }

    const { data, error } = await supabase
      .from("actions")
      .insert(actionToInsert)
      .select()
      .single()

    return json({ data, error }, { headers })
  } else if (intent === INTENTS.updateAction) {
    if (values["responsibles"]) {
      const { data, error } = await supabase
        .from("actions")
        .update({
          ...values,
          responsibles: values["responsibles"].toString().split(","),
          updated_at: format(Date.now(), "yyyy-MM-dd'T'HH:mm:ss'+03:00:00'"),
        })
        .eq("id", id)
      return { data, error }
    } else {
      const { data, error } = await supabase
        .from("actions")
        .update({
          ...values,
          updated_at: format(Date.now(), "yyyy-MM-dd'T'HH:mm:ss'+03:00:00'"),
        })
        .eq("id", id)

      return { data, error }
    }
  } else if (intent === INTENTS.duplicateAction) {
    const { data: oldAction } = await supabase
      .from("actions")
      .select("*")
      .eq("id", id)
      .single()
    if (oldAction) {
      const newId = values["newId"].toString()
      const created_at = values["created_at"].toString()
      const updated_at = values["updated_at"].toString()
      const { data: newAction, error } = await supabase
        .from("actions")
        .insert({
          ...oldAction,
          id: newId,
          created_at,
          updated_at,
        })
        .select()
        .single()

      return { newAction, error }
    }
  } else if (intent === INTENTS.deleteAction) {
    const data = await supabase.from("actions").delete().eq("id", id)

    return { data }
  }

  return {}
}
