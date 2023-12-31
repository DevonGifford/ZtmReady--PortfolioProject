"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Spinner } from "../Spinner";
import { QuizResultsSchema, usersInput } from "@/types/quizzSchema";
import { DatabaseSchema, QuizQuestion } from "@/types/databaseSchema";

type QuizContextProps = {
  quizData: DatabaseSchema | undefined;
  quizResults: QuizResultsSchema | undefined;
  setCustomQuizData: (customQuizData: DatabaseSchema) => {};
  updateResults: (newResults: Partial<QuizResultsSchema>) => Promise<void>;
  resetQuizResults: () => void;
};

// 👇 AUTH CONTEXT => exposing following...
const QuizContext = createContext<QuizContextProps>({
  quizData: undefined,
  quizResults: undefined,
  setCustomQuizData: async () => {},
  updateResults: async () => {},
  resetQuizResults: async () => {},
});

// - Arrow Function Shorthand:
// - directly returns result of useContext explicitly defining any type.
export const useQuizContext = () => useContext<any>(QuizContext);

export const QuizContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [quizData, setQuizData] = useState<DatabaseSchema>();
  const [quizResults, setQuizResults] = useState<QuizResultsSchema>();
  const [loading, setLoading] = useState<Boolean>(true);

  // ✅ Initialization context logic on mount...
  useEffect(() => {
    // - Fetch data or perform actions here
    const fetchData = async () => {
      // ⏳ Update state accordingly with setQuizData and setQuizResults
      setLoading(false); // Set loading to false when done
    };

    fetchData();

    //- Clean-up function (optional)
    return () => {
      // ⏳ Add clean-up logic
    };
  }, []);

  //✅ HANDLE RESET - resetting Quiz Results to Default
  const resetQuizResults = () => {
    console.log(
      "🎯event_log:  ❓quizzProvider/resetQuizResults:  💢 Triggered"
    );
    const defaultQuizResults: QuizResultsSchema = {
      quizUuid: "",
      usersAnswers: [],
    };
    setQuizResults(defaultQuizResults);
  };

  //✅ HANDLE SETTING QUIZ DATA - quiz welcome page
  const setCustomQuizData = async (customQuizData: DatabaseSchema) => {
    console.log(
      "🎯event_log:  ❓quizzProvider/setCustomQuizData:  💢 Triggered"
    );
    console.log("customQuizData", customQuizData);
    setQuizData(customQuizData);
  };

  //✅ HANDLE UPDATING STATE - quiz application page
  const updateResults = async (
    newResults: Partial<QuizResultsSchema>
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      setQuizResults((prevResults) => {
        if (!prevResults) {
          //- If no previous results exist, initialize usersAnswers with new data
          return {
            quizUuid: newResults.quizUuid || "",
            usersAnswers: newResults.usersAnswers || [],
          };
        } else {
          //- If previous results exist, merge or update usersAnswers
          const updatedUserAnswers = newResults.usersAnswers || [];

          //- Update existing user answers or add new ones
          const mergedUsersAnswers = updatedUserAnswers.reduce(
            (acc: usersInput[], newAnswer: usersInput) => {
              const existingIndex = prevResults.usersAnswers.findIndex(
                (existingAnswer) =>
                  existingAnswer.questionUuid === newAnswer.questionUuid
              );

              if (existingIndex !== -1) {
                //- If an answer for the question exists, update it
                acc[existingIndex] = newAnswer;
              } else {
                //- If answer doesn't exist, add it to the array
                acc.push(newAnswer);
              }

              return acc;
            },
            [...prevResults.usersAnswers] //- Copy existing answers
          );

          return {
            ...prevResults,
            usersAnswers: mergedUsersAnswers,
          };
        }
      });

      resolve(); //- Resolve here after the state has been updated
    });
  };

  const quizContextValue: QuizContextProps = {
    quizData,
    quizResults,
    updateResults,
    resetQuizResults,
    setCustomQuizData,
  };

  return (
    <QuizContext.Provider value={quizContextValue}>
      {loading ? (
        <div className="h-screen w-screen bg-primary flex items-center justify-center space-y-4">
          <Spinner size="screen" />
        </div>
      ) : (
        children
      )}
    </QuizContext.Provider>
  );
};
