import { css, SerializedStyles } from '@emotion/react';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { APP_ROOT_ELEMENT_ID, forceLayout } from './dom';

type Props = {
  children: React.ReactNode;
  ariaLabel?: string;
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

const DIALOG_SLOT_ELEMENT = document.getElementById('dialog-slot');

export const Dialog = ({ children, styles: externalStyles, ariaLabel, onClose }: Props) => {
  const [isDialogRevealed, setDialogRevealed] = useState(false);
  const dialogTransforms = isDialogRevealed ? { opacity: '1', transform: 'translateY(0)' } : { opacity: '0', transform: 'translateY(-100%)' };
  const dialogStyles = css(
    styles.dialog,
    dialogTransforms,
    externalStyles
  );
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  if (DIALOG_SLOT_ELEMENT == null) {
    throw new Error('Cannot use dialogs without dialog slot element present');
  }

  useEffect(() => {
    const dialogElement = dialogRef.current;

    if (dialogElement == null) {
      return;
    }


    forceLayout();
    setDialogRevealed(true);

    dialogElement.focus();

    return () => setDialogRevealed(false);
  }, [setDialogRevealed]);

  useEffect(() => {
    const rootElement = document.getElementById(APP_ROOT_ELEMENT_ID);
    if (rootElement == null) {
      return;
    }

    rootElement.setAttribute('inert', 'true');
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: Event) => {
      if ((event as unknown as KeyboardEvent).key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'auto';
      rootElement.removeAttribute('inert');

      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div css={styles.backdrop} onClick={onClose}>
      <dialog ref={dialogRef} css={dialogStyles} open tabIndex={-1} aria-label={ariaLabel}>
        {children}
      </dialog>
    </div>,
    DIALOG_SLOT_ELEMENT
  );
};