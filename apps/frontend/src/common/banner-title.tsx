import { css } from '@emotion/react';

type Props = {
    children: React.ReactNode;
};

const styles = {
    root: css({
        color: 'var(--name-color)',
        fontSize: '0.9375rem',
        fontWeight: 'bold',
        '@media (min-width: 1024px)': {
            fontSize: '1.25rem'
        }
    })
};

export const BannerTitle = ({children}: Props) => {
    return (
        <span css={styles.root}>
            {children}
        </span>
    );
};