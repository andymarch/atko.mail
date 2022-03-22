import { useEffect, useState } from 'react';
export const useDarkMode = () => {
    const [theme, setTheme] = useState('light');

    const setMode = mode => {
        window.localStorage.setItem('theme', mode)
        setTheme(mode)
    };

    const themeToggler = () => {
        theme === 'light' ? setMode('dark') : setMode('light')
    };

    useEffect(() => {

        const localTheme = window.localStorage.getItem('theme');
        if(localTheme){
            setTheme(localTheme)
        } else {
            var browserPreference = 'light'
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                browserPreference = 'dark'
            }
            setTheme(browserPreference)
        }
    }, []);
    return [theme, themeToggler]
};
