import { css, SerializedStyles } from '@emotion/react';
import { ContentCopyRound } from '@ricons/material';
import { Icon } from '@ricons/utils';

type Props = {
    icon: 'copy';
    onClick?: () => void;
    styles?: SerializedStyles;
};

const styles = {
    root: css({
        border: 'none',
        background: 'transparent',
        ':hover': {
            'path': {
                fill: '#7191a5'
            }
        }
    })
};

const getIconComponent = (icon: Props['icon']) => {
    switch (icon) {
        case 'copy':
            return <ContentCopyRound />;
    }
}

export const IconButton = ({icon, onClick}: Props) => {
    return (
        <button css={styles.root} onClick={onClick}>
            <Icon size="2rem">
                {getIconComponent(icon)}
            </Icon>
        </button>
    );    
};