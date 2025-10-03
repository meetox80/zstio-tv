type ValidationRule = {
  Required?: boolean;
  MinLength?: number;
  MaxLength?: number;
  Pattern?: RegExp;
  Custom?: (Value: any) => boolean | string;
};

type ValidationSchema = {
  [Key: string]: ValidationRule;
};

export function ValidateInput(
  Data: Record<string, any>,
  Schema: ValidationSchema,
): {
  Valid: boolean;
  Errors: Record<string, string>;
} {
  const Errors: Record<string, string> = {};

  for (const [Field, Rules] of Object.entries(Schema)) {
    const Value = Data[Field];

    if (
      Rules.Required &&
      (Value === undefined || Value === null || Value === "")
    ) {
      Errors[Field] = `${Field} is required`;
      continue;
    }

    if (
      !Rules.Required &&
      (Value === undefined || Value === null || Value === "")
    ) {
      continue;
    }

    if (
      Rules.MinLength !== undefined &&
      typeof Value === "string" &&
      Value.length < Rules.MinLength
    ) {
      Errors[Field] = `${Field} must be at least ${Rules.MinLength} characters`;
      continue;
    }

    if (
      Rules.MaxLength !== undefined &&
      typeof Value === "string" &&
      Value.length > Rules.MaxLength
    ) {
      Errors[Field] =
        `${Field} must be no more than ${Rules.MaxLength} characters`;
      continue;
    }

    if (
      Rules.Pattern &&
      typeof Value === "string" &&
      !Rules.Pattern.test(Value)
    ) {
      Errors[Field] = `${Field} format is invalid`;
      continue;
    }

    if (Rules.Custom) {
      const CustomResult = Rules.Custom(Value);
      if (typeof CustomResult === "string") {
        Errors[Field] = CustomResult;
        continue;
      } else if (CustomResult === false) {
        Errors[Field] = `${Field} is invalid`;
        continue;
      }
    }
  }

  return {
    Valid: Object.keys(Errors).length === 0,
    Errors,
  };
}

export const UserSchema = {
  username: {
    Required: true,
    MinLength: 3,
    MaxLength: 32,
    Pattern: /^[a-zA-Z0-9_]+$/,
  },
  password: {
    Required: true,
    MinLength: 8,
    MaxLength: 128,
  },
};

export const TrackSchema = {
  Id: { Required: true },
  Title: { Required: true },
  Artist: { Required: true },
};
