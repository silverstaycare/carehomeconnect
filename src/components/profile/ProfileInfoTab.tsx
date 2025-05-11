
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useProfileData, ProfileFormValues } from "@/hooks/useProfileData";

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters",
  }),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

interface ProfileInfoTabProps {
  user: any;
  onProfileUpdated?: () => void;
}

export function ProfileInfoTab({ user, onProfileUpdated }: ProfileInfoTabProps) {
  const { profile, isSubmitting, updateProfile } = useProfileData(user?.id);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || "",
      phone: profile?.phone || "",
      email: user?.email || "",
    },
  });

  // Update form values when profile data changes
  React.useEffect(() => {
    if (profile) {
      form.reset({
        displayName: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || "",
        phone: profile?.phone || "",
        email: user?.email || "",
      });
    }
  }, [profile, user?.email, form]);

  async function onSubmit(data: ProfileFormValues) {
    const success = await updateProfile(data);
    if (success && onProfileUpdated) {
      onProfileUpdated();
    }
  }

  const userInitials = [
    profile?.first_name?.charAt(0) || "",
    profile?.last_name?.charAt(0) || "",
  ].join('').toUpperCase();

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16 text-xl">
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium text-lg">
            {[profile?.first_name, profile?.last_name].filter(Boolean).join(' ')}
          </h2>
          <p className="text-gray-500">{user?.email}</p>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Login)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Email address" 
                    {...field} 
                    disabled 
                    className="bg-muted cursor-not-allowed" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
