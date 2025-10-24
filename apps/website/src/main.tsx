import "./index.css";
import "./assets/fonts/Geist/Geist-Regular.ttf";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./components/theme.provider.tsx";
import { Page } from "./page.tsx";

const rootElement = document.getElementById("root");
if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
				<Page />
			</ThemeProvider>
		</StrictMode>,
	);
}
