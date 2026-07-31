import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  AvailabilityExceptionType,
  ReservationStatus,
  Weekday,
} from '@prisma/client';
import { AvailabilityService } from './availability.service';

type PrismaMock = {
  experience: {
    findUnique: ReturnType<typeof mockFunction>;
  };
  timeSlot: {
    findMany: ReturnType<typeof mockFunction>;
  };
  availabilityException: {
    findMany: ReturnType<typeof mockFunction>;
  };
  reservation: {
    findMany: ReturnType<typeof mockFunction>;
  };
};

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

function createPrismaMock(): PrismaMock {
  const prisma = {
    experience: {
      findUnique: mockFunction(),
    },
    timeSlot: {
      findMany: mockFunction(),
    },
    availabilityException: {
      findMany: mockFunction(),
    },
    reservation: {
      findMany: mockFunction(),
    },
  };

  prisma.experience.findUnique.mockResolvedValue({ id: 'experience-id' });
  prisma.timeSlot.findMany.mockResolvedValue([]);
  prisma.availabilityException.findMany.mockResolvedValue([]);
  prisma.reservation.findMany.mockResolvedValue([]);

  return prisma;
}

function createService(prisma = createPrismaMock()) {
  return {
    prisma,
    service: new AvailabilityService(prisma as never),
  };
}

describe('AvailabilityService', () => {
  it('lanza NotFoundException cuando la experiencia no existe', async () => {
    const { prisma, service } = createService();
    prisma.experience.findUnique.mockResolvedValue(null);

    await assert.rejects(
      () => service.getAvailability('missing-id', '2027-08-05'),
      NotFoundException,
    );
  });

  it('lanza BadRequestException cuando la fecha no cumple YYYY-MM-DD', async () => {
    const { service } = createService();

    await assert.rejects(
      () => service.getAvailability('experience-id', '2027-8-05'),
      BadRequestException,
    );
  });

  it('lanza BadRequestException cuando la fecha representa un dia inexistente', async () => {
    const { service } = createService();

    await assert.rejects(
      () => service.getAvailability('experience-id', '2027-02-30'),
      BadRequestException,
    );
  });

  it('devuelve solamente TimeSlots activos del dia correspondiente', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        maxPeople: 12,
      },
    ]);

    const result = await service.getAvailability('experience-id', '2027-08-05');

    assert.deepEqual(result, {
      experienceId: 'experience-id',
      date: '2027-08-05',
      slots: [
        {
          startTime: '10:00',
          capacity: 12,
          available: 12,
        },
      ],
    });
    assert.deepEqual(prisma.timeSlot.findMany.calls[0][0], {
      where: {
        experienceId: 'experience-id',
        weekday: Weekday.THURSDAY,
        active: true,
      },
      select: {
        startTime: true,
        maxPeople: true,
      },
    });
  });

  it('sin reservas devuelve available igual a capacity', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        maxPeople: 12,
      },
    ]);

    const result = await service.getAvailability('experience-id', '2027-08-05');

    assert.deepEqual(result.slots, [
      {
        startTime: '10:00',
        capacity: 12,
        available: 12,
      },
    ]);
  });

  it('descuenta reservas que consumen capacidad', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        maxPeople: 12,
      },
    ]);
    prisma.reservation.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        peopleCount: 4,
      },
    ]);

    const result = await service.getAvailability('experience-id', '2027-08-05');

    assert.deepEqual(result.slots, [
      {
        startTime: '10:00',
        capacity: 12,
        available: 8,
      },
    ]);
    assert.deepEqual(prisma.reservation.findMany.calls[0][0], {
      where: {
        experienceId: 'experience-id',
        date: new Date(Date.UTC(2027, 7, 5)),
        startTime: {
          in: ['10:00'],
        },
        status: {
          not: ReservationStatus.CANCELLED,
        },
      },
      select: {
        startTime: true,
        peopleCount: true,
      },
    });
  });

  it('las reservas CANCELLED no modifican available', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        maxPeople: 12,
      },
    ]);

    await service.getAvailability('experience-id', '2027-08-05');

    assert.deepEqual(
      (prisma.reservation.findMany.calls[0][0] as {
        where: { status: { not: ReservationStatus } };
      }).where.status,
      {
        not: ReservationStatus.CANCELLED,
      },
    );
  });

  it('varias reservas en el mismo horario suman correctamente la ocupacion', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        maxPeople: 12,
      },
    ]);
    prisma.reservation.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        peopleCount: 4,
      },
      {
        startTime: '10:00',
        peopleCount: 3,
      },
    ]);

    const result = await service.getAvailability('experience-id', '2027-08-05');

    assert.equal(result.slots[0].available, 5);
  });

  it('reservas en otro horario no afectan el horario consultado', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        maxPeople: 12,
      },
      {
        startTime: '14:00',
        maxPeople: 8,
      },
    ]);
    prisma.reservation.findMany.mockResolvedValue([
      {
        startTime: '14:00',
        peopleCount: 5,
      },
    ]);

    const result = await service.getAvailability('experience-id', '2027-08-05');

    assert.deepEqual(result.slots, [
      {
        startTime: '10:00',
        capacity: 12,
        available: 12,
      },
      {
        startTime: '14:00',
        capacity: 8,
        available: 3,
      },
    ]);
  });

  it('filtra reservas por experiencia y fecha consultadas', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        maxPeople: 12,
      },
    ]);

    await service.getAvailability('experience-id', '2027-08-05');

    const where = (prisma.reservation.findMany.calls[0][0] as {
      where: unknown;
    }).where;

    assert.deepEqual(where, {
      experienceId: 'experience-id',
      date: new Date(Date.UTC(2027, 7, 5)),
      startTime: {
        in: ['10:00'],
      },
      status: {
        not: ReservationStatus.CANCELLED,
      },
    });
  });

  it('mantiene el horario con available 0 cuando la capacidad esta completamente ocupada', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        maxPeople: 12,
      },
    ]);
    prisma.reservation.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        peopleCount: 12,
      },
    ]);

    const result = await service.getAvailability('experience-id', '2027-08-05');

    assert.deepEqual(result.slots, [
      {
        startTime: '10:00',
        capacity: 12,
        available: 0,
      },
    ]);
  });

  it('nunca devuelve available negativo cuando la ocupacion supera la capacidad', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        maxPeople: 12,
      },
    ]);
    prisma.reservation.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        peopleCount: 20,
      },
    ]);

    const result = await service.getAvailability('experience-id', '2027-08-05');

    assert.equal(result.slots[0].available, 0);
  });

  it('permite excluir la propia reserva del calculo de ocupacion', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        maxPeople: 12,
      },
    ]);

    await service.getAvailability('experience-id', '2027-08-05', undefined, {
      excludedReservationId: 'reservation-id',
    });

    assert.deepEqual(
      (prisma.reservation.findMany.calls[0][0] as { where: unknown }).where,
      {
        experienceId: 'experience-id',
        date: new Date(Date.UTC(2027, 7, 5)),
        startTime: {
          in: ['10:00'],
        },
        status: {
          not: ReservationStatus.CANCELLED,
        },
        id: {
          not: 'reservation-id',
        },
      },
    );
  });

  it('CLOSED elimina el horario correspondiente', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        maxPeople: 12,
      },
      {
        startTime: '14:00',
        maxPeople: 8,
      },
    ]);
    prisma.availabilityException.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        type: AvailabilityExceptionType.CLOSED,
        capacity: null,
      },
    ]);

    const result = await service.getAvailability('experience-id', '2027-08-05');

    assert.deepEqual(result.slots, [
      {
        startTime: '14:00',
        capacity: 8,
        available: 8,
      },
    ]);
  });

  it('CAPACITY_OVERRIDE modifica capacity y available', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        maxPeople: 12,
      },
    ]);
    prisma.availabilityException.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        type: AvailabilityExceptionType.CAPACITY_OVERRIDE,
        capacity: 6,
      },
    ]);

    const result = await service.getAvailability('experience-id', '2027-08-05');

    assert.deepEqual(result.slots, [
      {
        startTime: '10:00',
        capacity: 6,
        available: 6,
      },
    ]);
  });

  it('EXTRA_SLOT agrega un horario extraordinario', async () => {
    const { prisma, service } = createService();
    prisma.availabilityException.findMany.mockResolvedValue([
      {
        startTime: '18:00',
        type: AvailabilityExceptionType.EXTRA_SLOT,
        capacity: 10,
      },
    ]);

    const result = await service.getAvailability('experience-id', '2027-08-05');

    assert.deepEqual(result.slots, [
      {
        startTime: '18:00',
        capacity: 10,
        available: 10,
      },
    ]);
  });

  it('aplica excepciones y descuenta reservas sobre la capacidad efectiva', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        maxPeople: 12,
      },
      {
        startTime: '14:00',
        maxPeople: 8,
      },
    ]);
    prisma.availabilityException.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        type: AvailabilityExceptionType.CLOSED,
        capacity: null,
      },
      {
        startTime: '14:00',
        type: AvailabilityExceptionType.CAPACITY_OVERRIDE,
        capacity: 6,
      },
      {
        startTime: '18:00',
        type: AvailabilityExceptionType.EXTRA_SLOT,
        capacity: 10,
      },
    ]);
    prisma.reservation.findMany.mockResolvedValue([
      {
        startTime: '14:00',
        peopleCount: 2,
      },
      {
        startTime: '18:00',
        peopleCount: 3,
      },
    ]);

    const result = await service.getAvailability('experience-id', '2027-08-05');

    assert.deepEqual(result.slots, [
      {
        startTime: '14:00',
        capacity: 6,
        available: 4,
      },
      {
        startTime: '18:00',
        capacity: 10,
        available: 7,
      },
    ]);
  });

  it('consulta solamente excepciones activas', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        maxPeople: 12,
      },
    ]);

    await service.getAvailability('experience-id', '2027-08-05');

    assert.deepEqual(prisma.availabilityException.findMany.calls[0][0], {
      where: {
        experienceId: 'experience-id',
        date: new Date(Date.UTC(2027, 7, 5)),
        active: true,
      },
      select: {
        startTime: true,
        type: true,
        capacity: true,
      },
    });
  });

  it('devuelve los slots ordenados por startTime', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '14:00',
        maxPeople: 8,
      },
      {
        startTime: '09:00',
        maxPeople: 10,
      },
    ]);
    prisma.availabilityException.findMany.mockResolvedValue([
      {
        startTime: '10:30',
        type: AvailabilityExceptionType.EXTRA_SLOT,
        capacity: 6,
      },
    ]);

    const result = await service.getAvailability('experience-id', '2027-08-05');

    assert.deepEqual(
      result.slots.map((slot) => slot.startTime),
      ['09:00', '10:30', '14:00'],
    );
  });

  it('CAPACITY_OVERRIDE con capacity invalida produce una excepcion tecnica', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        maxPeople: 12,
      },
    ]);
    prisma.availabilityException.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        type: AvailabilityExceptionType.CAPACITY_OVERRIDE,
        capacity: null,
      },
    ]);

    await assert.rejects(
      () => service.getAvailability('experience-id', '2027-08-05'),
      InternalServerErrorException,
    );
  });

  it('EXTRA_SLOT con capacity invalida produce una excepcion tecnica', async () => {
    const { prisma, service } = createService();
    prisma.availabilityException.findMany.mockResolvedValue([
      {
        startTime: '18:00',
        type: AvailabilityExceptionType.EXTRA_SLOT,
        capacity: 0,
      },
    ]);

    await assert.rejects(
      () => service.getAvailability('experience-id', '2027-08-05'),
      InternalServerErrorException,
    );
  });

  it('un EXTRA_SLOT coincidente con un horario base no produce duplicados y prevalece su capacidad', async () => {
    const { prisma, service } = createService();
    prisma.timeSlot.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        maxPeople: 12,
      },
    ]);
    prisma.availabilityException.findMany.mockResolvedValue([
      {
        startTime: '10:00',
        type: AvailabilityExceptionType.EXTRA_SLOT,
        capacity: 20,
      },
    ]);

    const result = await service.getAvailability('experience-id', '2027-08-05');

    assert.deepEqual(result.slots, [
      {
        startTime: '10:00',
        capacity: 20,
        available: 20,
      },
    ]);
  });
});
