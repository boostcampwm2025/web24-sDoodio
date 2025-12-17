export type RoutePath = '/' | '/all-habits' | '/stats' | '/myroom';

export interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}
