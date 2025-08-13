import { db } from "@/db";
import { usersTable } from "@/db/schema";

function rand(n = 6) {
  return Math.random().toString(36).slice(2, 2 + n);
}

export default function Home() {
  async function createRandomUser() {
    "use server";

    const username = `user_${rand(8)}`;
    const bio = `bio`;

    await db.insert(usersTable).values({
      username,
      bio,
    });
  }

  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center text-center">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono">
        <form action={createRandomUser}>
          <button>submit</button>
        </form>
      </div>
    </main>
  );
}
