import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  name: string;
  email: string;
  avatar: string | null;
}

interface UserInfoProps {
  user: User;
  fallback: string;
}

export function UserInfo({ user, fallback }: UserInfoProps) {
  return (
    <>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage alt={user.name} src={user.avatar ?? ""} />
        <AvatarFallback className="rounded-lg">{fallback}</AvatarFallback>
      </Avatar>

      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{user.name}</span>
        <span className="truncate text-xs">{user.email}</span>
      </div>
    </>
  );
}
