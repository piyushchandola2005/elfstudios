import React from "react";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: {
      id: "desc"
    },
    include: {
      _count: {
        select: { bookings: true }
      }
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-black uppercase tracking-tighter">
          Users & Bands
        </h1>
        <p className="text-gray-500 font-sans mt-2">
          Directory of all registered Elf Jampad users.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left font-sans text-sm min-w-[800px]">
          <thead className="bg-gray-50 text-gray-500 font-mono text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-normal">Band Name</th>
              <th className="px-6 py-4 font-normal">Contact Name</th>
              <th className="px-6 py-4 font-normal">Email</th>
              <th className="px-6 py-4 font-normal">Phone</th>
              <th className="px-6 py-4 font-normal">Total Bookings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-black">
                    {user.bandName || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {user.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {user.email || "—"}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-500">
                    {user.phone || "—"}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-elf-orange">
                    {user._count.bookings}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
