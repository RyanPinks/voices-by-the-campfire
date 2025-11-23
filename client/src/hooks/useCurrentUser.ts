import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useCurrentUser() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  return {
    user,
    isLoading,
  };
}
