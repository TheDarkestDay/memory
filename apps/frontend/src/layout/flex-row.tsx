import { css, SerializedStyles, jsx } from '@emotion/react';
import { CSSProperties } from 'react';

type Props = {
  children: React.ReactNode;
  component?: React.ElementType;
  styles?: SerializedStyles;
  justifyContent?: CSSProperties['justifyContent'];
  gap?: string;
};

export const FlexRow = ({children, gap, styles, justifyContent = 'flex-start', component = 'div'}: Props) => {
  const rootCss = css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent,
    gap,
  }, styles);

  return jsx(component, {css: rootCss}, children);
};