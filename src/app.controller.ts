import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check api' })
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
