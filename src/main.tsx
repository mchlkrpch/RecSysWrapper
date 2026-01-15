// @ts-expect-error react for no warning
import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import store from './storage.tsx'
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
)
