import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'atLeastOneField', async: false })
export class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    const [field1, field2] = args.constraints;

    const hasValue = (value: any) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    };

    return hasValue(obj[field1]) || hasValue(obj[field2]);
  }

  defaultMessage(args: ValidationArguments) {
    const [field1, field2] = args.constraints;
    return `Either "${field1}" or "${field2}" must be provided (not both null)`;
  }
}

export function AtLeastOneField(
  field1: string,
  field2: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [field1, field2],
      validator: AtLeastOneFieldConstraint,
    });
  };
}
