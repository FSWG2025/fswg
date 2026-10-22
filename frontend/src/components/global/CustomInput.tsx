import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type ComponentProps, type ReactNode } from "react";

interface CustomInputProps<T extends FieldValues>
  extends Omit<ComponentProps<typeof Input>, "name"> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
  rightIcon?: ReactNode;
}

export function CustomInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  rightIcon,
  ...props
}: CustomInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>{label}</FieldLabel>
          <div className="relative">
            <Input
              {...field}
              {...props}
              disabled={disabled}
              className={[
                "bg-white border-gray-200 focus:border-[#C69259] focus:ring-2 focus:ring-[#C69259]/20",
                "placeholder:text-gray-400",
                "text-gray-900",
                rightIcon ? "pr-10" : "",
                props.className ?? "",
              ].join(" ")}
            />
            {rightIcon && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {rightIcon}
              </div>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}