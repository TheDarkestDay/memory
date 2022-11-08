import { css, SerializedStyles } from '@emotion/react';
import { useEffect, useState } from 'react';
import { forceLayout } from './dom';

type Props = {
  children: React.ReactNode;
  onClose?: () => void;
  styles?: SerializedStyles;
};

const styles = {
  backdrop: css({
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'grid',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  }),
  dialog: css({
    position: 'static',
    margin: 'auto',
    padding: '3rem',
    borderRadius: '20px',
    border: 'none',
    transition: 'all .5s',
  }),
};

export const Dialog = ({ children, styles: externalStyles, onClose }: Props) => {
  const [isDialogRevealed, setDialogRevealed] = useState(false);
  const dialogTransforms = isDialogRevealed ? { opacity: '1', transform: 'translateY(0)' } : { opacity: '0', transform: 'translateY(-100%)' };
  const dialogStyles = css(
    styles.dialog,
    dialogTransforms,
    externalStyles
  );

  const handleDialogRendered = () => {
    forceLayout();
    setDialogRevealed(true);
  };

  useEffect(() => {
    return () => setDialogRevealed(false);
  }, [setDialogRevealed]);

  return (
    <div css={styles.backdrop} onClick={onClose}>
      <dialog ref={handleDialogRendered} css={dialogStyles} open>
        {children}
      </dialog>
    </div>
  );
};