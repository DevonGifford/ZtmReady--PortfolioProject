"use client";

import { DatabaseContextProvider } from "@/components/providers/DatabaseProvider";
import { QuizContextProvider } from "@/components/providers/QuizProvider";

export default function FlashCardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DatabaseContextProvider>
        <QuizContextProvider>

        {children}

        </QuizContextProvider>
      </DatabaseContextProvider>
    </>
  );
}
