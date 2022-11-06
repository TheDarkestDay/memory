import { css } from '@emotion/react';
import { Button } from '../common/button';

import { Dialog } from "../common/dialog";

type Props = {
    isGameFinished: boolean;
    onClose: () => void;
    onStartButtonClick: () => void;
};

const styles = {
    root: css({
        padding: '1.5rem',
        width: 'calc(100% - 3rem)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    })
};

export const MobileMenuDialog = ({onClose, onStartButtonClick, isGameFinished}: Props) => {
    return (
        <Dialog styles={styles.root}>
            <Button onClick={onStartButtonClick} variant="primary">
                {isGameFinished ? 'Restart' : 'Start'}
            </Button>
            <Button variant="secondary" to="/">
                New Game
            </Button>
            <Button variant="secondary" onClick={onClose}>
                Resume Game
            </Button>
        </Dialog>
    );
};