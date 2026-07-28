import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AvailabilityExceptionType, Weekday } from '@prisma/client';
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
  };

  prisma.experience.findUnique.mockResolvedValue({ id: 'experience-id' });
  prisma.timeSlot.findMany.mockResolvedValue([]);
  prisma.availabilityException.findMany.mockResolvedValue([]);

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
