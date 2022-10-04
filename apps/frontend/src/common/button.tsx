import { css, SerializedStyles } from '@emotion/react';
import { ButtonHTMLAttributes } from 'react';

type Props = {
  children: React.ReactNode;
  styles?: SerializedStyles;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({children, styles, type}: Props) => {
  const rootCss = css({
    backgroundColor: '#fda214',
    color: '#fcfcfc',
    paddingTop: '1rem',
    paddingBottom: '1rem',
    borderRadius: '35px',
    fontWeight: 'bold',
    fontSize: '32px',
    border: 'none',
  }, styles);

  return (
    <button css={rootCss} type={type}>
      {children}
    </button>
  );
};