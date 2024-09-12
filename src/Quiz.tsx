import React, { useState, useEffect } from 'react';
import './Quiz.css'; 

interface Question {
  question: string;
  answer: string[];
  correct: number;
  note: string;
}

const adjustWeights = true; // Boolean to control weight adjustment

const shuffleArrayWithWeights = <T,>(array: T[], weights: number[]): T[] => {
  let totalWeight = weights.reduce((acc, weight) => acc + 1 / weight, 0);
  let randomValue = Math.random() * totalWeight;

  for (let i = 0; i < array.length; i++) {
    const weightChance = 1 / weights[i];
    if (randomValue < weightChance) {
      return [array[i], ...array.slice(0, i), ...array.slice(i + 1)];
    }
    randomValue -= weightChance;
  }
  return array;
};

const fetchQuestions = async () => {
  const response = await fetch('/questions.json');
  const data: Question[] = await response.json();
  return data;
};

const Quiz: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [weights, setWeights] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    fetchQuestions().then((data) => {
      setQuestions(data);
      setWeights(Array(data.length).fill(1)); // Initialize weights
    });
  }, []);

  const handleAnswer = (index: number) => {
    const correct = questions[currentQuestionIndex].correct;
    setAnswered(true);
    setAttempted(attempted + 1);
    if (index === correct) {
      setScore(score + 1);
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  const updateWeights = (currentQuestionIndex: number) => {
    if (adjustWeights) {
      setWeights((prevWeights) =>
        prevWeights.map((weight, index) =>
          index === currentQuestionIndex ? weight * 2 : weight
        )
      );
    }
  };

  const handleNext = () => {
    setAnswered(false);
    setIsCorrect(null);
    updateWeights(currentQuestionIndex); // Update the weight of the current question

    // Shuffle questions using weights
    const nextQuestions = shuffleArrayWithWeights(questions, weights);
    setQuestions(nextQuestions);
    setCurrentQuestionIndex(0);
  };

  if (questions.length === 0) return <p>Loading...</p>;

  const currentQuestion = questions[currentQuestionIndex];
  const answers = currentQuestion.answer;

  return (
    <div className="quiz-container">
      <h1>Quiz App</h1>
      <p>Score: {score}/{attempted}</p>
      <div className="question-container">
        <h4>{currentQuestion.question}</h4>
        {!answered ? (
          <div className='multi-choice'>
            {answers.map((option, index) => (
                <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="option-button"
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div>
            {isCorrect ? <p>Correct!</p> : <p>Wrong! The correct answer is {currentQuestion.answer[currentQuestion.correct]}.</p>}
            {currentQuestion.note && <p className="note">{currentQuestion.note}</p>}
            <button onClick={handleNext} className="next-button">Next Question</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;