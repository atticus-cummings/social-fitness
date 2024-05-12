import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router-dom";

import Home from '/Home'

const router = createBrowserRouter([]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Home></Home>
    </React.StrictMode>
)