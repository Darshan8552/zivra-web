import {createContext, useContext, useEffect, useState} from "react";
import {ScriptOnce} from "@tanstack/react-router";

type Theme = 'light' | "dark" | "system"

type ThemeProviderState = {
    theme: Theme,
    setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

const storageKey = "theme"

function getThemeScript(key: string, defaultTheme: Theme) {
    return `(function() {
    try {
      const theme = localStorage.getItem('${key}') || '${defaultTheme}';
      const valid = ['light','dark','system'].includes(theme) ? theme : '${defaultTheme}';
      const resolved = valid === 'system'
        ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : valid;
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
    } catch(e) {}
  })();`
}

export function ThemeProvider({children, defaultTheme = 'system'}: { children: React.ReactNode, defaultTheme?: Theme }) {
    const [theme, setThemeState] = useState<Theme>(defaultTheme)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem(storageKey)
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
            setThemeState(stored)
        }
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return

        const root = document.documentElement
        root.classList.remove('light', 'dark')

        let resolved: 'light' | 'dark'
        if (theme === 'system') {
            resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        } else {
            resolved = theme
        }

        root.classList.add(resolved)
        localStorage.setItem(storageKey, theme)
    }, [theme, mounted])

    useEffect(() => {
        if (!mounted || theme !== 'system') return
        const media = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = () => {
            const root = document.documentElement
            root.classList.remove('light', 'dark')
            root.classList.add(media.matches ? 'dark' : 'light')
        }
        media.addEventListener('change', handler)
        return () => media.removeEventListener('change', handler)
    }, [theme, mounted])

    const setTheme = (t: Theme) => setThemeState(t)

    return (
        <ThemeProviderContext value={{theme, setTheme}}>
            <ScriptOnce>{getThemeScript(storageKey, defaultTheme)}</ScriptOnce>
            {children}
        </ThemeProviderContext>
    )
}

export const useTheme = () => {
    const ctx = useContext(ThemeProviderContext)
    if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
    return ctx
}