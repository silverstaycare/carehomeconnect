
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";

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
}

const InquiriesTab = ({ propertyId, isOwner }: InquiriesTabProps) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

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
        
        // Mark inquiries as viewed if owner is viewing them
        if (isOwner && data && data.some(inquiry => inquiry.status === 'pending')) {
          const pendingInquiryIds = data
            .filter(inquiry => inquiry.status === 'pending')
            .map(inquiry => inquiry.id);
            
          await supabase
            .from('inquiries')
            .update({ status: 'viewed' })
            .in('id', pendingInquiryIds);
        }
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInquiries();
  }, [propertyId, isOwner]);

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
                <div className="flex gap-2 items-center">
                  {inquiry.status === 'pending' && (
                    <Badge variant="default" className="bg-amber-500">New</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-3">
                <p><span className="font-medium">Phone:</span> {inquiry.phone || 'Not provided'}</p>
                <p><span className="font-medium">Email:</span> {inquiry.email}</p>
              </div>
              <div className="mb-2">
                <p className="font-medium text-sm mb-1">Message:</p>
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
