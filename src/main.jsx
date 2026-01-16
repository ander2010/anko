/**
=========================================================
* Material Tailwind Dashboard React - v2.1.0
=========================================================
* Product Page: https://www.creative-tim.com/product/material-tailwind-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-tailwind-dashboard-react/blob/main/LICENSE.md)
* Coded by Creative Tim
=========================================================
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@material-tailwind/react";
import { MaterialTailwindControllerProvider } from "@/context";
import { ProjectsProvider } from "@/context/projects-context";
import AuthProvider from "@/context/auth-context";
import { LanguageProvider } from "@/context/language-context";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "@uppy/dashboard/dist/style.min.css";
import "./styles/tailwind.css";


const GOOGLE_CLIENT_ID = "600601272216-ulj4ihc7ull70lg7p9c2v27fvrslf90d.apps.googleusercontent.com";
console.log("GOOGLE_CLIENT_ID hardcoded:", GOOGLE_CLIENT_ID);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <ThemeProvider>
          <MaterialTailwindControllerProvider>
            <AuthProvider>
              <LanguageProvider>
                <ProjectsProvider>
                  <App />
                </ProjectsProvider>
              </LanguageProvider>
            </AuthProvider>
          </MaterialTailwindControllerProvider>
        </ThemeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

