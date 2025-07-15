"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Spinner,
  IconButton,
  Input,
  Stack,
  Text,
  CloseButton
} from "@chakra-ui/react";
import { FiEdit2 } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";
import { saveAs } from "file-saver";

interface Scholarship {
  id: string;
  applicant_name: string;
  email: string;
  status: string;
  award_amount: number | null;
  award_date: string | null;
  created_at: string;
}

const showToast = (message: string, type: 'success' | 'error') => {
  console.log(`${type.toUpperCase()}: ${message}`);
  if (type === 'error') {
    alert(`Error: ${message}`);
  }
};

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Scholarship | null>(null);
  const [form, setForm] = useState({ status: '', award_amount: '', award_date: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchScholarships = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("scholarships").select("*").order("created_at", { ascending: false });
    if (error) {
      showToast("Error fetching scholarships", "error");
    } else {
      setScholarships(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleOpenEdit = (sch: Scholarship) => {
    setForm({
      status: sch.status || '',
      award_amount: sch.award_amount?.toString() || '',
      award_date: sch.award_date || ''
    });
    setSelected(sch);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const { error } = await supabase.from("scholarships").update({
      status: form.status,
      award_amount: form.award_amount ? Number(form.award_amount) : null,
      award_date: form.award_date || null
    }).eq("id", selected.id);
    if (error) {
      showToast("Error updating scholarship", "error");
    } else {
      showToast("Scholarship updated", "success");
      fetchScholarships();
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  // CSV export utility
  const exportCSV = () => {
    const csvRows = [
      ["Applicant", "Email", "Status", "Award Amount", "Award Date", "Created"],
      ...scholarships.map(s => [s.applicant_name, s.email, s.status, s.award_amount || '', s.award_date || '', s.created_at])
    ];
    const csvContent = csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `scholarships-${new Date().toISOString().slice(0,10)}.csv`);
  };

  // Basic stats
  const totalApplications = scholarships.length;
  const receivedCount = scholarships.filter(s => s.status === 'received').length;
  const totalAwarded = scholarships.reduce((sum, s) => sum + (s.award_amount || 0), 0);

  return (
    <Box maxW="6xl" mx="auto" mt={10} p={8} borderWidth={1} borderRadius="lg" boxShadow="md" bg="white" borderColor="gray.300">
      <Heading mb={2} color="black">Scholarship Management</Heading>
      <Box mb={6} color="gray.700" fontWeight="medium">
        Total applications: {totalApplications} | Received: {receivedCount} | Total awarded: ${totalAwarded.toLocaleString()}
      </Box>
      <Button colorScheme="gray" size="sm" mb={4} onClick={exportCSV} mr={2}>Export CSV</Button>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <Spinner size="xl" />
        </Box>
      ) : (
        <Box overflowX="auto">
          <Box border="1px" borderColor="gray.300" borderRadius="md" bg="white">
            <Box bg="gray.100" p={4} borderBottom="1px" borderColor="gray.300">
              <Stack direction="row" align="center" fontSize="sm" fontWeight="semibold">
                <Box flex="2" color="black">Applicant</Box>
                <Box flex="3" color="black">Email</Box>
                <Box flex="1" color="black">Status</Box>
                <Box flex="2" color="black">Award Amount</Box>
                <Box flex="2" color="black">Award Date</Box>
                <Box flex="1" color="black">Actions</Box>
              </Stack>
            </Box>
            {scholarships.map((sch, idx) => (
              <Box
                key={sch.id}
                p={4}
                borderBottom={idx < scholarships.length - 1 ? "1px" : "none"}
                borderColor="gray.300"
                _hover={{ bg: "gray.50" }}
                bg="white"
              >
                <Stack direction="row" align="center" fontSize="sm">
                  <Box flex="2">{sch.applicant_name}</Box>
                  <Box flex="3">{sch.email}</Box>
                  <Box flex="1">
                    <Text px={2} py={1} bg={sch.status === 'received' ? 'green.100' : 'yellow.100'} color={sch.status === 'received' ? 'green.800' : 'yellow.800'} borderRadius="md" fontSize="xs" fontWeight="medium" display="inline-block">
                      {sch.status}
                    </Text>
                  </Box>
                  <Box flex="2">{sch.award_amount ? `$${sch.award_amount}` : '-'}</Box>
                  <Box flex="2">{sch.award_date ? new Date(sch.award_date).toLocaleDateString() : '-'}</Box>
                  <Box flex="1">
                    <IconButton aria-label="Edit" size="sm" onClick={() => handleOpenEdit(sch)} variant="ghost" colorScheme="blue">
                      <FiEdit2 />
                    </IconButton>
                  </Box>
                </Stack>
              </Box>
            ))}
            {scholarships.length === 0 && (
              <Box p={8} textAlign="center" color="gray.500" bg="white">
                No scholarship applications found.
              </Box>
            )}
          </Box>
        </Box>
      )}
      {/* Edit Modal */}
      {isModalOpen && selected && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="modal"
        >
          <Box
            bg="white"
            borderRadius="lg"
            boxShadow="xl"
            maxW="md"
            w="full"
            mx={4}
            maxH="90vh"
            overflowY="auto"
            border="1px"
            borderColor="gray.300"
          >
            <Box p={6} borderBottom="1px" borderColor="gray.300" bg="gray.100">
              <Stack direction="row" align="center" justify="space-between">
                <Heading size="lg">Edit Scholarship</Heading>
                <CloseButton onClick={handleCloseModal} />
              </Stack>
            </Box>
            <form onSubmit={handleSubmit}>
              <Box p={6} bg="white">
                <Stack gap={4}>
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">Status</Text>
                    <select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white', color: '#374151' }}
                    >
                      <option value="applied">Applied</option>
                      <option value="received">Received</option>
                    </select>
                  </Box>
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">Award Amount</Text>
                    <Input type="number" value={form.award_amount} onChange={e => setForm(f => ({ ...f, award_amount: e.target.value }))} placeholder="Enter award amount" min={0} bg="white" borderColor="gray.300" />
                  </Box>
                  <Box>
                    <Text mb={2} fontSize="sm" fontWeight="medium">Award Date</Text>
                    <Input type="date" value={form.award_date} onChange={e => setForm(f => ({ ...f, award_date: e.target.value }))} bg="white" borderColor="gray.300" />
                  </Box>
                </Stack>
              </Box>
              <Box p={6} borderTop="1px" borderColor="gray.300" bg="gray.100">
                <Stack direction="row" gap={3} justify="flex-end">
                  <Button onClick={handleCloseModal} variant="ghost">Cancel</Button>
                  <Button colorScheme="teal" type="submit">Update</Button>
                </Stack>
              </Box>
            </form>
          </Box>
        </Box>
      )}
    </Box>
  );
} 