import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import { AuthProvider } from "./context/AuthContext"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.min.js"

ReactDOM.render(
  <AuthProvider>
    <App />
  </AuthProvider>,
  document.getElementById("root")
)
