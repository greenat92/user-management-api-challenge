import { ApiProperty } from '@nestjs/swagger';

export class ErrorSchema {
  @ApiProperty({ type: 'string' })
  message: string;
  @ApiProperty({ type: 'number' })
  statusCode: number;
}
