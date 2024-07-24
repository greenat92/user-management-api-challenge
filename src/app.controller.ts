import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('health-check')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({
    description: 'Service information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'WhateverWorks user management and auth service!',
        },
        version: { type: 'string' },
        uptime: { type: 'number' },
      },
    },
  })
  getServiceInfo() {
    return this.appService.serviceInfo();
  }
}
