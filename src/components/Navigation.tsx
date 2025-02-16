
import { useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigationMenu } from "./navigation/NavigationMenu";
import { MobileMenu } from "./navigation/MobileMenu";
import { useNavigation } from "./navigation/useNavigation";
import { Link } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  const {
    isOpen,
    setIsOpen,
    session,
    isLoading,
    navigation,
    handleSignOut,
  } = useNavigation();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") {
      return false;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/30 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                SustainWDN™
              </Link>
            </div>
          </div>

          <NavigationMenu
            navigation={navigation}
            isActive={isActive}
            session={session}
            isLoading={isLoading}
            handleSignOut={handleSignOut}
          />

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <MobileMenu
        isOpen={isOpen}
        navigation={navigation}
        isActive={isActive}
        session={session}
        isLoading={isLoading}
        handleSignOut={handleSignOut}
        onClose={() => setIsOpen(false)}
      />
    </nav>
  );
};

export default Navigation;
