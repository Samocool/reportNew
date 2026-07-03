"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";
import { Controller, type Control, type FieldValues, type Path, type ControllerRenderProps } from "react-hook-form";

const Form = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => (
  <form ref={ref} className={cn("space-y-6", className)} {...props} />
));
Form.displayName = "Form";

interface FormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  render: (props: { field: ControllerRenderProps<TFieldValues, Path<TFieldValues>> }) => React.ReactNode;
}

function FormField<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  render,
}: FormFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItemContext.Provider value={{ name, error: fieldState.error }}>
          {render({ field })}
        </FormItemContext.Provider>
      )}
    />
  );
}

interface FormItemContextValue {
  name: string;
  error?: { message?: string };
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

const useFormField = () => {
  const fieldContext = React.useContext(FormItemContext);
  if (!fieldContext.name) {
    throw new Error("useFormField should be used within <FormField>");
  }
  return fieldContext;
};

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
));
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  return (
    <Label
      ref={ref}
      className={cn("", className)}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  return <div ref={ref} {...props} />;
});
FormControl.displayName = "FormControl";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error } = useFormField();
  const message = error?.message;
  if (!message && !children) return null;
  return (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-red-500", className)}
      {...props}
    >
      {children || message}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  useFormField,
};
