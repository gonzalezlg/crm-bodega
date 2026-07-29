import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReservationStatus } from '@prisma/client';
import { AvailabilityService } from '../availability/availability.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ListReservationsDto } from './dto/list-reservations.dto';

type BusinessDateTime = {
  date: string;
  minutes: number;
};

type ReservationConfig = {
  businessTimeZone: string;
  reservationWindowDays: number;
  minReservationNoticeMinutes: number;
};

type ReservationWithExperience = Prisma.ReservationGetPayload<{
  include: {
    experience: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

@Injectable()
export class ReservationsService {
  private readonly maxTransactionAttempts = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  findAll(
    query: ListReservationsDto,
  ): Promise<ReservationWithExperience[]> {
    const where = this.buildFilters(query);

    return this.prisma.reservation.findMany({
      where,
      include: {
        experience: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          date: 'asc',
        },
        {
          startTime: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });
  }

  async findOne(id: string): Promise<ReservationWithExperience> {
    const reservation = await this.prisma.reservation.findUnique({
      where: {
        id,
      },
      include: {
        experience: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada.');
    }

    return reservation;
  }

  async create(createReservationDto: CreateReservationDto) {
    const config = this.getReservationConfig();
    this.validateTemporalRules(createReservationDto, config);

    for (let attempt = 1; attempt <= this.maxTransactionAttempts; attempt++) {
      try {
        return await this.prisma.$transaction(
          (tx) => this.createInsideTransaction(createReservationDto, tx),
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        );
      } catch (error) {
        if (!this.isPrismaTransactionConflict(error)) {
          throw error;
        }

        if (attempt === this.maxTransactionAttempts) {
          throw new ConflictException(
            'No fue posible completar la reserva debido a un conflicto de disponibilidad. Intente nuevamente.',
          );
        }
      }
    }

    throw new ConflictException(
      'No fue posible completar la reserva debido a un conflicto de disponibilidad. Intente nuevamente.',
    );
  }

  async cancel(id: string) {
    for (let attempt = 1; attempt <= this.maxTransactionAttempts; attempt++) {
      try {
        return await this.prisma.$transaction(
          (tx) => this.cancelInsideTransaction(id, tx),
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        );
      } catch (error) {
        if (!this.isPrismaTransactionConflict(error)) {
          throw error;
        }

        if (attempt === this.maxTransactionAttempts) {
          throw new ConflictException(
            'No fue posible cancelar la reserva debido a un conflicto de concurrencia. Intente nuevamente.',
          );
        }
      }
    }

    throw new ConflictException(
      'No fue posible cancelar la reserva debido a un conflicto de concurrencia. Intente nuevamente.',
    );
  }

  async confirm(id: string) {
    for (let attempt = 1; attempt <= this.maxTransactionAttempts; attempt++) {
      try {
        return await this.prisma.$transaction(
          (tx) => this.confirmInsideTransaction(id, tx),
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        );
      } catch (error) {
        if (!this.isPrismaTransactionConflict(error)) {
          throw error;
        }

        if (attempt === this.maxTransactionAttempts) {
          throw new ConflictException(
            'No fue posible confirmar la reserva debido a un conflicto de concurrencia. Intente nuevamente.',
          );
        }
      }
    }

    throw new ConflictException(
      'No fue posible confirmar la reserva debido a un conflicto de concurrencia. Intente nuevamente.',
    );
  }

  async attend(id: string) {
    for (let attempt = 1; attempt <= this.maxTransactionAttempts; attempt++) {
      try {
        return await this.prisma.$transaction(
          (tx) => this.attendInsideTransaction(id, tx),
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        );
      } catch (error) {
        if (!this.isPrismaTransactionConflict(error)) {
          throw error;
        }

        if (attempt === this.maxTransactionAttempts) {
          throw new ConflictException(
            'No fue posible registrar la asistencia debido a un conflicto de concurrencia. Intente nuevamente.',
          );
        }
      }
    }

    throw new ConflictException(
      'No fue posible registrar la asistencia debido a un conflicto de concurrencia. Intente nuevamente.',
    );
  }

  async noShow(id: string) {
    for (let attempt = 1; attempt <= this.maxTransactionAttempts; attempt++) {
      try {
        return await this.prisma.$transaction(
          (tx) => this.noShowInsideTransaction(id, tx),
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        );
      } catch (error) {
        if (!this.isPrismaTransactionConflict(error)) {
          throw error;
        }

        if (attempt === this.maxTransactionAttempts) {
          throw new ConflictException(
            'No fue posible registrar la ausencia debido a un conflicto de concurrencia. Intente nuevamente.',
          );
        }
      }
    }

    throw new ConflictException(
      'No fue posible registrar la ausencia debido a un conflicto de concurrencia. Intente nuevamente.',
    );
  }

  private async noShowInsideTransaction(
    id: string,
    tx: Prisma.TransactionClient,
  ) {
    const reservation = await tx.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada.');
    }

    this.validateReservationCanBeMarkedAsNoShow(reservation);

    return tx.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.NO_SHOW,
      },
    });
  }

  private async attendInsideTransaction(
    id: string,
    tx: Prisma.TransactionClient,
  ) {
    const reservation = await tx.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada.');
    }

    this.validateReservationCanBeAttended(reservation);

    return tx.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.ATTENDED,
      },
    });
  }

  private async confirmInsideTransaction(
    id: string,
    tx: Prisma.TransactionClient,
  ) {
    const reservation = await tx.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada.');
    }

    this.validateReservationCanBeConfirmed(reservation.status);

    return tx.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CONFIRMED,
      },
    });
  }

  private async cancelInsideTransaction(
    id: string,
    tx: Prisma.TransactionClient,
  ) {
    const reservation = await tx.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada.');
    }

    this.validateReservationCanBeCancelled(reservation);

    return tx.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CANCELLED,
      },
    });
  }

  private async createInsideTransaction(
    createReservationDto: CreateReservationDto,
    tx: Prisma.TransactionClient,
  ) {
    const experience = await tx.experience.findUnique({
      where: {
        id: createReservationDto.experienceId,
      },
      select: {
        id: true,
        active: true,
      },
    });

    if (!experience) {
      throw new NotFoundException('Experiencia no encontrada.');
    }

    if (!experience.active) {
      throw new BadRequestException(
        'La experiencia no se encuentra disponible para recibir reservas.',
      );
    }

    const availability = await this.availabilityService.getAvailability(
      createReservationDto.experienceId,
      createReservationDto.date,
      tx,
    );
    const slot = availability.slots.find(
      (availableSlot) =>
        availableSlot.startTime === createReservationDto.startTime,
    );

    if (!slot) {
      throw new BadRequestException(
        'El horario seleccionado no se encuentra disponible.',
      );
    }

    const reservationDate = this.toPrismaDate(createReservationDto.date);
    const occupiedPeople = await this.getOccupiedPeople(
      createReservationDto,
      reservationDate,
      tx,
    );
    const remainingCapacity = slot.capacity - occupiedPeople;

    if (createReservationDto.peopleCount > remainingCapacity) {
      throw new ConflictException(
        'No hay disponibilidad suficiente para la cantidad de personas solicitada.',
      );
    }

    return tx.reservation.create({
      data: {
        experienceId: createReservationDto.experienceId,
        date: reservationDate,
        startTime: createReservationDto.startTime,
        peopleCount: createReservationDto.peopleCount,
        notes: createReservationDto.notes,
        status: ReservationStatus.PENDING,
      },
    });
  }

  private async getOccupiedPeople(
    createReservationDto: CreateReservationDto,
    reservationDate: Date,
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    const result = await tx.reservation.aggregate({
      where: {
        experienceId: createReservationDto.experienceId,
        date: reservationDate,
        startTime: createReservationDto.startTime,
        status: {
          not: ReservationStatus.CANCELLED,
        },
      },
      _sum: {
        peopleCount: true,
      },
    });

    return result._sum.peopleCount ?? 0;
  }

  private buildFilters(
    query: ListReservationsDto,
  ): Prisma.ReservationWhereInput {
    const where: Prisma.ReservationWhereInput = {};

    if (query.date) {
      where.date = this.toPrismaDate(query.date);
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.experienceId) {
      where.experienceId = query.experienceId;
    }

    return where;
  }

  private validateTemporalRules(
    createReservationDto: CreateReservationDto,
    config: ReservationConfig,
  ): void {
    const today = this.getCurrentBusinessDateTime(config.businessTimeZone);
    const requestedDay = this.getDayIndex(createReservationDto.date);
    const todayDay = this.getDayIndex(today.date);
    const lastAllowedDay = todayDay + config.reservationWindowDays;

    if (requestedDay < todayDay) {
      throw new BadRequestException(
        'No se pueden crear reservas para fechas pasadas.',
      );
    }

    if (requestedDay > lastAllowedDay) {
      throw new BadRequestException(
        `La fecha supera la ventana máxima de reserva de ${config.reservationWindowDays} días.`,
      );
    }

    if (requestedDay === todayDay) {
      const startMinutes = this.parseStartTime(createReservationDto.startTime);
      const minutesUntilStart = startMinutes - today.minutes;

      if (minutesUntilStart < config.minReservationNoticeMinutes) {
        throw new BadRequestException(
          `La reserva debe realizarse con al menos ${config.minReservationNoticeMinutes} minutos de anticipación.`,
        );
      }
    }
  }

  private getReservationConfig(): ReservationConfig {
    return {
      businessTimeZone: this.getValidTimeZone(
        process.env.BUSINESS_TIME_ZONE ?? 'America/Argentina/Buenos_Aires',
      ),
      reservationWindowDays: this.getPositiveIntegerConfig(
        process.env.RESERVATION_WINDOW_DAYS,
        45,
      ),
      minReservationNoticeMinutes: this.getPositiveIntegerConfig(
        process.env.MIN_RESERVATION_NOTICE_MINUTES,
        60,
      ),
    };
  }

  private getValidTimeZone(timeZone: string): string {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
      return timeZone;
    } catch {
      return 'America/Argentina/Buenos_Aires';
    }
  }

  private getPositiveIntegerConfig(
    value: string | undefined,
    defaultValue: number,
  ): number {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
      return defaultValue;
    }

    return parsedValue;
  }

  private getCurrentBusinessDateTime(timeZone: string): BusinessDateTime {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(this.getCurrentDate());
    const values = new Map(parts.map((part) => [part.type, part.value]));
    const year = values.get('year');
    const month = values.get('month');
    const day = values.get('day');
    const hour = Number(values.get('hour'));
    const minute = Number(values.get('minute'));

    return {
      date: `${year}-${month}-${day}`,
      minutes: hour * 60 + minute,
    };
  }

  private getCurrentDate(): Date {
    return new Date();
  }

  private validateReservationCanBeCancelled(reservation: {
    date: Date;
    startTime: string;
    status: ReservationStatus;
  }): void {
    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new ConflictException('La reserva ya se encuentra cancelada.');
    }

    if (
      reservation.status === ReservationStatus.ATTENDED ||
      reservation.status === ReservationStatus.NO_SHOW
    ) {
      throw new ConflictException(
        'La reserva no puede cancelarse en su estado actual.',
      );
    }

    const config = this.getReservationConfig();
    const currentBusinessDateTime = this.getCurrentBusinessDateTime(
      config.businessTimeZone,
    );
    const reservationDate = this.formatPrismaDate(reservation.date);
    const reservationDay = this.getDayIndex(reservationDate);
    const currentDay = this.getDayIndex(currentBusinessDateTime.date);

    if (
      reservationDay < currentDay ||
      (reservationDay === currentDay &&
        this.parseStartTime(reservation.startTime) <=
          currentBusinessDateTime.minutes)
    ) {
      throw new ConflictException(
        'No se puede cancelar una reserva cuyo horario ya comenzó.',
      );
    }
  }

  private validateReservationCanBeConfirmed(status: ReservationStatus): void {
    if (status === ReservationStatus.CONFIRMED) {
      throw new ConflictException('La reserva ya se encuentra confirmada.');
    }

    if (status === ReservationStatus.CANCELLED) {
      throw new ConflictException(
        'La reserva no puede confirmarse porque fue cancelada.',
      );
    }

    if (
      status === ReservationStatus.ATTENDED ||
      status === ReservationStatus.NO_SHOW
    ) {
      throw new ConflictException(
        'La reserva no puede confirmarse en su estado actual.',
      );
    }
  }

  private validateReservationCanBeAttended(reservation: {
    date: Date;
    startTime: string;
    status: ReservationStatus;
  }): void {
    if (reservation.status === ReservationStatus.PENDING) {
      throw new ConflictException(
        'La reserva debe estar confirmada antes de registrar la asistencia.',
      );
    }

    if (reservation.status === ReservationStatus.ATTENDED) {
      throw new ConflictException(
        'La reserva ya se encuentra marcada como asistida.',
      );
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new ConflictException(
        'No se puede registrar asistencia en una reserva cancelada.',
      );
    }

    if (reservation.status === ReservationStatus.NO_SHOW) {
      throw new ConflictException('La reserva ya fue marcada como ausente.');
    }

    const config = this.getReservationConfig();
    const currentBusinessDateTime = this.getCurrentBusinessDateTime(
      config.businessTimeZone,
    );
    const reservationDate = this.formatPrismaDate(reservation.date);
    const reservationDay = this.getDayIndex(reservationDate);
    const currentDay = this.getDayIndex(currentBusinessDateTime.date);

    if (
      reservationDay > currentDay ||
      (reservationDay === currentDay &&
        this.parseStartTime(reservation.startTime) >
          currentBusinessDateTime.minutes)
    ) {
      throw new ConflictException(
        'No se puede registrar la asistencia antes del horario de la reserva.',
      );
    }
  }

  private validateReservationCanBeMarkedAsNoShow(reservation: {
    date: Date;
    startTime: string;
    status: ReservationStatus;
  }): void {
    if (reservation.status === ReservationStatus.PENDING) {
      throw new ConflictException(
        'La reserva debe estar confirmada antes de registrar la ausencia.',
      );
    }

    if (reservation.status === ReservationStatus.ATTENDED) {
      throw new ConflictException('La reserva ya fue marcada como asistida.');
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new ConflictException(
        'No se puede registrar ausencia en una reserva cancelada.',
      );
    }

    if (reservation.status === ReservationStatus.NO_SHOW) {
      throw new ConflictException('La reserva ya fue marcada como ausente.');
    }

    const config = this.getReservationConfig();
    const currentBusinessDateTime = this.getCurrentBusinessDateTime(
      config.businessTimeZone,
    );
    const reservationDate = this.formatPrismaDate(reservation.date);
    const reservationDay = this.getDayIndex(reservationDate);
    const currentDay = this.getDayIndex(currentBusinessDateTime.date);

    if (
      reservationDay > currentDay ||
      (reservationDay === currentDay &&
        this.parseStartTime(reservation.startTime) >=
          currentBusinessDateTime.minutes)
    ) {
      throw new ConflictException(
        'No se puede registrar la ausencia antes de que haya comenzado la reserva.',
      );
    }
  }

  private getDayIndex(date: string): number {
    const [year, month, day] = date.split('-').map(Number);

    return Date.UTC(year, month - 1, day) / 86_400_000;
  }

  private parseStartTime(startTime: string): number {
    const [hour, minute] = startTime.split(':').map(Number);

    return hour * 60 + minute;
  }

  private toPrismaDate(date: string): Date {
    return new Date(`${date}T00:00:00.000Z`);
  }

  private formatPrismaDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private isPrismaTransactionConflict(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    );
  }
}
