import { css } from '@emotion/react';

type Props = {
  children: React.ReactNode;
};

export const FlexItem = ({children}: Props) => {
  const rootCss = css({
    flexGrow: 1,
  });

  return (
    <div css={rootCss}>
      {children}
    </div>
  );
};