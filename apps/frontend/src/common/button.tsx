import { css, SerializedStyles } from '@emotion/react';
import { ButtonHTMLAttributes } from 'react';

type Props = {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  styles?: SerializedStyles;
  onClick?: () => void;
  size?: 'md' | 'lg';
} & ButtonHTMLAttributes<HTMLButtonElement>;

const primaryColors = css({
  backgroundColor: '#fda214',
  color: '#fcfcfc',
});

const secondaryColors = css({
  backgroundColor: '#dfe7ec',
  color: '#304859',
});

export const Button = ({children, onClick, variant, styles, type, size = 'md'}: Props) => {
  const colors = variant === 'primary' ? primaryColors : secondaryColors;
  const rootCss = css({
    backgroundColor: '#fda214',
    color: '#fcfcfc',
    padding: size === 'lg' ? '1rem' : '1rem 1.5rem',
    borderRadius: '35px',
    fontWeight: 'bold',
    fontSize: size === 'lg' ? '2rem' : '1.25rem',
    minWidth: '8rem',
    border: 'none',
  }, colors, styles);

  return (
    <button onClick={onClick} css={rootCss} type={type}>
      {children}
    </button>
  );
};