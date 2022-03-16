import { ConfigKey } from '../utils/loadConfig.ts';

export class IsolateConfig {
  @ConfigKey({ env: 'ISOLATE_MAX_THREADS', default: 1024 })
  maxThreads!: number;

  @ConfigKey({ env: 'ISOLATE_MAX_MEMORY', default: '128mb' })
  maxMemory!: number;
}
