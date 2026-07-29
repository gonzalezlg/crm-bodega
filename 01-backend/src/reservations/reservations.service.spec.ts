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
    findUnique: MockFunction;
    aggregate: MockFunction;
    create: MockFunction;
    update: MockFunction;
  };
};

type PrismaMock = {
  reservation: TransactionMock['reservation'];
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

const baseReservation = {
  id: 'reservation-id',
  experienceId: baseDto.experienceId,
  date: new Date(`${baseDto.date}T00:00:00.000Z`),
  startTime: baseDto.startTime,
  peopleCount: baseDto.peopleCount,
  status: ReservationStatus.PENDING,
  notes: baseDto.notes,
  createdAt: new Date('2026-08-01T18:01:00.000Z'),
  updatedAt: new Date('2026-08-01T18:01:00.000Z'),
};

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
      findUnique: mockFunction(),
      aggregate: mockFunction(),
      create: mockFunction(),
      update: mockFunction(),
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
  tx.reservation.findUnique.mockResolvedValue(baseReservation);
  tx.reservation.create.mockResolvedValue(baseReservation);
  tx.reservation.update.mockResolvedValue({
    ...baseReservation,
    status: ReservationStatus.CANCELLED,
    updatedAt: new Date('2026-08-01T18:02:00.000Z'),
  });

  return tx;
}

function createService() {
  const tx = createTransactionMock();
  const prisma = {
    reservation: {
      findUnique: mockFunction(),
      aggregate: mockFunction(),
      create: mockFunction(),
      update: mockFunction(),
    },
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

  it('cancela una reserva PENDING', async () => {
    const { service, tx } = createService();

    await service.cancel('reservation-id');

    assert.deepEqual(tx.reservation.update.calls[0][0], {
      where: {
        id: 'reservation-id',
      },
      data: {
        status: ReservationStatus.CANCELLED,
      },
    });
  });

  it('la cancelacion utiliza prisma.$transaction', async () => {
    const { service, prisma } = createService();

    await service.cancel('reservation-id');

    assert.equal(prisma.$transaction.calls.length, 1);
  });

  it('la cancelacion utiliza aislamiento Serializable', async () => {
    const { service, prisma } = createService();

    await service.cancel('reservation-id');

    assert.deepEqual(prisma.$transaction.calls[0][1], {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it('findUnique se ejecuta con tx.reservation al cancelar', async () => {
    const { service, tx } = createService();

    await service.cancel('reservation-id');

    assert.deepEqual(tx.reservation.findUnique.calls[0][0], {
      where: {
        id: 'reservation-id',
      },
    });
  });

  it('update se ejecuta con tx.reservation al cancelar', async () => {
    const { service, tx } = createService();

    await service.cancel('reservation-id');

    assert.deepEqual(tx.reservation.update.calls[0][0], {
      where: {
        id: 'reservation-id',
      },
      data: {
        status: ReservationStatus.CANCELLED,
      },
    });
  });

  it('no utiliza prisma.reservation directamente durante la cancelacion', async () => {
    const { service, prisma } = createService();

    await service.cancel('reservation-id');

    assert.equal(prisma.reservation.findUnique.calls.length, 0);
    assert.equal(prisma.reservation.update.calls.length, 0);
  });

  it('cancela una reserva CONFIRMED', async () => {
    const { service, tx } = createService();
    tx.reservation.findUnique.mockResolvedValue({
      ...baseReservation,
      status: ReservationStatus.CONFIRMED,
    });

    const result = await service.cancel('reservation-id');

    assert.equal(result.status, ReservationStatus.CANCELLED);
  });

  it('devuelve 404 si la reserva no existe', async () => {
    const { service, tx } = createService();
    tx.reservation.findUnique.mockResolvedValue(null);

    await assert.rejects(
      () => service.cancel('missing-reservation-id'),
      NotFoundException,
    );
  });

  it('devuelve 409 si la reserva ya estaba CANCELLED', async () => {
    const { service, tx } = createService();
    tx.reservation.findUnique.mockResolvedValue({
      ...baseReservation,
      status: ReservationStatus.CANCELLED,
    });

    await assert.rejects(() => service.cancel('reservation-id'), ConflictException);
  });

  it('devuelve 409 si la reserva esta ATTENDED', async () => {
    const { service, tx } = createService();
    tx.reservation.findUnique.mockResolvedValue({
      ...baseReservation,
      status: ReservationStatus.ATTENDED,
    });

    await assert.rejects(() => service.cancel('reservation-id'), ConflictException);
  });

  it('devuelve 409 si la reserva esta NO_SHOW', async () => {
    const { service, tx } = createService();
    tx.reservation.findUnique.mockResolvedValue({
      ...baseReservation,
      status: ReservationStatus.NO_SHOW,
    });

    await assert.rejects(() => service.cancel('reservation-id'), ConflictException);
  });

  it('devuelve 409 si el horario ya comenzo', async () => {
    const { service, tx } = createService();
    tx.reservation.findUnique.mockResolvedValue({
      ...baseReservation,
      date: new Date('2026-08-01T00:00:00.000Z'),
      startTime: '15:00',
      status: ReservationStatus.PENDING,
    });

    await assert.rejects(() => service.cancel('reservation-id'), ConflictException);
  });

  it('cambia unicamente el status', async () => {
    const { service, tx } = createService();

    await service.cancel('reservation-id');

    assert.deepEqual(
      (tx.reservation.update.calls[0][0] as { data: unknown }).data,
      {
        status: ReservationStatus.CANCELLED,
      },
    );
  });

  it('devuelve la reserva actualizada', async () => {
    const { service } = createService();

    const result = await service.cancel('reservation-id');

    assert.deepEqual(result, {
      ...baseReservation,
      status: ReservationStatus.CANCELLED,
      updatedAt: new Date('2026-08-01T18:02:00.000Z'),
    });
  });

  it('reintenta la cancelacion cuando ocurre un error P2034', async () => {
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

    await service.cancel('reservation-id');

    assert.equal(prisma.$transaction.calls.length, 2);
  });

  it('la cancelacion tiene un maximo de 3 intentos ante P2034', async () => {
    const { service, prisma } = createService();
    prisma.$transaction = Object.assign(
      async (_callback: unknown, options: unknown) => {
        prisma.$transaction.calls.push([_callback, options]);
        throw createPrismaKnownError('P2034');
      },
      prisma.$transaction,
    );

    await assert.rejects(() => service.cancel('reservation-id'), ConflictException);
    assert.equal(prisma.$transaction.calls.length, 3);
  });

  it('despues de 3 errores P2034 devuelve ConflictException con mensaje de concurrencia', async () => {
    const { service, prisma } = createService();
    prisma.$transaction = Object.assign(
      async (_callback: unknown, options: unknown) => {
        prisma.$transaction.calls.push([_callback, options]);
        throw createPrismaKnownError('P2034');
      },
      prisma.$transaction,
    );

    await assert.rejects(
      () => service.cancel('reservation-id'),
      (error: unknown) => {
        assert.ok(error instanceof ConflictException);
        assert.equal(
          error.message,
          'No fue posible cancelar la reserva debido a un conflicto de concurrencia. Intente nuevamente.',
        );
        return true;
      },
    );
  });

  it('la cancelacion no reintenta errores diferentes de P2034', async () => {
    const { service, prisma } = createService();
    prisma.$transaction = Object.assign(
      async (_callback: unknown, options: unknown) => {
        prisma.$transaction.calls.push([_callback, options]);
        throw createPrismaKnownError('P2002');
      },
      prisma.$transaction,
    );

    await assert.rejects(
      () => service.cancel('reservation-id'),
      Prisma.PrismaClientKnownRequestError,
    );
    assert.equal(prisma.$transaction.calls.length, 1);
  });

  it('una reserva CANCELLED queda excluida de ocupacion por la logica existente', async () => {
    const { service, tx } = createService();

    await service.create(baseDto);

    const where = (
      tx.reservation.aggregate.calls[0][0] as {
        where: { status: { not: ReservationStatus } };
      }
    ).where;

    assert.equal(where.status.not, ReservationStatus.CANCELLED);
  });

  it('confirma una reserva PENDING', async () => {
    const { service, tx } = createService();
    tx.reservation.update.mockResolvedValue({
      ...baseReservation,
      status: ReservationStatus.CONFIRMED,
    });

    await service.confirm('reservation-id');

    assert.deepEqual(tx.reservation.update.calls[0][0], {
      where: {
        id: 'reservation-id',
      },
      data: {
        status: ReservationStatus.CONFIRMED,
      },
    });
  });

  it('devuelve la reserva confirmada actualizada', async () => {
    const { service, tx } = createService();
    const updatedReservation = {
      ...baseReservation,
      status: ReservationStatus.CONFIRMED,
      updatedAt: new Date('2026-08-01T18:03:00.000Z'),
    };
    tx.reservation.update.mockResolvedValue(updatedReservation);

    const result = await service.confirm('reservation-id');

    assert.deepEqual(result, updatedReservation);
  });

  it('la confirmacion cambia unicamente el status', async () => {
    const { service, tx } = createService();

    await service.confirm('reservation-id');

    assert.deepEqual(
      (tx.reservation.update.calls[0][0] as { data: unknown }).data,
      {
        status: ReservationStatus.CONFIRMED,
      },
    );
  });

  it('devuelve 404 al confirmar si la reserva no existe', async () => {
    const { service, tx } = createService();
    tx.reservation.findUnique.mockResolvedValue(null);

    await assert.rejects(
      () => service.confirm('missing-reservation-id'),
      NotFoundException,
    );
  });

  it('devuelve 409 al confirmar si la reserva ya esta CONFIRMED', async () => {
    const { service, tx } = createService();
    tx.reservation.findUnique.mockResolvedValue({
      ...baseReservation,
      status: ReservationStatus.CONFIRMED,
    });

    await assert.rejects(
      () => service.confirm('reservation-id'),
      ConflictException,
    );
  });

  it('devuelve 409 al confirmar si la reserva esta CANCELLED', async () => {
    const { service, tx } = createService();
    tx.reservation.findUnique.mockResolvedValue({
      ...baseReservation,
      status: ReservationStatus.CANCELLED,
    });

    await assert.rejects(
      () => service.confirm('reservation-id'),
      ConflictException,
    );
  });

  it('devuelve 409 al confirmar si la reserva esta ATTENDED', async () => {
    const { service, tx } = createService();
    tx.reservation.findUnique.mockResolvedValue({
      ...baseReservation,
      status: ReservationStatus.ATTENDED,
    });

    await assert.rejects(
      () => service.confirm('reservation-id'),
      ConflictException,
    );
  });

  it('devuelve 409 al confirmar si la reserva esta NO_SHOW', async () => {
    const { service, tx } = createService();
    tx.reservation.findUnique.mockResolvedValue({
      ...baseReservation,
      status: ReservationStatus.NO_SHOW,
    });

    await assert.rejects(
      () => service.confirm('reservation-id'),
      ConflictException,
    );
  });

  it('permite confirmar una reserva cuyo horario ya comenzo', async () => {
    const { service, tx } = createService();
    tx.reservation.findUnique.mockResolvedValue({
      ...baseReservation,
      date: new Date('2026-08-01T00:00:00.000Z'),
      startTime: '15:00',
      status: ReservationStatus.PENDING,
    });
    tx.reservation.update.mockResolvedValue({
      ...baseReservation,
      date: new Date('2026-08-01T00:00:00.000Z'),
      startTime: '15:00',
      status: ReservationStatus.CONFIRMED,
    });

    const result = await service.confirm('reservation-id');

    assert.equal(result.status, ReservationStatus.CONFIRMED);
  });

  it('la confirmacion utiliza prisma.$transaction', async () => {
    const { service, prisma } = createService();

    await service.confirm('reservation-id');

    assert.equal(prisma.$transaction.calls.length, 1);
  });

  it('la confirmacion utiliza aislamiento Serializable', async () => {
    const { service, prisma } = createService();

    await service.confirm('reservation-id');

    assert.deepEqual(prisma.$transaction.calls[0][1], {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it('findUnique se ejecuta con tx.reservation al confirmar', async () => {
    const { service, tx } = createService();

    await service.confirm('reservation-id');

    assert.deepEqual(tx.reservation.findUnique.calls[0][0], {
      where: {
        id: 'reservation-id',
      },
    });
  });

  it('update se ejecuta con tx.reservation al confirmar', async () => {
    const { service, tx } = createService();

    await service.confirm('reservation-id');

    assert.deepEqual(tx.reservation.update.calls[0][0], {
      where: {
        id: 'reservation-id',
      },
      data: {
        status: ReservationStatus.CONFIRMED,
      },
    });
  });

  it('no utiliza prisma.reservation directamente durante la confirmacion', async () => {
    const { service, prisma } = createService();

    await service.confirm('reservation-id');

    assert.equal(prisma.reservation.findUnique.calls.length, 0);
    assert.equal(prisma.reservation.update.calls.length, 0);
  });

  it('reintenta la confirmacion cuando ocurre un error P2034', async () => {
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

    await service.confirm('reservation-id');

    assert.equal(prisma.$transaction.calls.length, 2);
  });

  it('la confirmacion tiene un maximo de 3 intentos ante P2034', async () => {
    const { service, prisma } = createService();
    prisma.$transaction = Object.assign(
      async (_callback: unknown, options: unknown) => {
        prisma.$transaction.calls.push([_callback, options]);
        throw createPrismaKnownError('P2034');
      },
      prisma.$transaction,
    );

    await assert.rejects(
      () => service.confirm('reservation-id'),
      ConflictException,
    );
    assert.equal(prisma.$transaction.calls.length, 3);
  });

  it('despues de 3 errores P2034 al confirmar devuelve ConflictException con mensaje de concurrencia', async () => {
    const { service, prisma } = createService();
    prisma.$transaction = Object.assign(
      async (_callback: unknown, options: unknown) => {
        prisma.$transaction.calls.push([_callback, options]);
        throw createPrismaKnownError('P2034');
      },
      prisma.$transaction,
    );

    await assert.rejects(
      () => service.confirm('reservation-id'),
      (error: unknown) => {
        assert.ok(error instanceof ConflictException);
        assert.equal(
          error.message,
          'No fue posible confirmar la reserva debido a un conflicto de concurrencia. Intente nuevamente.',
        );
        return true;
      },
    );
  });

  it('la confirmacion no reintenta errores diferentes de P2034', async () => {
    const { service, prisma } = createService();
    prisma.$transaction = Object.assign(
      async (_callback: unknown, options: unknown) => {
        prisma.$transaction.calls.push([_callback, options]);
        throw createPrismaKnownError('P2002');
      },
      prisma.$transaction,
    );

    await assert.rejects(
      () => service.confirm('reservation-id'),
      Prisma.PrismaClientKnownRequestError,
    );
    assert.equal(prisma.$transaction.calls.length, 1);
  });
});
