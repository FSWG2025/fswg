"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

interface MultiSelectOption {
  label: string
  value: string
  disable?: boolean
}

interface MultiSelectProps {
  options?: MultiSelectOption[]
  values?: string[]
  onValuesChange?: (values: string[]) => void
  placeholder?: string
  children?: React.ReactNode
}

const MultiSelect = ({ values = [], onValuesChange, children }: MultiSelectProps) => {
  return (
    <Popover>
      {children}
    </Popover>
  )
}

interface MultiSelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

const MultiSelectTrigger = React.forwardRef<HTMLButtonElement, MultiSelectTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <Button
      ref={ref}
      variant="outline"
      role="combobox"
      className={cn("h-auto min-h-10 w-full justify-between hover:bg-background", className)}
      {...props}
    >
      {children}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  )
)
MultiSelectTrigger.displayName = "MultiSelectTrigger"

interface MultiSelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}

const MultiSelectValue = React.forwardRef<HTMLSpanElement, MultiSelectValueProps>(
  ({ className, placeholder, children, ...props }, ref) => (
    <span ref={ref} className={cn("flex flex-wrap gap-1 items-center", className)} {...props}>
      {children || <span className="text-muted-foreground">{placeholder || "Select items..."}</span>}
    </span>
  )
)
MultiSelectValue.displayName = "MultiSelectValue"

const MultiSelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <PopoverContent ref={ref} className={cn("w-[--radix-popover-trigger-width] p-0", className)} align="start" {...props} />
  )
)
MultiSelectContent.displayName = "MultiSelectContent"

const MultiSelectGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-1 overflow-auto max-h-60", className)} {...props} />
  )
)
MultiSelectGroup.displayName = "MultiSelectGroup"

interface MultiSelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  selected?: boolean
}

const MultiSelectItem = React.forwardRef<HTMLDivElement, MultiSelectItemProps>(
  ({ className, children, value, selected, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        selected && "bg-accent text-accent-foreground",
        className
      )}
      data-value={value}
      {...props}
    >
      <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
      {children}
    </div>
  )
)
MultiSelectItem.displayName = "MultiSelectItem"

export {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
}