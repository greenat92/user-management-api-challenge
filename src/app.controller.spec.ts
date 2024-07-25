import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('Health check', () => {
    it('[UNIT] should return 200', () => {
      const mockUptime = 15;
      const mockVerios = '0.0.1';
      jest.spyOn(process, 'uptime').mockReturnValue(mockUptime);
      expect(appController.getServiceInfo()).toEqual({
        version: mockVerios,
        name: 'user-management-api-challenge',
        uptime: mockUptime,
      });
      jest.restoreAllMocks();
    });
  });
});
