import type { QuizQuestion } from "@/lib/types";

// 12 lightweight questions, written to read the same whether you're a
// surgeon, a teacher, a lawyer, or an engineer. Each option carries partial
// weights across the 8 trait dimensions — answers accumulate into the
// user's raw trait vector.
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "When you start something new, what pulls you in first?",
    options: [
      {
        id: "q1a",
        label: "The chance to understand how something really works",
        weights: { analyticalDepth: 3, exploration: 1 },
      },
      {
        id: "q1b",
        label: "The blank slate, and what could be made of it",
        weights: { creativeExpression: 3, productIntuition: 1 },
      },
      {
        id: "q1c",
        label: "Getting hands-on and making real progress",
        weights: { technicalExecution: 3, leadership: 0.5 },
      },
      {
        id: "q1d",
        label: "Who else is involved, and what we could do together",
        weights: { socialEnergy: 3, leadership: 1 },
      },
    ],
  },
  {
    id: "q2",
    prompt: "The plan falls apart the night before it matters. Your instinct?",
    options: [
      {
        id: "q2a",
        label: "Stay calm, break it into solvable pieces",
        weights: { calmUnderAmbiguity: 3, analyticalDepth: 1 },
      },
      {
        id: "q2b",
        label: "Rally everyone involved and reassign fast",
        weights: { leadership: 3, socialEnergy: 1 },
      },
      {
        id: "q2c",
        label: "Find a workaround nobody else considered",
        weights: { creativeExpression: 2, exploration: 1.5 },
      },
      {
        id: "q2d",
        label: "Rebuild the approach from scratch, properly this time",
        weights: { technicalExecution: 3, analyticalDepth: 1 },
      },
    ],
  },
  {
    id: "q3",
    prompt: "Which kind of win feels best?",
    options: [
      {
        id: "q3a",
        label: "Cracking a problem others gave up on",
        weights: { analyticalDepth: 3, calmUnderAmbiguity: 1 },
      },
      {
        id: "q3b",
        label: "Watching people connect because of something you organized",
        weights: { socialEnergy: 2, leadership: 2 },
      },
      {
        id: "q3c",
        label: "Putting something into the world that people rely on daily",
        weights: { technicalExecution: 2, productIntuition: 2 },
      },
      {
        id: "q3d",
        label: "Making something that moves people emotionally",
        weights: { creativeExpression: 3, productIntuition: 0.5 },
      },
    ],
  },
  {
    id: "q4",
    prompt: "Pick a free Sunday.",
    options: [
      {
        id: "q4a",
        label: "Deep in a book or a research rabbit hole",
        weights: { analyticalDepth: 3, exploration: 1 },
      },
      {
        id: "q4b",
        label: "Outside, somewhere new, no fixed plan",
        weights: { exploration: 3, calmUnderAmbiguity: 1 },
      },
      {
        id: "q4c",
        label: "Making something just because — writing, art, a project",
        weights: { creativeExpression: 3 },
      },
      {
        id: "q4d",
        label: "Catching up with people who energize you",
        weights: { socialEnergy: 3 },
      },
    ],
  },
  {
    id: "q5",
    prompt: "In a group effort, you naturally become...",
    options: [
      {
        id: "q5a",
        label: "The one who sees the bigger picture and sets direction",
        weights: { leadership: 3, productIntuition: 1 },
      },
      {
        id: "q5b",
        label: "The steady one everyone checks with when it gets messy",
        weights: { calmUnderAmbiguity: 3, leadership: 0.5 },
      },
      {
        id: "q5c",
        label: "The one who makes it feel right, not just correct",
        weights: { creativeExpression: 2, productIntuition: 1.5 },
      },
      {
        id: "q5d",
        label: "The one who makes sure it actually holds up",
        weights: { technicalExecution: 3 },
      },
    ],
  },
  {
    id: "q6",
    prompt: "What's more satisfying?",
    options: [
      {
        id: "q6a",
        label: "A well-argued case, airtight and precise",
        weights: { analyticalDepth: 3 },
      },
      {
        id: "q6b",
        label: "Something that finally works after a lot of iteration",
        weights: { technicalExecution: 3, productIntuition: 1 },
      },
      {
        id: "q6c",
        label: "A story that lands exactly how you meant it",
        weights: { creativeExpression: 2, socialEnergy: 1 },
      },
      {
        id: "q6d",
        label: "A new place, idea, or skill nobody showed you",
        weights: { exploration: 3 },
      },
    ],
  },
  {
    id: "q7",
    prompt: "When ambiguity shows up, you...",
    options: [
      {
        id: "q7a",
        label: "Get curious and start mapping the unknowns",
        weights: { exploration: 2, analyticalDepth: 1.5 },
      },
      {
        id: "q7b",
        label: "Feel steady — unclear is just not-yet-clear",
        weights: { calmUnderAmbiguity: 3 },
      },
      {
        id: "q7c",
        label: "Look for what people actually need first",
        weights: { productIntuition: 2, socialEnergy: 1 },
      },
      {
        id: "q7d",
        label: "Start testing options to find the answer by doing",
        weights: { technicalExecution: 2, exploration: 1 },
      },
    ],
  },
  {
    id: "q8",
    prompt: "Your ideal outcome, most days, is...",
    options: [
      {
        id: "q8a",
        label: "Something unmistakably yours — a piece of work with your voice in it",
        weights: { creativeExpression: 3 },
      },
      {
        id: "q8b",
        label: "A process or system that quietly makes things better",
        weights: { technicalExecution: 2, productIntuition: 2 },
      },
      {
        id: "q8c",
        label: "A group, event, or space people want to return to",
        weights: { socialEnergy: 2, leadership: 2 },
      },
      {
        id: "q8d",
        label: "A well-tested idea or theory that holds up",
        weights: { analyticalDepth: 3 },
      },
    ],
  },
  {
    id: "q9",
    prompt: "People come to you for...",
    options: [
      {
        id: "q9a",
        label: "Clear thinking under pressure",
        weights: { calmUnderAmbiguity: 2, analyticalDepth: 1 },
      },
      {
        id: "q9b",
        label: "Momentum and direction",
        weights: { leadership: 3 },
      },
      {
        id: "q9c",
        label: "A fresh perspective or an idea nobody else had",
        weights: { creativeExpression: 2, exploration: 1 },
      },
      {
        id: "q9d",
        label: "Getting unstuck on something practical",
        weights: { technicalExecution: 3 },
      },
    ],
  },
  {
    id: "q10",
    prompt: "You'd rather spend a free afternoon...",
    options: [
      {
        id: "q10a",
        label: "Learning something with real depth",
        weights: { analyticalDepth: 2, exploration: 1 },
      },
      {
        id: "q10b",
        label: "Making something with your hands or your mind",
        weights: { technicalExecution: 2, creativeExpression: 1 },
      },
      {
        id: "q10c",
        label: "Somewhere outdoors, or somewhere new",
        weights: { exploration: 3 },
      },
      {
        id: "q10d",
        label: "Around people, low agenda, high energy",
        weights: { socialEnergy: 3 },
      },
    ],
  },
  {
    id: "q11",
    prompt: "Your best work should be judged by...",
    options: [
      {
        id: "q11a",
        label: "Whether it's rigorous and true",
        weights: { analyticalDepth: 3 },
      },
      {
        id: "q11b",
        label: "Whether it moves people",
        weights: { creativeExpression: 2, socialEnergy: 1 },
      },
      {
        id: "q11c",
        label: "Whether it solves the real problem, not the stated one",
        weights: { productIntuition: 3 },
      },
      {
        id: "q11d",
        label: "Whether it holds up under real-world conditions",
        weights: { technicalExecution: 2, calmUnderAmbiguity: 1 },
      },
    ],
  },
  {
    id: "q12",
    prompt: "If you had to lead something tomorrow, you'd want it to be...",
    options: [
      {
        id: "q12a",
        label: "An effort to understand something genuinely unknown",
        weights: { analyticalDepth: 2, exploration: 2 },
      },
      {
        id: "q12b",
        label: "A team or community that trusts you",
        weights: { leadership: 2, socialEnergy: 2 },
      },
      {
        id: "q12c",
        label: "Something that's actually good for the people who need it",
        weights: { productIntuition: 2, technicalExecution: 1.5 },
      },
      {
        id: "q12d",
        label: "A creative effort with total ownership",
        weights: { creativeExpression: 3 },
      },
    ],
  },
];
