
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Inquiry {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  message: string;
  created_at: string;
  status: string | null;
}

interface InquiriesTabProps {
  propertyId: string;
  isOwner: boolean;
  activeTab?: string;
}

const InquiriesTab = ({ propertyId, isOwner, activeTab }: InquiriesTabProps) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch inquiries when the component mounts or when activeTab changes to "inquiries"
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .eq('care_home_id', propertyId)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setInquiries(data || []);
        
        // Mark inquiries as viewed if owner is viewing them and the inquiries tab is active
        if (isOwner && activeTab === "inquiries") {
          const pendingInquiries = data ? data.filter(inquiry => inquiry.status === 'pending') : [];
          
          if (pendingInquiries.length > 0) {
            const pendingInquiryIds = pendingInquiries.map(inquiry => inquiry.id);
            
            // Update the status in Supabase
            const { error: updateError } = await supabase
              .from('inquiries')
              .update({ status: 'viewed' })
              .in('id', pendingInquiryIds);
              
            if (updateError) {
              console.error('Error updating inquiry status:', updateError);
              return;
            }
              
            // Update local state to reflect the change
            setInquiries(prevInquiries => 
              prevInquiries.map(inquiry => 
                pendingInquiryIds.includes(inquiry.id) 
                  ? { ...inquiry, status: 'viewed' } 
                  : inquiry
              )
            );
          }
        }
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInquiries();
    
    // Set up a real-time subscription to listen for new inquiries
    const channel = supabase
      .channel('inquiries-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'inquiries',
        filter: `care_home_id=eq.${propertyId}`
      }, (payload) => {
        // Add the new inquiry to the state
        const newInquiry = payload.new as Inquiry;
        setInquiries(prev => [newInquiry, ...prev]); // Add to the beginning to maintain sort order
        
        // Show a toast notification
        if (activeTab !== 'inquiries') {
          toast({
            title: "New Inquiry",
            description: `New inquiry received from ${newInquiry.name}`,
          });
        }
      })
      .subscribe();
      
    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId, isOwner, activeTab, toast]);

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">You need to be the owner of this property to view inquiries.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (inquiries.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No inquiries have been received for this property yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-6">Property Inquiries</h2>
        <div className="space-y-6">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="border rounded-md p-4 bg-card">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{inquiry.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(inquiry.created_at), 'MMM d, yyyy - h:mm a')}
                </span>
              </div>
              <div className="space-y-2 text-sm mb-3">
                <p><span className="font-medium">Phone:</span> {inquiry.phone || 'Not provided'}</p>
                <p><span className="font-medium">Email:</span> {inquiry.email}</p>
              </div>
              <div className="mt-2">
                <Textarea 
                  value={inquiry.message} 
                  readOnly
                  className="bg-muted/30 resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InquiriesTab;
