import Room from '#models/room'
import type { HttpContext } from '@adonisjs/core/http'
import config from '@adonisjs/core/services/config'

export default class RoomsController {
    async create({ auth, response }: HttpContext) {

        const hostId = auth.user!.id;

        const generatedCode = await this.generateAlphanumeric()
        const room = await Room.create({ hostId, code: generatedCode })

        return response.created({ room })
    }

    async join({ auth, request, response }: HttpContext) {
        const { code } = request.body()
        const room = await Room.query().where('code', code).first()

        if (!room) {
            return response.notFound({ message: 'Room not found' })
        }

        auth.user!.currentRoomId = room.id
        await auth.user!.save()

        return response.ok({ room })
    }


    private async generateAlphanumeric(): Promise<string> {
        const length = config.get('app.roomCodeLength', 6) as number;

        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            result += charset[randomIndex];
        }
        if ((await Room.query().where('code', result).first())) {
            return this.generateAlphanumeric();
        }
        return result;
    };
}