import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { CampaignProvider } from "./utils/campaignContext.jsx";
import { ChakraProvider } from '@chakra-ui/react';


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CampaignProvider>
        <ChakraProvider>
          <App />
        </ChakraProvider>
      </CampaignProvider>
    </BrowserRouter>
  </StrictMode>
);
