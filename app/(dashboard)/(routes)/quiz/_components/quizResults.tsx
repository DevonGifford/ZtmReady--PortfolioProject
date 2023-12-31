import { notFound, useRouter } from "next/navigation";
import { useQuizContext } from "@/components/providers/QuizProvider";
import { useUserContext } from "@/components/providers/UserProvider";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { HomeIcon, LucideRepeat2 } from "lucide-react";

import CustomPieChart from "./pieChart";
import GradeStamp from "./gradeStamp";

import { DatabaseSchema } from "@/types/databaseSchema";
import { usersInput } from "@/types/quizzSchema";
import { UserProfile } from "@/types/UserProfile";

function QuizResults({
  quizMetaData,
}: {
  quizMetaData: DatabaseSchema | null;
}) {
  const router = useRouter();
  const { quizResults, resetQuizResults } = useQuizContext();
  const { userProfile, updateUserDataProcess } = useUserContext();

  // ✅ Handle waiting for metadata
  if (!quizMetaData) {
    return <Spinner />;
  }

  //✅ use quizResults to calculate the pie chart values
  const calculatePieChartData = () => {
    const totalQuestions = 3; //🎯 UPDATE REQ _ HARD CODED

    const correctCount =
      quizResults?.usersAnswers.filter((answer: usersInput) =>
        answer.selectedAnswer.includes("True")
      ).length || 0;

    const incorrectCount =
      quizResults?.usersAnswers.filter((answer: usersInput) =>
        answer.selectedAnswer.includes("False")
      ).length || 0;

    const skippedCount = totalQuestions - correctCount - incorrectCount;

    const pieData = [
      { name: "Correct", value: (correctCount / totalQuestions) * 100 },
      { name: "Incorrect", value: (incorrectCount / totalQuestions) * 100 },
      { name: "Skipped", value: (skippedCount / totalQuestions) * 100 },
    ];
    return pieData;
  };

  //✅ use quizResults to calculate the grade stamp
  const calculateGradeStamp = () => {
    const totalQuestions = 3; //🎯 UPDATE REQ _ HARD CODED

    const correctCount =
      quizResults?.usersAnswers.filter((answer: usersInput) =>
        answer.selectedAnswer.includes("True")
      ).length || 0;
    const score = (correctCount / totalQuestions) * 100;
    return score;
  };

  //✅ use quizResults to update user document
  const updateDatabaseHelper = () => {
    //- Logic to identify incorrect answers and extract their questionIDs
    // 🎯🔮 Update Local Storage too
    const resultData = {
      quizID: quizResults?.quizUuid || "unknown",
      incorrectQuestionIDs:
        quizResults?.usersAnswers
          .filter(
            (answer: { selectedAnswer: string }) =>
              answer.selectedAnswer === "False"
          )
          .map((answer: { questionUuid: any }) => answer.questionUuid) || [],
    };
    //- Prepare data for uploading to Firestore
    const newData: Partial<UserProfile> = {
      history: {
        quizCompleted: [
          {
            quizID: resultData.quizID,
            incorrectQuestionIDs: resultData.incorrectQuestionIDs,
          },
        ],
      },
    };

    //- Update user document & Local Storage
    updateUserDataProcess(userProfile?.uuid!, newData);
  };

  //✅ HANDLE RESTART FLASHCARD GAME
  function handleRestart() {
    updateDatabaseHelper(); //- save users answers
    resetQuizResults(); //- reset the context
    router.back(); //- re-route
  }

  //✅ HANDLE GO BACK HOME
  function handleHome() {
    updateDatabaseHelper(); //- save users answers
    resetQuizResults(); //- reset the context
    router.push(`/dashboard`); //- re-route
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center space-y-6 -translate-y-6">
        <h1 className="text-3xl underline underline-offset-8 font-bold tracking-widest pb-10 text-center">
          {quizMetaData?.setTitle || "Quiz Title"} Results
        </h1>

        <div className="flex flex-col-reverse xl:flex-row justify-between ">
          <div className="flex flex-col w-full">
            <CustomPieChart pieData={calculatePieChartData()} />
          </div>
          <GradeStamp score={calculateGradeStamp()} />
        </div>

        <div className="flex flex-col gap-12 pt-10">
          <Button size={"lg"} variant={"devfill"} onClick={handleRestart}>
            <LucideRepeat2 size={40} className="mr-5" />
            Try Again
          </Button>
          <Button
            variant={"devoutline"}
            className=" rounded-md"
            size={"default"}
            onClick={handleHome}
          >
            <HomeIcon size={20} className="mr-2" />
            Back Home
          </Button>
        </div>

        {/* <div className="flex flex-col justify-center items-center gap-3">
          <h4 className="text-xl  font-bold tracking-widest">Study Result</h4>
          <LucideArrowDownSquare />
        </div> */}
      </div>
    </>
  );
}

export default QuizResults;
