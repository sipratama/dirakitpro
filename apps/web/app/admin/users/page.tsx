import { getUsersForAdmin } from "@/features/admin/get-users-for-admin";

// ADMIN_CORE.md §3 (ADM-005) — read-only, no search/filter (MVP scale).
export default async function AdminUsersPage() {
  const userList = await getUsersForAdmin();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-h1 text-brand-ink">Learner</h1>

      {userList.length === 0 ? (
        <p className="mt-6 text-body text-neutral-600">Belum ada user.</p>
      ) : (
        <table className="mt-8 w-full text-body text-brand-ink">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-small text-neutral-600">
              <th className="py-2">Email</th>
              <th className="py-2">Username</th>
              <th className="py-2">Role</th>
              <th className="py-2">Bergabung</th>
              <th className="py-2">Enrollment</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user) => (
              <tr key={user.id} className="border-b border-neutral-100">
                <td className="py-2">{user.email}</td>
                <td className="py-2">{user.username}</td>
                <td className="py-2">{user.role}</td>
                <td className="py-2">{new Date(user.createdAt).toLocaleDateString("id-ID")}</td>
                <td className="py-2">{user.enrollmentCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
