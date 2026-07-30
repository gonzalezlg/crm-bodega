import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpcomingReservationsDto } from './upcoming-reservations.dto';

function hasValidationErrorForProperty(
  errors: Awaited<ReturnType<typeof validate>>,
  property: string,
): boolean {
  return errors.some((error) => error.property === property);
}

describe('UpcomingReservationsDto', () => {
  it('rechaza includeFuture invalido', async () => {
    const dto = plainToInstance(UpcomingReservationsDto, {
      includeFuture: 'yes',
    });

    const errors = await validate(dto);

    assert.equal(hasValidationErrorForProperty(errors, 'includeFuture'), true);
  });

  it('transforma "true" correctamente', async () => {
    const dto = plainToInstance(UpcomingReservationsDto, {
      includeFuture: 'true',
    });

    const errors = await validate(dto);

    assert.equal(dto.includeFuture, true);
    assert.equal(errors.length, 0);
  });

  it('transforma "false" correctamente', async () => {
    const dto = plainToInstance(UpcomingReservationsDto, {
      includeFuture: 'false',
    });

    const errors = await validate(dto);

    assert.equal(dto.includeFuture, false);
    assert.equal(errors.length, 0);
  });

  it('aplica valores predeterminados', async () => {
    const dto = plainToInstance(UpcomingReservationsDto, {});

    const errors = await validate(dto);

    assert.equal(dto.limit, 20);
    assert.equal(dto.includeFuture, false);
    assert.equal(errors.length, 0);
  });

  it('valida un limite correcto', async () => {
    const dto = plainToInstance(UpcomingReservationsDto, {
      limit: '5',
    });

    const errors = await validate(dto);

    assert.equal(dto.limit, 5);
    assert.equal(errors.length, 0);
  });

  [
    {
      value: '0',
      name: '0',
    },
    {
      value: '101',
      name: '101',
    },
    {
      value: '10.5',
      name: '10.5',
    },
    {
      value: 'abc',
      name: 'abc',
    },
  ].forEach(({ value, name }) => {
    it(`rechaza limit=${name}`, async () => {
      const dto = plainToInstance(UpcomingReservationsDto, {
        limit: value,
      });

      const errors = await validate(dto);

      assert.equal(hasValidationErrorForProperty(errors, 'limit'), true);
    });
  });
});
