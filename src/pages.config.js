import Templates from './pages/Templates';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Home from './pages/Home';
import __Layout from './Layout.jsx';

export const PAGES = {
    "Templates": Templates,
    "Dashboard": Dashboard,
    "Editor": Editor,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};