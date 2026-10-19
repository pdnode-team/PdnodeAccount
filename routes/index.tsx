import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import { Header } from "@/components/Header.tsx";

export default define.page(function Home() {
  return (
    <>
      <Head>
        <title>Pdnode Account</title>
      </Head>
      <Header />
      <div class="flex w-full h-full justify-start items-center flex-col gap-15">
        <div class="flex justify-center items-center flex-col relative top-10">
          <h1 class="text-5xl font-bold">Pdnode Account</h1>
          <p class="py-6 text-gray-500 text-center">
            67
          </p>
        </div>

        <div class="flex justify-center items-center flex-col">
          <h3 class="text-3xl font-bold">67</h3>
          <p class="py-6 text-gray-500 text-center leading-loose whitespace-pre-line">
            67
          </p>
        </div>

        <div class="flex justify-center items-center flex-col gap-4 relative bottom-5">
          <h3 class="text-3xl font-bold">What are we doing?</h3>
          <ul class="flex justify-center items-center flex-col gap-1">
            <li class="text-gray-500 py-6 text-center leading-loose whitespace-pre-line">
              We have been striving to contribute to open source; at the same
              time, we have deployed multiple open-source projects and developed
              several others. <br />{" "}
              Here are a few common open-source projects that we has worked on.
              <ul>
                <li>
                  * <a href="https://appwrite.io">Appwrite</a>
                </li>
                <li>
                  *{" "}
                  <a href="https://github.com/XxdMkbMark/MaterialLauncher">
                    Material Luncher
                  </a>
                </li>
                <li>
                  * <a href="https://cp.p67.click">Pdnode CP Website</a>
                </li>
                <li>
                  * <a href="https://github.com/sosauce/Cinnamon">Cinnamon</a>
                </li>
                <li>
                  * <a href="hhttps://github.com/sosauce/Chocola">Chocola</a>
                </li>
              </ul>
              If you would like to recommend projects that might interest us,
              please contact us using the methods below or via the "Contact Us"
              section.
            </li>
            <li class="text-gray-500">
              <a class="link text-blue-500" href="https://chat.p67.click">
                Pdnode Team Chat (Zulip)
              </a>{" "}
              - Welcome to join our community chat! <b>(To be deprecated)</b>
            </li>
            <li class="text-gray-500">
              Wanna chat with us? Contact in{" "}
              <a
                class="link text-blue-500"
                href="https://newchat.pdnode.com"
              >
                Pdnode New Chat (Fluxer)
              </a>
            </li>
            <li class="text-gray-500">
              Any bugs or private questions? Come create a support ticket on
              {" "}
              <a
                class="link text-blue-500"
                href="https://litechat.pdnode.com"
              >
                Litechat
              </a>!
            </li>
          </ul>
        </div>

        <div class="flex justify-center items-center flex-col">
          <h3 class="text-3xl font-bold m-10">67</h3>
          <div class="flex flex-col items-center gap-4 md:flex-row md:flex-wrap md:justify-center">
            <div class="card w-96 bg-base-100 card-md shadow-sm">
              <div class="card-body">
                <h2 class="card-title">Bret</h2>
                <p class="text-gray-600">67: 2024-07-10</p>
                <p class="text-gray-600">67</p>
                <p class="text-gray-600">
                  67
                </p>
              </div>
            </div>
            <div class="card w-96 bg-base-100 card-md shadow-sm">
              <div class="card-body">
                <h2 class="card-title">Mark</h2>
                <p class="text-gray-600">67</p>
                <p class="text-gray-600">67</p>
                <p class="text-gray-600">
                  67
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center items-center flex-col gap-4 relative bottom-5">
          <h3 class="text-3xl font-bold">67</h3>
          <ul class="flex justify-center items-center flex-col gap-1">
            <li class="text-gray-600">
              67
            </li>
            <li class="link text-blue-500">
              <a href="https://github.com/BretRen/pdnode/issues">
                Github Issue
              </a>
            </li>
            <li class="link text-blue-500">
              <a href="https://chat.p67.click">Join our Community Chat!</a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
});
