
import React from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phone: string;
}

interface ProfileEditFormProps {
  defaultValues: ProfileFormValues;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
}

export function ProfileEditForm({ defaultValues, onSubmit }: ProfileEditFormProps) {
  // Set up form with default values
  const form = useForm<ProfileFormValues>({
    defaultValues
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <label className="text-sm text-gray-500">First Name</label>
                <FormControl>
                  <Input {...field} placeholder="First Name" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <label className="text-sm text-gray-500">Last Name</label>
                <FormControl>
                  <Input {...field} placeholder="Last Name" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <label className="text-sm text-gray-500">Phone</label>
                <FormControl>
                  <Input {...field} placeholder="Phone Number" type="tel" />
                </FormControl>
              </FormItem>
            )}
          />
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="font-medium mt-2">{defaultValues.email}</p>
          </div>
        </div>
      </form>
    </Form>
  );
}
