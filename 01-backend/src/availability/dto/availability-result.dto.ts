import { AvailableSlotDto } from './available-slot.dto';

export class AvailabilityResultDto {
  experienceId!: string;
  date!: string;
  slots!: AvailableSlotDto[];
}
