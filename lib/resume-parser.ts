import * as pdfjsLib from 'pdfjs-dist';

// Set worker source (required for client-side parsing)
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export async function extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    const pdf = await loadingTask.promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
    }

    return fullText;
}

interface ATSResult {
    score: number;
    foundSkills: string[];
    missingSkills: string[];
    role: string;
}

const ROLES = {
    'Software Engineer': {
        keywords: ['react', 'node', 'typescript', 'javascript', 'frontend', 'backend', 'api', 'database', 'sql', 'git', 'testing', 'agile'],
        weights: { 'typescript': 10, 'react': 5, 'node': 5, 'javascript': 3 },
    }
    // Can expand
};

export function analyzeATS(text: string, role: 'Software Engineer' = 'Software Engineer'): ATSResult {
    const lowerText = text.toLowerCase();
    const requirements = ROLES[role];

    const found: string[] = [];
    const missing: string[] = [];
    let score = 0;
    let maxScore = 0;

    // Simple heuristic scoring
    requirements.keywords.forEach(word => {
        const weight = (requirements.weights as any)[word] || 1;
        maxScore += weight; // Assume perfect match needs all keywords? No, let's say maxScore is sum of weights

        if (lowerText.includes(word.toLowerCase())) {
            found.push(word);
            score += weight;
        } else {
            missing.push(word);
        }
    });

    // Normalize to 100
    // But real ATS doesn't expect 100% of all keywords. Let's curve it.
    // If you have > 50% of weight, that's good.
    const rawRatio = score / maxScore;
    const finalScore = Math.min(100, Math.round(rawRatio * 100 * 1.5)); // 1.5x curve to be friendly

    return {
        score: finalScore,
        foundSkills: found,
        missingSkills: missing,
        role
    };
}
