import { css, jsx } from '@emotion/react';

type BannerColor = 'primary' | 'accent' | 'dark';

type Props = {
    color?: BannerColor;
    component?: React.ElementType;
    showArrow?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
};

const styles = {
    root: css({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '4rem',
        padding: '0.625rem 0.875rem',
        borderRadius: '5px',
        '@media (min-width: 768px)': {
            padding: '1.5rem 1rem',
            width: '10.25rem',
            alignItems: 'flex-start'
        },
        '@media (min-width: 1024px)': {
            width: '15rem',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        }
    })
};

const getBannerColorStyles = (color: BannerColor) => {
    switch (color) {
        case 'primary':
            return {
                backgroundColor: '#dfe7ec',
                '--name-color': '#7191a5',
                '--score-color': '#304859',
            };
        case 'accent':
            return {
                backgroundColor: '#fda214',
                '--name-color': '#fcfcfc',
                '--score-color': '#fcfcfc',
            }
        case 'dark':
            return {
                backgroundColor: '#152938',
                '--name-color': '#fcfcfc',
                '--score-color': '#fcfcfc',
            }
    }
};

export const Banner = ({ component = 'div', color = 'primary', children, showArrow = false, fullWidth = false }: Props) => {
    const rootStyles = css(
        styles.root,
        fullWidth && {
            '@media (min-width: 320px)': {
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            },
        },
        getBannerColorStyles(color),
        showArrow && {
            ':before': {
                content: `''`,
                position: 'absolute',
                width: '1.5rem',
                height: '1.5rem',
                backgroundColor: '#fda214',
                transform: 'translate(-50%, -50%) rotate(45deg)',
                transformOrigin: 'center center',
                left: '50%',
                top: '0',
            }
        }
    );

    return jsx(component, { css: rootStyles }, children);
};