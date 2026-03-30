import transmit from '@adonisjs/transmit/services/main'
import Room from '#models/room'
import Participant from '#models/participant'
import type { HttpContext } from '@adonisjs/core/http'

async function getUser(ctx: HttpContext) {
  await ctx.auth.authenticateUsing(['api'])
  return ctx.auth.getUserOrFail()
}

transmit.authorize<{ code: string }>(
  'rooms/:code/events',
  async (ctx: HttpContext, { code }) => {
    let user
    try {
      user = await getUser(ctx)
    } catch {
      return false
    }

    const room = await Room.findBy('code', code)
    if (!room) return false

    const participant = await Participant.query()
      .where('room_id', room.id)
      .where('user_id', user.id)
      .whereIn('status', ['invited', 'joined'])
      .first()

    return !!participant
  }
)

transmit.authorize<{ code: string }>(
  'rooms/:code/signaling',
  async (ctx: HttpContext, { code }) => {
    let user
    try {
      user = await getUser(ctx)
    } catch {
      return false
    }

    const room = await Room.findBy('code', code)
    if (!room) return false

    const participant = await Participant.query()
      .where('room_id', room.id)
      .where('user_id', user.id)
      .where('status', 'joined')
      .first()

    return !!participant
  }
)