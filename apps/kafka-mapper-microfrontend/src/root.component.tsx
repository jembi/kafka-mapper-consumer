import { StrictMode, useEffect } from "react";
import App from "./components/App/App";
import "./app.css";

export default function Root(props) {
  useEffect(() => {
    document.title = "FHIR Mapper";
  }, []);
  return (
    <>
      <App />
    </>
  );
}
