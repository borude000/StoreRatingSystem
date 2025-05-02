import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

export default function UserAvatar() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Get initials from user's name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="flex items-center space-x-3">
      <span className="hidden md:inline text-slate-600">
        Welcome, <span className="font-medium">{user.name}</span>
      </span>
      <Avatar className="bg-slate-100 h-8 w-8">
        <AvatarFallback className="text-slate-500 text-sm">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
