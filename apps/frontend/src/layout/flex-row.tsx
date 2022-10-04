import { css } from '@emotion/react';

type Props = {
  children: React.ReactNode;
  gap?: string;
};

export const FlexRow = ({children, gap}: Props) => {
  const rootCss = css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap
  });

  return (
    <div css={rootCss}>
      {children}
    </div>
  );
};