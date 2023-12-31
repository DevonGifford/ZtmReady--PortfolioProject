"use client"; //👈 req for error boundary

import { useEffect, useState } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LucideXSquare } from "lucide-react";

import QuizApplication from "../_components/quizApplication";
import QuizWelcome from "../_components/quizWelcome";
import QuizResults from "../_components/quizResults";

import { useQuizContext } from "@/components/providers/QuizProvider";
import { quizGeneratingAlgo } from "@/lib/quizGeneratingAlgo";
import toast from "react-hot-toast";
import { DatabaseSchema } from "@/types/databaseSchema";

function QuizControl({ params }: { params: { quizId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { resetQuizResults, setCustomQuizData, quizData } = useQuizContext();
  const [quizMetaData, setQuizMetaData] = useState<DatabaseSchema | null>(null);

  const paramsQuizzId = params.quizId; // 👈 Reference, check and fetch data from local DB
  const pageId = searchParams.get("pageId"); // 👈 Renders different component pages accordingly

  // ✅ SERVE NOT FOUND IF NO SPECIFIC QUEREY
  // 👇 If the selected quiz ID doesn't match any in the database, redirect to a not-found page
  if (!paramsQuizzId) {
    notFound();
  }

  // ✅ FETCH QUIZ METADATA - title description tags etc.
  const fetchQuizMetadata = () => {
    const localStorageKey = "ztmready-database";
    const localDB: string | null = localStorage.getItem(localStorageKey);

    if (!localDB) {
      console.log(
        "🎯event_log:  🎇/fetchQuizMetadata  ❌ Error occurred: no data found in local storage"
      );
      return null; // Handle the absence of data
    }

    try {
      const parsedData = JSON.parse(localDB);

      if (!parsedData.data || !parsedData.timestamp) {
        console.log(
          "🎯event_log:  🎇/fetchQuizMetadata  ❌ Error occurred: incomplete data format in local storage"
        );
        return null; // Handle incomplete data format
      }

      const relevantData = parsedData.data.find(
        (data: any) => data.uuid === paramsQuizzId
      );

      if (!relevantData) {
        console.log(
          "🎯event_log:  🎇/fetchQuizMetadata  ❌ Error occurred: no matching data found"
        );
        return null; // Handle the absence of relevant data
      }

      const { setData, ...dataWithoutSetData } = relevantData;

      return dataWithoutSetData;
    } catch (error) {
      console.error(
        "🎯event_log:  🎇/fetchQuizMetadata  ❌ Error occurred while parsing data from local storage:",
        error
      );
      return null; // Handle parsing error
    }
  };

  // ✅ GET CUSTOM QUESTIONS via Algorithm
  const setCustomQuizQuestion = () => {
    // - Call Algo to create custom questions
    // 🎯 need to update the Algo
    const customQuestionSet = quizGeneratingAlgo(
      paramsQuizzId,
      10,
      "userHistory"
    );
    console.log("customQuestionSet 🎈", customQuestionSet);
    setCustomQuizData(customQuestionSet);
  };

  // ✅ HOOK TO TRIGGER FETCH ACTIONS
  useEffect(() => {
    setCustomQuizQuestion(); // Call setCustomQuizQuestion once on initial render
    const metaQuizData = fetchQuizMetadata();
    setQuizMetaData(metaQuizData);
    setIsLoadingData(false); // Turn off loading once data is set
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-auto py-24 md:h-screen items-center justify-center space-y-4 overflow-scroll">
      {/* Conditional rendering based on router query */}
      {pageId === "active-quiz" && (
        <>
          <QuizApplication key="quiz" questions={quizData} />
          {/* Quit quiz button */}
          <Button
            className="text-xs font-bold translate-y-1/2"
            variant={"outline"}
            size={"sm"}
            onClick={() => {
              router.back();
              resetQuizResults();
              toast("Quiz cancelled");
            }}
          >
            <LucideXSquare size={16} /> Quit Quiz
          </Button>
        </>
      )}
      {pageId === "results-page" && (
        <QuizResults quizMetaData={quizMetaData} key="results" />
      )}

      {/* Render 'go back to previous form' button or render first form */}
      {!pageId && (
        <QuizWelcome
          quizMetaData={quizMetaData}
          isLoading={isLoadingData}
          key="intro"
        />
        // 👇 for development use
        // <QuizApplication key="quiz" questions={testQuestions} />
        // <QuizResults key="results" />
      )}
    </div>
  );
}

export default QuizControl;
