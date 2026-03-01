import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 font-bold text-2xl">Hello World</h1>
      <p>
        You can open{" "}
        <Link className="font-medium underline" href="/docs">
          /docs
        </Link>{" "}
        and see the documentation.
      </p>
    </div>
  );
}
