import { prisma } from '../../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const actions = await prisma.action.findMany({
        orderBy: { createdAt: 'desc' }
      })
      res.status(200).json(actions)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch actions' })
    }
  }

  if (req.method === 'POST') {
    try {
      const action = await prisma.action.create({
        data: req.body
      })
      res.status(201).json(action)
    } catch (error) {
      res.status(500).json({ error: 'Failed to create action' })
    }
  }
}
