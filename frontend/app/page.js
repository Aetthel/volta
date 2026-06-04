import Link from "next/link";

export default function Home() {
  return (
    <main >
      <div >
        <h1 >
          Volta
        </h1>
        <p >
          Intelligent Agenda Management
        </p>
        <div >
          <Link href="/login">
            <button >
              Acceder al Panel
            </button>
          </Link>
        </div>
      </div>
      <footer >
        © 2026 Volta Systems — Editorial Edition
      </footer>
    </main>
  );
}
