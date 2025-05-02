import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import UpdatePasswordForm from "@/components/update-password-form";

export default function UserAccount() {
  const { user } = useAuth();
  
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
              <CardTitle>Account Information</CardTitle>
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
