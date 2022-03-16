import { IsolateConfig } from './isolate/IsolateConfig.ts';
import { ChildConfig, ConfigKey, loadConfig } from './utils/loadConfig.ts';

class Config {
  @ChildConfig(() => IsolateConfig)
  isolate!: IsolateConfig;

  @ConfigKey({ env: 'PORT', default: 8888 })
  port!: number;
}

export const loadAndValidateConfig = (): Config => loadConfig(Config);
