/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { Box, Paper, Typography, Alert } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "./AuthContext"; // Assuming your AuthContext export
import { IUserResponse } from "./types"; // Your interface from earlier

export const AdminUserList = () => {
  const [rows, setRows] = useState<IUserResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { authFetch, user: currentUser } = useAuth();

  const loadData = async () => {
    try {
      const res = await authFetch("admin/users");
      if (res.ok) {
        const data = await res.json();
        // Date conversion on arrival
        const formatted = data.map((u: any) => ({
          ...u,
          createdAt: new Date(u.createdAt),
          lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt) : null,
        }));
        setRows(formatted);
      } else {
        setError("Failed to fetch users.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error fetching user list.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (targetId: string) => {
    // Prevent self-deletion
    if (targetId === currentUser?.id) {
      alert("You cannot delete your own admin account.");
      return;
    }

    if (
      !window.confirm("Are you sure you want to permanently delete this user?")
    )
      return;

    try {
      const res = await authFetch(`admin/user/${targetId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Optimistic UI update: remove from local state immediately
        setRows((prev) => prev.filter((row) => row.id !== targetId));
      } else {
        const msg = await res.text();
        alert(`Delete failed: ${msg}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while trying to delete the user.");
    }
  };

  const columns: GridColDef[] = [
    { field: "username", headerName: "Username", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    {
      field: "isAdmin",
      headerName: "Admin",
      type: "boolean",
      width: 100,
    },
    {
      field: "createdAt",
      headerName: "Joined",
      type: "dateTime",
      width: 180,
    },
    {
      field: "lastLoginAt",
      headerName: "Last Seen",
      type: "dateTime",
      width: 180,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon color="error" />}
          label="Delete"
          onClick={() => handleDelete(params.id as string)}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ p: 3, width: "100%", maxWidth: "1200px", mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        User Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          // MUI v9 style: enable toolbar and search
          showToolbar
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          disableRowSelectionOnClick
          // Ensure it handles the 'id' field from your Rust Uuid
          getRowId={(row) => row.id}
        />
      </Paper>
    </Box>
  );
};
