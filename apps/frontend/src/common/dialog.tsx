import { css, SerializedStyles } from '@emotion/react';

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
  }),
};

export const Dialog = ({children, styles: externalStyles, onClose}: Props) => {
  const dialogStyles = css(styles.dialog, externalStyles);

  return (
    <div css={styles.backdrop} onClick={onClose}>
      <dialog css={dialogStyles} open>
        {children}
      </dialog>
    </div>
  );
};