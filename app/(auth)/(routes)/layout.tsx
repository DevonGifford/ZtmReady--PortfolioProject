"use client";

import Link from "next/link";
import Image from "next/image";

// import Navbar from "@/components/NavBar";
// import { redirect } from "next/navigation";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  //  const { isAuthenticated, isLoading } = //🎯Link to auth state

  // - handle loading state
  //   if (isLoading) {
  //     return (
  //       <div className="h-full flex items-center justify-center">
  //         <Spinner /> //🎯NEED TO CREATE AND IMPORT 
  //       </div>
  //     );
  //   }

  // - send user back to home page if already signedIn
  //   if (!isAuthenticated) {
  //     //🎯toast notif?
  //     return redirect("/");
  //   }

  return (
    <div className="h-full flex-col">
      {/* <Navbar /> */}
      <main className="flec flex-col h-full overflow-y-auto">
        {/* TEMPORARY LOGO SOLUTION 🎯 */}

        <div className="flex flex-col items-center h-screen md:justify-center">
          <Link
            href="/"
            className="flex flex-row items-center justify-center gap-0.5 font-bold text-3xl pt-6 md:justify-center"
          >
            <Image
              src="/landingpage/ZTM-logo.png"
              alt="ztmready logo"
              width={66}
              height={66}
              className=""
            />
            <span className="flex text-devready-green">ZTM</span>
            <span className="flex">Ready</span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
