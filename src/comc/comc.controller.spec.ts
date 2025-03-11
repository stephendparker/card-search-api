import { Test, TestingModule } from '@nestjs/testing';
import { ComcController } from './comc.controller';

describe('ComcController', () => {
  let controller: ComcController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComcController],
    }).compile();

    controller = module.get<ComcController>(ComcController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
