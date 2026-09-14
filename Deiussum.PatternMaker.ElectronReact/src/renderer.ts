/**
 * Renderer process entry point. Installs the window.dialogs shim (backed
 * by Tauri's dialog/fs plugins) before rendering the app.
 */
import './index.css';
import './dialogs-bridge';
import './app';
