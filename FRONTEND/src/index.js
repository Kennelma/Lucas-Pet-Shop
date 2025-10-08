import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import 'core-js'
import App from './App'
import store from './store'

import './tailwind.css'


import 'primereact/resources/themes/lara-light-indigo/theme.css';  
import 'primereact/resources/primereact.min.css';                  
import 'primeicons/primeicons.css';   

                           
                            

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
