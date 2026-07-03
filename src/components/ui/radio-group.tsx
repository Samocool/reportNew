"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | undefined>(undefined);

const RadioGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    value?: string;
    onChange?: (value: string) => void;
    name?: string;
  }
>(({ className, value, onChange, name = "radio-group", ...props }, ref) => {
  const contextValue = React.useMemo<RadioGroupContextValue>(
    () => ({
      name,
      value,
      onChange,
    }),
    [name, value, onChange]
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        className={cn("grid gap-2", className)}
        {...props}
        ref={ref}
        role="radiogroup"
      />
    </RadioGroupContext.Provider>
  );
});
RadioGroup.displayName = "RadioGroup";

const useRadioGroup = () => {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroupItem must be used within a RadioGroup");
  }
  return context;
};

const RadioGroupItem = React.forwardRef<
  React.ElementRef<"input">,
  React.ComponentPropsWithoutRef<"input"> & {
    value: string;
  }
>(({ className, value, onChange, ...props }, ref) => {
  const group = useRadioGroup();

  return (
    <input
      type="radio"
      name={group.name}
      value={value}
      checked={group.value === value}
      onChange={() => group.onChange?.(value)}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-slate-300 text-slate-900 shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
