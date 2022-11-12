import { css } from '@emotion/react';

type Props = {
    children: React.ReactNode;
};

const styles = {
    root: css({
        color: 'var(--score-color)',
        fontSize: '1.5rem',
        '@media (min-width: 1024px)': {
            fontSize: '2rem'
        },
    })
};

export const BannerValue = ({ children }: Props) => {
    return (
        <span css={styles.root}>
            {children}
        </span>
    );
};