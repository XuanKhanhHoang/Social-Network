import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { VALID_PROVINCE_CODES } from '../utils/is-province-code';

@ValidatorConstraint({ async: false })
export class IsProvinceCodeConstraint implements ValidatorConstraintInterface {
  validate(code: any) {
    return (
      typeof code === 'number' &&
      !isNaN(code) &&
      VALID_PROVINCE_CODES.has(code as any)
    );
  }

  defaultMessage() {
    return 'Province code ($value) is invalid or not supported in Vietnam';
  }
}

export function IsProvinceCode(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsProvinceCodeConstraint,
    });
  };
}
