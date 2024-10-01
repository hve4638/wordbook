import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './style';
import App from './App';
import { PageContextProvider } from 'contexts/PageContext'
import { MemoryContextProvider } from 'contexts/MemoryContext'
import { EventContextProvider } from 'contexts/EventContext';
import { ConfigContextProvider } from 'contexts/ConfigContext';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <ConfigContextProvider>
    <PageContextProvider>
    <MemoryContextProvider>
    <EventContextProvider>
        <App/>
    </EventContextProvider>
    </MemoryContextProvider>
    </PageContextProvider>
    </ConfigContextProvider>
);