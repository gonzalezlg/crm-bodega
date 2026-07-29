import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReservationStatus } from '@prisma/client';
import { ReservationsService } from './reservations.service';

type MockFunction = ReturnType<typeof mockFunction>;

type TransactionMock = {
  experience: {
    findUnique: MockFunction;
  };
  reservation: {
    aggregate: MockFunction;
    create: MockFunction;
  };
};

type PrismaMock = {
  tx: TransactionMock;
  $transaction: MockFunction;
};

type AvailabilityMock = {
  getAvailability: MockFunction;
};

const baseDto = {
  experienceId: 'd1d7f5f8-cc96-430f-b8bb-29fb5a3927ad',
  date: '2026-08-02',
  startTime: '10:00',
  peopleCount: 4,
  notes: 'Llegan 10 minutos antes',
};

const fixedNow = new Date('2026-08-01T18:00:00.000Z');

function mockFunction() {
  const calls: unknown[][] = [];
  const queuedResults: unknown[] = [];
  let result: unknown;

  const fn = async (...args: unknown[]) => {
    calls.push(args);

    if (queuedResults.length > 0) {
      const queuedResult = queuedResults.shift();

      if (queuedResult instanceof Error) {
        throw queuedResult;
      }

      return queuedResult;
    }

    return result;
  };

  fn.calls = calls;
  fn.mockResolvedValue = (value: unknown) => {
    result = value;
  };
  fn.mockResolvedValueOnce = (value: unknown) => {
    queuedResults.push(value);
  };
  fn.mockRejectedValueOnce = (value: Error) => {
    queuedResults.push(value);
  };

  return fn;
}

function createPrismaKnownError(code: string) {
  return new Prisma.PrismaClientKnownRequestError('Prisma error', {
    code,
    clientVersion: 'test',
  });
}

function createTransactionMock(): TransactionMock {
  const tx = {
    experience: {
      findUnique: mockFunction(),
    },
    reservation: {
      aggregate: mockFunction(),
      create: mockFunction(),
    },
  };

  tx.experience.findUnique.mockResolvedValue({
    id: baseDto.experienceId,
    active: true,
  });
  tx.reservation.aggregate.mockResolvedValue({
    _sum: {
      peopleCount: 0,
    },
  });
  tx.reservation.create.mockResolvedValue({
    id: 'reservation-id',
    ...baseDto,
    date: new Date(`${baseDto.date}T00:00:00.000Z`),
    status: ReservationStatus.PENDING,
    createdAt: new Date('2026-08-01T18:01:00.000Z'),
    updatedAt: new Date('2026-08-01T18:01:00.000Z'),
  });

  return tx;
}

function createService() {
  const tx = createTransactionMock();
  const prisma = {
    tx,
    $transaction: mockFunction(),
  };
  const availabilityService = {
    getAvailability: mockFunction(),
  };

  prisma.$transaction.mockResolvedValue(undefined);
  prisma.$transaction = Object.assign(
    async (
      callback: (transactionClient: TransactionMock) => Promise<unknown>,
      options: unknown,
    ) => {
      prisma.$transaction.calls.push([callback, options]);
      return callback(tx);
    },
    prisma.$transaction,
  );
  availabilityService.getAvailability.mockResolvedValue({
    experienceId: baseDto.experienceId,
    date: baseDto.date,
    slots: [
      {
        startTime: baseDto.startTime,
        capacity: 10,
        available: 10,
      },
    ],
  });

  const service = new ReservationsService(
    prisma as never,
    availabilityService as never,
  );
  (service as unknown as { getCurrentDate: () => Date }).getCurrentDate = () =>
    fixedNow;

  return {
    service,
    prisma: prisma as PrismaMock,
    tx,
    availabilityService: availabilityService as AvailabilityMock,
  };
}

describe('ReservationsService', () => {
  it('crea una reserva valida', async () => {
    const { service } = createService();

    const result = await service.create(baseDto);

    assert.equal(result.id, 'reservation-id');
  });

  it('crea la reserva con estado PENDING', async () => {
    const { service, tx } = createService();

    await service.create(baseDto);

    assert.equal(
      (tx.reservation.create.calls[0][0] as { data: { status: string } }).data
        .status,
      ReservationStatus.PENDING,
    );
  });

  it('rechaza una experiencia inexistente', async () => {
    const { service, tx } = createService();
    tx.experience.findUnique.mockResolvedValue(null);

    await assert.rejects(() => service.create(baseDto), NotFoundException);
  });

  it('rechaza una experiencia inactiva', async () => {
    const { service, tx } = createService();
    tx.experience.findUnique.mockResolvedValue({
      id: baseDto.experienceId,
      active: false,
    });

    await assert.rejects(() => service.create(baseDto), BadRequestException);
  });

  it('rechaza una fecha pasada', async () => {
    const { service } = createService();

    await assert.rejects(
      () =>
        service.create({
          ...baseDto,
          date: '2026-07-31',
        }),
      BadRequestException,
    );
  });

  it('rechaza una fecha superior a 45 dias', async () => {
    const { service } = createService();

    await assert.rejects(
      () =>
        service.create({
          ...baseDto,
          date: '2026-09-16',
        }),
      BadRequestException,
    );
  });

  it('permite exactamente el dia limite de 45 dias', async () => {
    const { service } = createService();

    const result = await service.create({
      ...baseDto,
      date: '2026-09-15',
    });

    assert.equal(result.id, 'reservation-id');
  });

  it('rechaza una reserva para hoy con menos de 60 minutos', async () => {
    const { service } = createService();

    await assert.rejects(
      () =>
        service.create({
          ...baseDto,
          date: '2026-08-01',
          startTime: '15:59',
        }),
      BadRequestException,
    );
  });

  it('usa MIN_RESERVATION_NOTICE_MINUTES en el mensaje de anticipacion minima', async () => {
    const previousNotice = process.env.MIN_RESERVATION_NOTICE_MINUTES;
    process.env.MIN_RESERVATION_NOTICE_MINUTES = '120';
    const { service } = createService();

    try {
      await assert.rejects(
        () =>
          service.create({
            ...baseDto,
            date: '2026-08-01',
            startTime: '16:59',
          }),
        (error: unknown) => {
          assert.ok(error instanceof BadRequestException);
          assert.equal(
            error.message,
            'La reserva debe realizarse con al menos 120 minutos de anticipación.',
          );
          return true;
        },
      );
    } finally {
      if (previousNotice === undefined) {
        delete process.env.MIN_RESERVATION_NOTICE_MINUTES;
      } else {
        process.env.MIN_RESERVATION_NOTICE_MINUTES = previousNotice;
      }
    }
  });

  it('permite una reserva para hoy con exactamente 60 minutos', async () => {
    const { service, availabilityService } = createService();
    availabilityService.getAvailability.mockResolvedValue({
      experienceId: baseDto.experienceId,
      date: '2026-08-01',
      slots: [
        {
          startTime: '16:00',
          capacity: 10,
          available: 10,
        },
      ],
    });

    const result = await service.create({
      ...baseDto,
      date: '2026-08-01',
      startTime: '16:00',
    });

    assert.equal(result.id, 'reservation-id');
  });

  it('rechaza un horario que no existe en la disponibilidad', async () => {
    const { service, availabilityService } = createService();
    availabilityService.getAvailability.mockResolvedValue({
      experienceId: baseDto.experienceId,
      date: baseDto.date,
      slots: [],
    });

    await assert.rejects(() => service.create(baseDto), BadRequestException);
  });

  it('rechaza capacidad insuficiente', async () => {
    const { service, tx } = createService();
    tx.reservation.aggregate.mockResolvedValue({
      _sum: {
        peopleCount: 7,
      },
    });

    await assert.rejects(
      () =>
        service.create({
          ...baseDto,
          peopleCount: 4,
        }),
      ConflictException,
    );
  });

  it('excluye reservas CANCELLED del calculo', async () => {
    const { service, tx } = createService();

    await service.create(baseDto);

    const where = (tx.reservation.aggregate.calls[0][0] as { where: unknown })
      .where;

    assert.deepEqual(where, {
      experienceId: baseDto.experienceId,
      date: new Date(`${baseDto.date}T00:00:00.000Z`),
      startTime: baseDto.startTime,
      status: {
        not: ReservationStatus.CANCELLED,
      },
    });
  });

  it('incluye PENDING, CONFIRMED, ATTENDED y NO_SHOW en el calculo', async () => {
    const { service, tx } = createService();

    await service.create(baseDto);

    const where = (
      tx.reservation.aggregate.calls[0][0] as {
        where: { status: { not: ReservationStatus } };
      }
    ).where;

    assert.equal(where.status.not, ReservationStatus.CANCELLED);
  });

  it('crea varias reservas para el mismo horario si todavia existe capacidad', async () => {
    const { service, tx } = createService();
    tx.reservation.aggregate.mockResolvedValue({
      _sum: {
        peopleCount: 4,
      },
    });

    const result = await service.create({
      ...baseDto,
      peopleCount: 6,
    });

    assert.equal(result.id, 'reservation-id');
  });

  it('utiliza transaccion Serializable', async () => {
    const { service, prisma } = createService();

    await service.create(baseDto);

    assert.deepEqual(prisma.$transaction.calls[0][1], {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it('reintenta ante error P2034', async () => {
    const { service, prisma, tx } = createService();
    let attempts = 0;
    prisma.$transaction = Object.assign(
      async (
        callback: (transactionClient: TransactionMock) => Promise<unknown>,
        options: unknown,
      ) => {
        prisma.$transaction.calls.push([callback, options]);
        attempts += 1;

        if (attempts === 1) {
          throw createPrismaKnownError('P2034');
        }

        return callback(tx);
      },
      prisma.$transaction,
    );

    await service.create(baseDto);

    assert.equal(prisma.$transaction.calls.length, 2);
  });

  it('deja de reintentar despues de 3 intentos', async () => {
    const { service, prisma } = createService();
    prisma.$transaction = Object.assign(
      async (_callback: unknown, options: unknown) => {
        prisma.$transaction.calls.push([_callback, options]);
        throw createPrismaKnownError('P2034');
      },
      prisma.$transaction,
    );

    await assert.rejects(() => service.create(baseDto), ConflictException);
    assert.equal(prisma.$transaction.calls.length, 3);
  });

  it('no reintenta errores distintos de P2034', async () => {
    const { service, prisma } = createService();
    prisma.$transaction = Object.assign(
      async (_callback: unknown, options: unknown) => {
        prisma.$transaction.calls.push([_callback, options]);
        throw createPrismaKnownError('P2002');
      },
      prisma.$transaction,
    );

    await assert.rejects(
      () => service.create(baseDto),
      Prisma.PrismaClientKnownRequestError,
    );
    assert.equal(prisma.$transaction.calls.length, 1);
  });

  it('utiliza el cliente transaccional al consultar AvailabilityService', async () => {
    const { service, tx, availabilityService } = createService();

    await service.create(baseDto);

    assert.equal(availabilityService.getAvailability.calls[0][2], tx);
  });

  it('no crea la reserva si falla una validacion', async () => {
    const { service, tx } = createService();

    await assert.rejects(
      () =>
        service.create({
          ...baseDto,
          date: '2026-07-31',
        }),
      BadRequestException,
    );
    assert.equal(tx.reservation.create.calls.length, 0);
  });
});
