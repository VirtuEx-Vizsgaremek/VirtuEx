
import Link from "next/link";
// import { Turnstile } from "react-turnstile";
// import { TURNSTILE_SITE_KEY } from "@/config";

export default function Register() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
  <form 
    className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-lg"
  >
    <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
      Registration
    </h2>

    <div className="space-y-4 shadow-sm">
      <input
        type="text"
        name="name"
        placeholder="Name"
        required
        className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
      />

      <input
        type="password"
        name="password-repeat"
        placeholder="Password Again"
        required
        className="relative block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
      />
    </div>

    <div className="flex justify-center">
      {/* <Turnstile siteKey={TURNSTILE_SITE_KEY} /> */}
    </div>

    <button
      type="submit"
    //   disabled={pending}
      className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {/* {pending ? "Feldolgozás..." : "Regisztrálok"} */}
      Registraton
    </button>

    <div className="text-center text-sm">
      <Link 
        href="/login" 
        className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
      >
        Already have an account? Log in
      </Link>
    </div>

    {/* {state!.message && (
      <p className="mt-2 text-center text-sm font-medium text-red-600 bg-red-50 p-2 rounded">
        {state!.message}
      </p>
    )} */}
  </form>
</div>
    );
}