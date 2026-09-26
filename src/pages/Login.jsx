import { useState } from "react";

import {
  Mail,
  Lock,
  ShieldCheck,
} from "lucide-react";

import toast from "react-hot-toast";

import { loginUser } from "../api/client";
import useAuth from "../hooks/useAuth";

const DEMO_PROFILES = [
  {
    role: "admin",
    label: "Admin",
    email: "admin@complianceiq.com",
    description: "Full system access",
  },
  {
    role: "officer",
    label: "Compliance Officer",
    email: "officer@complianceiq.com",
    description: "Resolve and escalate alerts",
  },
  {
    role: "analyst",
    label: "Analyst",
    email: "analyst@complianceiq.com",
    description: "View-only investigations",
  },
];

export default function Login() {

  const { login } = useAuth();

  const [email, setEmail] =
    useState("admin@complianceiq.com");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("admin");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  function selectDemoProfile(nextRole) {
    const profile = DEMO_PROFILES.find((item) => item.role === nextRole);
    if (!profile) return;

    setRole(profile.role);
    setEmail(profile.email);
    setPassword("");
    setError("");
  }

  async function handleLogin(e) {

    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await loginUser({ email, password });

      login(
        result.access_token,
        result.role,
        result.email
      );

      toast.success(`Logged in as ${result.role}`);
    } catch (requestError) {
      const detail =
        requestError.response?.data?.detail ||
        "Invalid email or password";

      setError(detail);
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="
        min-h-screen

        bg-slate-100
        dark:bg-slate-950

        flex
        items-center
        justify-center

        px-4
      "
    >

      <div
        className="
          w-full
          max-w-md

          bg-white
          dark:bg-slate-900

          border
          border-slate-200
          dark:border-slate-800

          rounded-3xl

          shadow-xl

          p-8

          transition-all
        "
      >

        {/* HEADER */}

        <div className="text-center mb-8">

          <div
            className="
              w-16
              h-16

              mx-auto
              mb-5

              rounded-2xl

              bg-blue-600

              flex
              items-center
              justify-center
            "
          >

            <ShieldCheck
              size={30}
              className="text-white"
            />

          </div>

          <h1
            className="
              text-3xl
              font-bold

              text-slate-900
              dark:text-white
            "
          >
            ComplianceIQ
          </h1>

          <p
            className="
              mt-2

              text-slate-500
              dark:text-slate-400
            "
          >
            AI-Powered Compliance Platform
          </p>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          {/* ERROR */}

          {error && (

            <div
              className="
                bg-red-100

                border
                border-red-200

                text-red-600

                text-sm

                rounded-2xl

                px-4
                py-3
              "
            >
              {error}
            </div>

          )}

          {/* EMAIL */}

          <div>

            <label
              className="
                block

                mb-2

                text-sm
                font-medium

                text-slate-700
                dark:text-slate-300
              "
            >
              Email Address
            </label>

            <div className="relative">

              <Mail
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2

                  text-slate-400
                "
              />

              <input
                type="email"

                value={email}

                onChange={(e) =>
                  setEmail(e.target.value)
                }

                className="
                  w-full

                  pl-12
                  pr-4
                  py-3

                  rounded-2xl

                  border
                  border-slate-300
                  dark:border-slate-700

                  bg-white
                  dark:bg-slate-800

                  text-slate-900
                  dark:text-white

                  outline-none

                  focus:ring-2
                  focus:ring-blue-500/20
                "
              />

            </div>

          </div>

          {/* PASSWORD */}

          <div>

            <label
              className="
                block

                mb-2

                text-sm
                font-medium

                text-slate-700
                dark:text-slate-300
              "
            >
              Password
            </label>

            <div className="relative">

              <Lock
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2

                  text-slate-400
                "
              />

              <input
                type="password"

                value={password}

                onChange={(e) =>
                  setPassword(e.target.value)
                }

                className="
                  w-full

                  pl-12
                  pr-4
                  py-3

                  rounded-2xl

                  border
                  border-slate-300
                  dark:border-slate-700

                  bg-white
                  dark:bg-slate-800

                  text-slate-900
                  dark:text-white

                  outline-none

                  focus:ring-2
                  focus:ring-blue-500/20
                "
              />

            </div>

          </div>

          {/* ROLE */}

          <div>

            <label
              className="
                block

                mb-2

                text-sm
                font-medium

                text-slate-700
                dark:text-slate-300
              "
            >
              Login Role
            </label>

            <select
              value={role}

              onChange={(e) =>
                selectDemoProfile(e.target.value)
              }

              className="
                w-full

                px-4
                py-3

                rounded-2xl

                border
                border-slate-300
                dark:border-slate-700

                bg-white
                dark:bg-slate-800

                text-slate-900
                dark:text-white

                outline-none

                focus:ring-2
                focus:ring-blue-500/20
              "
            >

              <option value="admin">
                Admin
              </option>

              <option value="analyst">
                Analyst
              </option>

              <option value="officer">
                Compliance Officer
              </option>

            </select>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {DEMO_PROFILES.find((profile) => profile.role === role)?.description}
              {" · type the password manually"}
            </p>

          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={submitting}

            className={`
              w-full

              bg-blue-600
              hover:bg-blue-700

              text-white

              py-3

              rounded-2xl

              font-medium

              transition-all
              ${submitting ? "opacity-70 cursor-wait" : ""}
            `}
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>

        </form>

      </div>

    </div>
  );
}
