"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Box, Flex, Spacer, Button } from "@chakra-ui/react";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <Box as="nav" p={4} borderBottomWidth={1} mb={4}>
      <Flex align="center">
        <Box fontWeight="bold">RRLC App</Box>
        <Spacer />
        {user ? (
          <Button colorScheme="red" size="sm" onClick={handleLogout}>Logout</Button>
        ) : (
          <Link href="/login"><Button colorScheme="teal" size="sm">Login</Button></Link>
        )}
      </Flex>
    </Box>
  );
} 