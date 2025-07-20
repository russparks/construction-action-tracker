import { prisma } from '../../../lib/db'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'PUT') {
    try {
      const action = await prisma.action.update({
        where: { id: parseInt(id) },
        data: req.body
      })
      res.status(200).json(action)
    } catch (error) {
      res.status(500).json({ error: 'Failed to update action' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.action.delete({
        where: { id: parseInt(id) }
      })
      res.status(200).json({ message: 'Action deleted' })
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete action' })
    }
  }
}
