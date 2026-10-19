import { Head } from "fresh/runtime";
import { define } from "../utils.ts";

export default define.page(function Home() {
  return (
    <div class="px-4 py-8 mx-auto min-h-screen">
      <Head>
        <title>Pdnode Account</title>
      </Head>
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <h1 class="text-4xl font-bold">Welcome to Pdnode Account</h1>
        <p class="my-4">
          Pdnode Account is a simple, lightweight account system.
        </p>
      </div>
    </div>
  );
});
