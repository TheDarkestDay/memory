import { css } from '@emotion/react';

type Props = {
  children: React.ReactNode;
  basis?: string;
};

export const FlexItem = ({children, basis = 'auto'}: Props) => {
  const rootCss = css({
    flexGrow: 1,
    flexBasis: basis,
  });

  return (
    <div css={rootCss}>
      {children}
    </div>
  );
};