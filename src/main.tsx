
import { createRoot } from "react-dom/client";
import { P2PProvider } from "./context/P2PContext.tsx";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <P2PProvider>
        <App />
    </P2PProvider>
);
