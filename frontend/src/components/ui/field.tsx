import * as React from "react"
import { cn } from "@/lib/utils"

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  "data-invalid"?: boolean
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1.5", className)} {...props} />
  )
)
Field.displayName = "Field"

const FieldLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
  )
)
FieldLabel.displayName = "FieldLabel"

const FieldGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-4", className)} {...props} />
  )
)
FieldGroup.displayName = "FieldGroup"

interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  errors?: Array<{ message?: string } | undefined>
}

const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ className, errors, ...props }, ref) => {
    if (!errors?.length) return null
    return (
      <p ref={ref} className={cn("text-sm font-medium text-destructive", className)} {...props}>
        {errors.filter(Boolean).map((e, i) => (
          <span key={i}>{e?.message}{i < errors.length - 1 ? ", " : ""}</span>
        ))}
      </p>
    )
  }
)
FieldError.displayName = "FieldError"

export { Field, FieldLabel, FieldGroup, FieldError }