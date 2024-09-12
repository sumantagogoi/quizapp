// src/Quiz.tsx
import React, { useState, useEffect } from 'react';
import './Quiz.css'; // Import CSS file for styling

interface Question {
    question: string;
    answer: string[];
    correct: number;
}

// Shuffle function to randomize question order
const shuffleArray = <T,>(array: T[]): T[] => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

const fetchQuestions = async () => {
    const response = await fetch('/questions.json');
    const data: Question[] = await response.json();
    return shuffleArray(data); // Shuffle questions when fetched
};

const Quiz: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [attempted, setAttempted] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    useEffect(() => {
        fetchQuestions().then(setQuestions);
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

    const handleNext = () => {
        setAnswered(false);
        setIsCorrect(null);
        setCurrentQuestionIndex((prev) => (prev + 1) % questions.length); // Loop back to first question
    };

    if (questions.length === 0) return <p>Loading...</p>;

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="quiz-container">
            <h1>Quiz App</h1>
            <p>Score: {score}/{attempted}</p>
            <div className="question-container">
                <h2>{currentQuestion.question}</h2>
                {!answered ? (
                    <div>
                        {currentQuestion.answer.map((option, index) => (
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
                        {isCorrect ? (
                            <>
                                <p>Correct!</p>
                                <p>
                                    {currentQuestion.answer[currentQuestion.correct]}.
                                </p>
                            </>

                        ) : (
                            <>
                                <p>Wrong! The correct answer is</p>
                                <p>
                                    {currentQuestion.answer[currentQuestion.correct]}.
                                </p>
                            </>

                        )}
                        <button
                            onClick={handleNext}
                            className="next-button"
                        >
                            Next Question
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quiz;
