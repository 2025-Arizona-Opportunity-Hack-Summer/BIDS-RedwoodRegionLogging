"use client"

import { ToastProvider } from "./toast"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ColorModeProvider {...props}>
      <ToastProvider>
        {props.children}
      </ToastProvider>
    </ColorModeProvider>
  )
}