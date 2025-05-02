import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import UpdatePasswordForm from "@/components/update-password-form";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function OwnerAccount() {
  const { user } = useAuth();
  
  const { data: storeData, isLoading } = useQuery({
    queryKey: ["/api/owner/dashboard"],
    enabled: !!user,
  });
  
  if (!user) return null;
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold">My Account</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="store-name">Store Name</Label>
                    <Input 
                      id="store-name" 
                      value={storeData?.store?.name || "Not assigned to a store"} 
                      disabled 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="store-email">Email</Label>
                    <Input 
                      id="store-email" 
                      value={storeData?.store?.email || ""} 
                      disabled 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="store-address">Address</Label>
                    <Textarea 
                      id="store-address" 
                      value={storeData?.store?.address || ""} 
                      disabled 
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={user.name} disabled />
                </div>
                
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={user.username} disabled />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled />
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" value={user.address} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <UpdatePasswordForm />
        </div>
      </div>
    </div>
  );
}
