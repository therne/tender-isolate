import { isNil } from 'https://deno.land/x/lodash@4.17.15-es/lodash.js';
import { Reflect } from 'https://deno.land/x/reflect_metadata@v0.1.12-2/mod.ts';
import { assignWithoutNull } from './assignWithoutNull.ts';

const CONFIG_METADATA = Symbol('config');

interface ClassType<T> {
  new (...args: any): T;
  readonly prototype: T;
}

interface ConfigKeyMetadata<T> {
  kind: 'key' | 'child';
  key: string | symbol;
  keyParams?: ConfigKeyParams<T>;
  childType?: ClassType<T>;
}

interface ConfigKeyParams<T> {
  env?: string;
  validate?: (v: T) => boolean;
  required?: boolean;
  warnIfNotGiven?: boolean | string;
  default?: T | { [environment: string]: T };
}

/** tagged into config properties in a config class. */
export const ConfigKey = (params: ConfigKeyParams<any> = {}): PropertyDecorator =>
  (target: Object, propertyKey: string | symbol) => {
    const metadata: ConfigKeyMetadata<any> = {
      kind: 'key',
      key: propertyKey,
      keyParams: params,
    };
    const existingMetadata = Reflect.getMetadata(CONFIG_METADATA, target) ?? [];
    Reflect.defineMetadata(CONFIG_METADATA, [...existingMetadata, metadata], target);
  };

/** tagged into child config properties in a config class. */
export const ChildConfig = (typeFunction: () => ClassType<any>): PropertyDecorator =>
  (target: Object, propertyKey: string | symbol) => {
    const metadata: ConfigKeyMetadata<any> = {
      kind: 'child',
      key: propertyKey,
      childType: typeFunction(),
    };
    const existingMetadata = Reflect.getMetadata(CONFIG_METADATA, target) ?? [];
    Reflect.defineMetadata(CONFIG_METADATA, [...existingMetadata, metadata], target);
  };

class ConfigValidationError extends Error {}

interface LoadConfigOptions {
  environment: string;
  path: string[];
}

const DEFAULT_CONFIG: LoadConfigOptions = {
  environment: 'default',
  path: [],
};

export function loadConfig<T>(type: ClassType<T>, options: Partial<LoadConfigOptions> = {}): T {
  const { environment, path } = assignWithoutNull(DEFAULT_CONFIG, options) as LoadConfigOptions;

  const target = new type();
  const targetObject = target as Record<string | symbol, any>;
  const metadata = Reflect.getMetadata(CONFIG_METADATA, type.prototype) as ConfigKeyMetadata<any>[];

  for (const { kind, key, keyParams, childType } of metadata) {
    if (kind === 'child' && childType) {
      targetObject[key] = loadConfig(childType, { ...options, path: [...path, String(key)] });
      continue;
    }
    const type = Reflect.getMetadata('design:type', target, key);
    const { default: defaultValue, env, validate, required, warnIfNotGiven } = keyParams!;

    const prettyKey = `${[...path, key].join('.')}${env ? ` (${env})` : ''}`;

    if (defaultValue) {
      if (typeof defaultValue === 'object') {
        // in this case, the default value varies by environment
        const defaultValueOfEnvironment = defaultValue[environment] ?? defaultValue['default'];
        if (!defaultValueOfEnvironment) {
          throw new ConfigValidationError(`${prettyKey} has no default value for either ${environment} or default.`);
        }
        targetObject[key] = defaultValueOfEnvironment;
      } else {
        targetObject[key] = defaultValue;
      }
    }
    if (env) {
      // load from env
      const envValue = Deno.env.get(env);
      if (envValue) {
        targetObject[key] = type(envValue);

        // basic validation: string-numeric
        if (typeof targetObject[key] === 'number' && isNaN(targetObject[key])) {
          throw new ConfigValidationError(`${prettyKey} should be a numeric`);
        }
      } else if (warnIfNotGiven === environment || (typeof warnIfNotGiven === 'boolean' && warnIfNotGiven)) {
        console.warn(
          `${prettyKey} is required on ${environment} but not given. falling back to default value ${
            targetObject[key]
          }...`,
        );
      }
    }
    if (validate) {
      const isValid = validate(targetObject[key]);
      if (!isValid) {
        throw new ConfigValidationError(`invalid value: ${prettyKey}`);
      }
    }
    if (required && isNil(targetObject[key])) {
      throw new ConfigValidationError(`${prettyKey} is missing`);
    }
  }
  return target;
}
