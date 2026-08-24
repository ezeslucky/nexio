import { IconButton } from '@nexio/component';
import { RightSidebarIcon } from '@canvas/icons/rc';

import * as styles from './sidebar-header.css';

export type HeaderProps = {
  onToggle?: () => void;
  children?: React.ReactNode;
};

function Container({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div data-testid="header" style={style} className={className}>
      {children}
    </div>
  );
}

const ToggleButton = ({ onToggle }: { onToggle?: () => void }) => {
  return (
    <IconButton size="24" onClick={onToggle} data-testid="right-sidebar-close">
      <RightSidebarIcon />
    </IconButton>
  );
};

export const Header = ({ children, onToggle }: HeaderProps) => {
  return (
    <Container className={styles.header}>
      {children}
      {!BUILD_CONFIG.isElectron && (
        <>
          <div className={styles.spacer} />
          <ToggleButton onToggle={onToggle} />
        </>
      )}
    </Container>
  );
};
