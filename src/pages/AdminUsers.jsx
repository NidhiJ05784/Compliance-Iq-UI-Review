import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserPlus, UserX, Users } from "lucide-react";

import Layout from "../components/Layout";
import { createUser, deactivateUser, getUsers } from "../api/client";

const initialForm = { email: "", password: "", role: "analyst" };

function formatDate(value) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function inputClass() {
  return "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-950";
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setUsers(await getUsers());
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getUsers()
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.detail || "Unable to load users.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const created = await createUser(form);
      setUsers((current) => [
        {
          id: created.user_id,
          email: created.email,
          role: created.role,
          is_active: true,
          created_at: new Date().toISOString(),
          last_login_at: null,
        },
        ...current,
      ]);
      setForm(initialForm);
      toast.success("User created successfully");
    } catch (requestError) {
      const message = requestError.response?.data?.detail || "Unable to create user.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(user) {
    if (!window.confirm(`Deactivate ${user.email}? They will no longer be able to log in.`)) return;

    try {
      await deactivateUser(user.id);
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, is_active: false } : item));
      toast.success("User deactivated");
    } catch (requestError) {
      toast.error(requestError.response?.data?.detail || "Unable to deactivate user.");
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-blue-600 p-3 text-white"><Users size={22} /></div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white md:text-3xl">User management</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create accounts, assign roles and control access to ComplianceIQ.</p>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <form onSubmit={handleCreate} className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2"><UserPlus size={18} className="text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Create user</h2></div>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email<input required type="email" name="email" value={form.email} onChange={updateField} className={`${inputClass()} mt-2`} placeholder="person@company.com" /></label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Temporary password<input required minLength="8" type="password" name="password" value={form.password} onChange={updateField} className={`${inputClass()} mt-2`} placeholder="At least 8 characters" /></label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role<select name="role" value={form.role} onChange={updateField} className={`${inputClass()} mt-2`}><option value="analyst">Analyst</option><option value="officer">Compliance officer</option><option value="admin">Administrator</option></select></label>
            </div>
            <button disabled={submitting} className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{submitting ? "Creating…" : "Create user"}</button>
          </form>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800"><div><h2 className="font-semibold text-slate-900 dark:text-white">All users</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{users.length} account{users.length === 1 ? "" : "s"} returned by the database.</p></div><button onClick={loadUsers} className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Refresh</button></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300"><tr><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Last login</th><th className="px-6 py-4">Action</th></tr></thead>
                <tbody>
                  {loading && <tr><td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">Loading users…</td></tr>}
                  {!loading && users.map((user) => <tr key={user.id} className="border-t border-slate-100 text-sm dark:border-slate-800"><td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{user.email}<p className="mt-1 text-xs text-slate-400">Created {formatDate(user.created_at)}</p></td><td className="px-6 py-4 capitalize text-slate-600 dark:text-slate-300">{user.role}</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>{user.is_active ? "Active" : "Inactive"}</span></td><td className="px-6 py-4 text-slate-600 dark:text-slate-300">{formatDate(user.last_login_at)}</td><td className="px-6 py-4">{user.is_active ? <button onClick={() => handleDeactivate(user)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"><UserX size={14} /> Deactivate</button> : <span className="text-xs text-slate-400">No actions</span>}</td></tr>)}
                  {!loading && users.length === 0 && <tr><td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">No users found.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
