"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Box, Button, Heading, Spinner } from "@chakra-ui/react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <Spinner size="xl" mt={20} />;

  return (
    <Box maxW="lg" mx="auto" mt={20} p={8} borderWidth={1} borderRadius="lg" boxShadow="md">
      <Heading mb={6}>Admin Dashboard</Heading>
      <Box mb={4}>Welcome, {user?.email}!</Box>
      <Link href="/admin/users"><Button colorScheme="teal" mb={4} mr={2}>User Management</Button></Link>
      <Link href="/admin/scholarships"><Button colorScheme="purple" mb={4} mr={2}>Scholarship Management</Button></Link>
      <Link href="/admin/events"><Button colorScheme="orange" mb={4} mr={2}>Event Management</Button></Link>
      <Button colorScheme="red" onClick={handleLogout}>Logout</Button>
    </Box>
  );
} 