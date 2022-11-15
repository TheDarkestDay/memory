import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import { App } from './app/app';
import { APP_ROOT_ELEMENT_ID } from './common/dom';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById(APP_ROOT_ELEMENT_ID) as HTMLElement
);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
