// src/app/page.tsx
'use client'

import {
  Box,
  Button,
  Checkbox,
  ClientOnly,
  HStack,
  Heading,
  Progress,
  RadioGroup,
  Skeleton,
  VStack,
} from "@chakra-ui/react"

export default function HomePage() {
  return (
    <Box p={8}>
      <Heading mb={4}>Welcome to RRLC Portal</Heading>
      <Button colorScheme="teal">Let's Get Started</Button>
    </Box>
  )
}