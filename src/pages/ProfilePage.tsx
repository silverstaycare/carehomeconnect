
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters",
  }),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  } | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      phone: "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    async function fetchProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(data);
      
      // Set form values
      const displayName = [data?.first_name, data?.last_name].filter(Boolean).join(' ') || "";
      
      form.reset({
        displayName,
        phone: data?.phone || "",
        email: user?.email || "",
      });
    }

    fetchProfile();
  }, [user, navigate, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Split display name into first name and last name
      const nameParts = data.displayName.trim().split(' ');
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name,
          last_name,
          phone: data.phone || null
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const userInitials = [
    profile?.first_name?.charAt(0) || "",
    profile?.last_name?.charAt(0) || "",
  ].join('').toUpperCase();

  return (
    <div className="container py-8 px-4 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

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
    </div>
  );
}
