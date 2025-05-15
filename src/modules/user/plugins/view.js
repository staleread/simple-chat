import path from 'node:path'
import view from '@fastify/view'
import { Eta } from 'eta'

export default async server => {
  server.register(view, {
    engine: { eta: new Eta() },
    root: path.join(import.meta.dirname, '..', 'views')
  })
}
