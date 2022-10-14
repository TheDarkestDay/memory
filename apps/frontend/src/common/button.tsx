import { css, SerializedStyles } from '@emotion/react';
import { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  styles?: SerializedStyles;
  to?: string;
  onClick?: () => void;
  size?: 'md' | 'lg';
} & ButtonHTMLAttributes<HTMLButtonElement>;

const primaryColors = css({
  '--bg-color': '#fda214',
  '--text-color': '#fcfcfc',
  '--hover-color': '#ffb84a',
});

const secondaryColors = css({
  '--bg-color': '#dfe7ec',
  '--text-color': '#304859',
  '--hover-color': '#6395b8',
});

export const Button = ({children, onClick, variant, styles, type, size = 'md', to}: Props) => {
  const colors = variant === 'primary' ? primaryColors : secondaryColors;
  const rootCss = css({
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-color)',
    padding: size === 'lg' ? '1rem' : '1rem 1.5rem',
    borderRadius: '35px',
    fontWeight: 'bold',
    fontSize: size === 'lg' ? '2rem' : '1.25rem',
    minWidth: '8rem',
    border: 'none',
    ':hover': {
      backgroundColor: 'var(--hover-color)',
      color: '#fcfcfc',
    }
  }, colors, styles);

  if (to != null) {
    const linkCss = css(rootCss, {
      textDecoration: 'none',
    });

    return (
      <Link css={linkCss} to={to}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} css={rootCss} type={type}>
      {children}
    </button>
  );
};