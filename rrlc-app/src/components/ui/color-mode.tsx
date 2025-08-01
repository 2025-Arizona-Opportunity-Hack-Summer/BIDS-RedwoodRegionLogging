"use client"

import { ThemeProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import * as React from "react"
import { LuMoon, LuSun } from "react-icons/lu"
import { Button } from "./button"

export type ColorModeProviderProps = ThemeProviderProps

export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  )
}

export type ColorMode = "light" | "dark"

export interface UseColorModeReturn {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme()
  const colorMode = forcedTheme || resolvedTheme
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }
  return {
    colorMode: colorMode as ColorMode,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? dark : light
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? <LuMoon /> : <LuSun />
}

interface ColorModeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { toggleColorMode } = useColorMode()
  return (
    <Button
      onClick={toggleColorMode}
      variant="ghost"
      size="icon"
      aria-label="Toggle color mode"
      ref={ref}
      {...props}
    >
      <ColorModeIcon />
    </Button>
  )
})

export const LightMode = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function LightMode(props, ref) {
    return (
      <span
        className="contents text-foreground light"
        ref={ref}
        {...props}
      />
    )
  },
)

export const DarkMode = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function DarkMode(props, ref) {
    return (
      <span
        className="contents text-foreground dark"
        ref={ref}
        {...props}
      />
    )
  },
)
