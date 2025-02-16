
import { Link } from "react-router-dom";

interface MobileMenuProps {
  isOpen: boolean;
  navigation: Array<{ name: string; href: string }>;
  isActive: (path: string) => boolean;
  session: any;
  isLoading: boolean;
  handleSignOut: () => void;
  onClose: () => void;
}

export const MobileMenu = ({
  isOpen,
  navigation,
  isActive,
  session,
  isLoading,
  handleSignOut,
  onClose,
}: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="sm:hidden bg-white/30 backdrop-blur-sm">
      <div className="space-y-1 pb-3 pt-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
              isActive(item.href)
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
            }`}
            onClick={onClose}
          >
            {item.name}
          </Link>
        ))}
        {!isLoading && (
          <>
            {session ? (
              <button
                onClick={() => {
                  handleSignOut();
                  onClose();
                }}
                className="block w-full text-left border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
              >
                Sign Out
              </button>
            ) : (
              <div className="border-t border-gray-200 pt-4 pb-3">
                <Link
                  to="/auth"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  onClick={onClose}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?signup=true"
                  className="block px-4 py-2 text-base font-medium bg-primary-600 text-white hover:bg-primary-700"
                  onClick={onClose}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
