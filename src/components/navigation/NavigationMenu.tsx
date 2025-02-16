
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface NavigationMenuProps {
  navigation: Array<{ name: string; href: string }>;
  isActive: (path: string) => boolean;
  session: any;
  isLoading: boolean;
  handleSignOut: () => void;
}

export const NavigationMenu = ({
  navigation,
  isActive,
  session,
  isLoading,
  handleSignOut,
}: NavigationMenuProps) => {
  return (
    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
      {navigation.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
            isActive(item.href)
              ? "border-b-2 border-primary-500 text-gray-900"
              : "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          {item.name}
        </Link>
      ))}
      {!isLoading && (
        <>
          {session ? (
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/auth?signup=true">
                <Button variant="default" className="bg-primary-600 hover:bg-primary-700 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};
