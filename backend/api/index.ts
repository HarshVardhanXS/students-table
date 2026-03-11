import type { VercelRequest, VercelResponse } from '@vercel/node'
import express from 'express'
import { createNestApp } from '../src/bootstrap'

let cachedServer: express.Express | null = null

async function getServer() {
  if (cachedServer) return cachedServer
  const server = express()
  const app = await createNestApp(server)
  await app.init()
  cachedServer = server
  return server
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const server = await getServer()
  return server(req, res)
}
