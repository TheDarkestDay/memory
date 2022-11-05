import { Form } from 'react-router-dom';
import { css } from '@emotion/react';
import { Button } from '../common/button';

import { FlexRow, FlexItem } from '../layout';
import { visuallyHidden } from '../utils';

const styles = {
  root: css({
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: '#304859',
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
    '@media (min-width: 768px)': {
      paddingLeft: '0',
      paddingRight: '0',
    }
  }),
  title: css({
    color: '#fcfcfc',
    marginBottom: '2.815rem',
    '@media (min-width: 768px)': {
      marginBottom: '4.875rem'
    }
  }),
  form: css({
    backgroundColor: '#fcfcfc',
    borderRadius: '20px',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '40.625rem',
    '@media (min-width: 768px)': {
      padding: '3.5rem'
    }
  }),
  fieldSet: css({
    marginBottom: '1.5rem',
    border: 'none',
    'media (min-width: 768px)': {
      marginBottom: '2rem'
    }
  }),
  fieldSetTitle: css({
    color: '#7191a5',
    fontSize: '15px',
    fontWeight: 'bold',
    marginBottom: '0.75rem',
    '@media (min-width: 768px)': {
      fontSize: '20px',
      marginBottom: '1rem'
    }
  }),
  chip: css({
    display: 'block',
    textAlign: 'center',
    backgroundColor: '#bcced9',
    color: '#fcfcfc',
    paddingTop: '0.625rem',
    paddingBottom: '0.625rem',
    borderRadius: '26px',
    fontSize: '1rem',
    fontWeight: 'bold',
    'input:checked + &': {
      backgroundColor: '#304859',
    },
    '@media (min-width: 768px)': {
      fontSize: '1.625rem'
    }
  })
};

export const WizardPage = () => {
  return (
    <main css={styles.root}>
      <h1 css={styles.title}>memory</h1>

      <Form css={styles.form} method="post">
        <fieldset css={styles.fieldSet}>
          <legend css={styles.fieldSetTitle}>Select Theme</legend>

          <FlexRow gap="1.875rem">
            <FlexItem>
              <input
                defaultChecked
                css={visuallyHidden}
                id="theme-numbers"
                type="radio"
                name="theme"
                value="numbers"
              />
              <label css={styles.chip} htmlFor="theme-numbers">Numbers</label>
            </FlexItem>

            <FlexItem>
              <input
                css={visuallyHidden}
                id="theme-emojis"
                type="radio"
                name="theme"
                value="emojis"
              />
              <label css={styles.chip} htmlFor="theme-emojis">Emojis</label>
            </FlexItem>
          </FlexRow>
        </fieldset>

        <fieldset css={styles.fieldSet}>
          <legend css={styles.fieldSetTitle}>Number of Players</legend>

          <FlexRow gap="1.375rem">
            <FlexItem>
              <input id="players-one" css={visuallyHidden} type="radio" name="playersCount" value="1" />
              <label css={styles.chip} htmlFor="players-one">1</label>
            </FlexItem>

            <FlexItem>
              <input id="players-two" defaultChecked css={visuallyHidden} type="radio" name="playersCount" value="2" />
              <label css={styles.chip} htmlFor="players-two">2</label>
            </FlexItem>

            <FlexItem>
              <input id="players-three" css={visuallyHidden} type="radio" name="playersCount" value="3" />
              <label css={styles.chip} htmlFor="players-three">3</label>
            </FlexItem>

            <FlexItem>
              <input id="players-four" css={visuallyHidden} type="radio" name="playersCount" value="4" />
              <label css={styles.chip} htmlFor="players-four">4</label>
            </FlexItem>
          </FlexRow>
        </fieldset>

        <fieldset css={styles.fieldSet}>
          <legend css={styles.fieldSetTitle}>Grid Size</legend>

          <FlexRow gap="1.875rem">
            <FlexItem>
              <input id="size-small" defaultChecked css={visuallyHidden} type="radio" name="fieldSize" value="4" />
              <label css={styles.chip} htmlFor="size-small">4x4</label>
            </FlexItem>

            <FlexItem>
              <input id="size-medium" css={visuallyHidden} type="radio" name="fieldSize" value="6" />
              <label css={styles.chip} htmlFor="size-medium">6x6</label>
            </FlexItem>
          </FlexRow>
        </fieldset>

        <Button variant="primary" size="lg" fullWidth type="submit">
          Create Game
        </Button>
      </Form>
    </main>
  );
};
