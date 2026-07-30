import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { ReservationsController } from './reservations.controller';

function mockFunction() {
  const calls: unknown[][] = [];
  let result: unknown;

  const fn = async (...args: unknown[]) => {
    calls.push(args);

    return result;
  };

  fn.calls = calls;
  fn.mockResolvedValue = (value: unknown) => {
    result = value;
  };

  return fn;
}

function createController() {
  const reservationsService = {
    findAll: mockFunction(),
    findUpcoming: mockFunction(),
    findOne: mockFunction(),
    create: mockFunction(),
    update: mockFunction(),
    cancel: mockFunction(),
    confirm: mockFunction(),
    attend: mockFunction(),
    noShow: mockFunction(),
  };
  const controller = new ReservationsController(reservationsService as never);

  return {
    controller,
    reservationsService,
  };
}

describe('ReservationsController', () => {
  it('findUpcoming delega al servicio y devuelve su resultado', async () => {
    const { controller, reservationsService } = createController();
    const query = {
      limit: 10,
      includeFuture: false,
    };
    const upcomingReservations = [
      {
        id: 'reservation-id',
        experienceId: 'experience-id',
        experience: {
          id: 'experience-id',
          name: 'Degustacion',
        },
      },
    ];
    reservationsService.findUpcoming.mockResolvedValue(upcomingReservations);

    const result = await controller.findUpcoming(query);

    assert.deepEqual(reservationsService.findUpcoming.calls[0], [query]);
    assert.deepEqual(result, upcomingReservations);
  });
});
