import { Test, TestingModule } from '@nestjs/testing';
import { ComcService } from './comc.service';

describe('ComcService', () => {
  let service: ComcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComcService],
    }).compile();

    service = module.get<ComcService>(ComcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
