"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { BACKEND_URL } from "@/app/page";

const Test = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [passKey, setPassKey] = useState("");

  const handleQuery = async (e) => {
    e.preventDefault();
    // console.log({ query, passKey });
    // return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, passKey }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);

        Swal.fire({
          icon: "success",
          title: "Query successful",
          // text: "Welcome to the dashboard.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Query failed",
          //   text: "Invalid email or password. Please try again.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleQuery}>
            <div>
              <label
                htmlFor="query"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Query
              </label>
              <div className="mt-2">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ padding: "8px 10px" }}
                  rows={5}
                  name="query"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="passkey"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Passkey
                </label>
              </div>
              <div className="mt-2">
                <textarea
                  value={passKey}
                  onChange={(e) => setPassKey(e.target.value)}
                  style={{ padding: "8px 10px" }}
                  name="passkey"
                  rows={5}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Test;
