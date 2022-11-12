import { css, jsx } from '@emotion/react';

type Props = {
    color?: 'primary' | 'accent'
    component?: React.ElementType;
    showArrow?: boolean;
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
        backgroundColor: '#dfe7ec',
        padding: '0.625rem 0.875rem',
        '--name-color': '#7191a5',
        '--score-color': '#304859',
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

export const Banner = ({ component = 'div', color = 'primary', children, showArrow = false }: Props) => {
    const rootStyles = css(
        styles.root,
        color === 'accent' && {
            backgroundColor: '#fda214',
            '--name-color': '#fcfcfc',
            '--score-color': '#fcfcfc',
        },
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