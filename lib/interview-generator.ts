// import { QUESTIONS } from './questions';

export interface InterviewQuestion {
    id: string;
    text: string;
    type: 'warmup' | 'resume' | 'technical' | 'behavioral' | 'curveball';
    difficulty: number; // 1-5
}

export function generateInterviewQueue(skills: string[] = [], role: string = 'Software Engineer'): InterviewQuestion[] {
    const queue: InterviewQuestion[] = [];

    // 1. Warmup (Always first)
    queue.push({
        id: 'warmup-1',
        text: "Tell me about yourself and why you're interested in this role.",
        type: 'warmup',
        difficulty: 1
    });

    // 2. Resume-based (Based on extracted skills)
    if (skills.length > 0) {
        // Take up to 2 detected skills
        const topSkills = skills.slice(0, 2);
        topSkills.forEach((skill, idx) => {
            queue.push({
                id: `resume-${idx}`,
                text: `I see you have experience with ${skill}. Can you describe a challenging problem you solved using ${skill}?`,
                type: 'resume',
                difficulty: 2
            });
        });
    } else {
        // Fallback if no skills found
        queue.push({
            id: 'resume-fallback',
            text: "Walk me through the most significant project on your resume.",
            type: 'resume',
            difficulty: 2
        });
    }

    // 3. Technical / Role-based
    queue.push({
        id: 'tech-1',
        text: "Explain the difference between specific vs comparison sorting algorithms.",
        type: 'technical',
        difficulty: 3
    });
    queue.push({
        id: 'tech-2',
        text: "How would you design a scalable API for a high-traffic system?",
        type: 'technical',
        difficulty: 4
    });

    // 4. Behavioral
    queue.push({
        id: 'beh-1',
        text: "Tell me about a time you disagreed with a senior engineer. How did you handle it?",
        type: 'behavioral',
        difficulty: 3
    });

    // 5. Curveball (End)
    queue.push({
        id: 'curve-1',
        text: "If you could design a system to replace yourself, what would be its first feature?",
        type: 'curveball',
        difficulty: 5
    });

    return queue;
}
