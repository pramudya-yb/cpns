import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Input } from "@labas/ui/components/input";
import { Button } from "@labas/ui/components/button";
import { toast } from "sonner";

const PAGE_SIZE = 20;

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }
  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <Button variant="outline" size="sm" onClick={() => onChange(page - 1)} disabled={page <= 1}>Previous</Button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`} className="px-2 text-[var(--warm-charcoal)]">...</span>
        ) : (
          <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => onChange(p as number)}>{p}</Button>
        ),
      )}
      <Button variant="outline" size="sm" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>Next</Button>
    </div>
  );
}

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const usersQuery = useQuery(
    trpc.admin.listUsers.queryOptions({ search: debouncedSearch || undefined, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
  );

  const users = usersQuery.data?.users ?? [];
  const total = usersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleSearch(val: string) {
    setSearch(val);
    clearTimeout((window as any).__ut);
    (window as any).__ut = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 300);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-[var(--clay-black)]">Users</h1>
          <p className="text-[var(--warm-charcoal)] mt-1">{total.toLocaleString()} total users</p>
        </div>
      </div>

      <div className="bg-[var(--pure-white)] rounded-[var(--radius-xl)] border border-[var(--oat-border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--oat-border)]">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[var(--oat-light)] text-[var(--warm-charcoal)]">
            <tr>
              <th className="text-left px-4 py-3 font-medium w-[25%]">Name</th>
              <th className="text-left px-4 py-3 font-medium w-[30%]">Email</th>
              <th className="text-left px-4 py-3 font-medium w-[10%]">Role</th>
              <th className="text-left px-4 py-3 font-medium w-[10%]">Status</th>
              <th className="text-right px-4 py-3 font-medium w-[25%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersQuery.isLoading ? (
              <tr><td colSpan={5} className="text-center py-16 text-[var(--warm-charcoal)]">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-16 text-[var(--warm-charcoal)]">No users found.</td></tr>
            ) : (
              users.map((u) => <UserRow key={u.id} user={u} />)
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

function UserRow({ user }: { user: { id: string; name: string; email: string; role: string; suspended: boolean; emailVerified: boolean } }) {
  const queryClient = useQueryClient();

  const suspendMutation = useMutation(
    trpc.admin.suspendUser.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: trpc.admin.listUsers.queryKey() });
        toast.success(data.suspended ? "User suspended" : "User unsuspended");
      },
      onError: (e: any) => toast.error(e.message),
    }),
  );

  const roleMutation = useMutation(
    trpc.admin.setUserRole.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: trpc.admin.listUsers.queryKey() });
        toast.success(`Role: ${data.role}`);
      },
      onError: (e: any) => toast.error(e.message),
    }),
  );

  return (
    <tr className="border-t border-[var(--oat-border)] hover:bg-[var(--oat-light)]/50 transition-colors">
      <td className="px-4 py-3 font-medium text-[var(--clay-black)]">{user.name}</td>
      <td className="px-4 py-3 text-[var(--warm-charcoal)]">
        {user.email}
        {!user.emailVerified && (
          <span className="ml-1.5 text-[10px] bg-[var(--sunbeam-300)] text-[var(--sunbeam-800)] px-1.5 py-0.5 rounded-full font-medium">unverified</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user.role === "admin" ? "bg-[var(--matcha-300)] text-[var(--matcha-800)]" : "bg-[var(--oat-border)] text-[var(--warm-charcoal)]"}`}>
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          user.suspended ? "bg-[var(--clay-red)]/10 text-[var(--clay-red)]" : "bg-[var(--matcha-300)] text-[var(--matcha-800)]"
        }`}>
          {user.suspended ? "Suspended" : "Active"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => suspendMutation.mutate({ userId: user.id, suspended: !user.suspended })} disabled={suspendMutation.isPending} className="h-9 rounded-[var(--radius-lg)] text-xs">
            {user.suspended ? "Unsuspend" : "Suspend"}
          </Button>
          <Button variant="outline" onClick={() => roleMutation.mutate({ userId: user.id, role: user.role === "admin" ? "user" : "admin" })} disabled={roleMutation.isPending} className="h-9 rounded-[var(--radius-lg)] text-xs">
            {user.role === "admin" ? "Demote" : "Promote"}
          </Button>
        </div>
      </td>
    </tr>
  );
}
