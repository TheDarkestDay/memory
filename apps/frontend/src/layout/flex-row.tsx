import { css, SerializedStyles, jsx } from '@emotion/react';
import { CSSProperties } from 'react';

type Props = {
  children: React.ReactNode;
  component?: React.ElementType;
  styles?: SerializedStyles;
  justifyContent?: CSSProperties['justifyContent'];
  alignItems?: CSSProperties['alignItems'];
  gap?: string;
};

export const FlexRow = ({children, gap, styles, justifyContent = 'flex-start', alignItems = 'center', component = 'div'}: Props) => {
  const rootCss = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent,
    alignItems,
    gap,
  }, styles);

  return jsx(component, {css: rootCss}, children);
};