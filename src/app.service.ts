import { Injectable } from '@nestjs/common';
import { version, name } from '../package.json';

export interface ServiceInfo {
  name: string;
  version: string;
  uptime: number;
}
@Injectable()
export class AppService {
  serviceInfo(): ServiceInfo {
    return {
      name,
      version,
      uptime: process.uptime(),
    };;
  }
}
