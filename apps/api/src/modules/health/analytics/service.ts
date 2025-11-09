import db from '@api/db'
import { attentionFact } from '@api/db/views/attention-facts'

export const getAttentions = async () => {
  return await db.select().from(attentionFact)
}
