/**
 * JobGraph Component System Registry
 * Unified exports for the 20 global components and supporting elements
 */

// 1. Navbar
export { Navbar } from './Navbar';
export type { NavbarProps } from './Navbar';

// 2. Sidebar
export { Sidebar } from './Sidebar';
export type { SidebarProps, SidebarItem } from './Sidebar';

// 3. Button
// 4. Input
// 5. Select
// 6. Multi-select skill input
export {
  Button,
  Input,
  Select,
  MultiSelectSkillInput
} from './FormControls';
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  InputProps,
  SelectProps,
  SelectOption,
  MultiSelectSkillInputProps,
  SkillOptionItem
} from './FormControls';

// 7. Skill chip
// 8. Match badge
// 9. Match progress bar
// 10. KPI card
// 11. Job card
// 12. Table
// 16. Empty state
// 17. Error state
// 18. Skeleton loader
// 19. Loading spinner
export {
  SkillChip,
  MatchBadge,
  MatchProgressBar,
  KpiCard,
  JobCard,
  Table,
  EmptyState,
  ErrorState,
  Skeleton,
  CardSkeleton,
  LoadingSpinner,
  getMatchTier
} from './DataDisplay';
export type {
  SkillChipProps,
  MatchBadgeProps,
  MatchProgressBarProps,
  KpiCardProps,
  JobCardProps,
  TableProps,
  TableColumn,
  EmptyStateProps,
  ErrorStateProps,
  SkeletonProps,
  LoadingSpinnerProps
} from './DataDisplay';

// 13. Modal
// 14. Drawer
// 20. Confirmation dialog
export {
  Modal,
  Drawer,
  ConfirmationDialog
} from './Overlays';
export type {
  ModalProps,
  DrawerProps,
  ConfirmationDialogProps
} from './Overlays';

// 15. Toast notification
export {
  ToastProvider,
  useToast,
  ToastContainer
} from './ToastNotification';
export type {
  ToastType,
  ToastItem
} from './ToastNotification';

// Branded Initial Loading Screen
export { BrandedLoadingScreen } from './BrandedLoadingScreen';

// Motion System
export {
  usePrefersReducedMotion,
  AnimatedCounter,
  MotionFade
} from './Motion';

// Core Design Tokens
export {
  Card,
  Badge,
  MatchIndicator
} from './DesignTokens';

// Graph Concept Motif
export { GraphMotif } from './GraphMotif';
export type { GraphMotifProps } from './GraphMotif';
