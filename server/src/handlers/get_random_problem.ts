import { type MathProblem, type MathProblemType } from '../schema';

export const getRandomProblem = async (type?: MathProblemType): Promise<MathProblem | null> => {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is fetching a random math problem from the database,
    // optionally filtered by problem type. This supports the "Exercice suivant" functionality.
    
    // Static examples for different problem types
    const staticExamples: Record<MathProblemType, MathProblem> = {
        triangle_rectangle: {
            id: 1,
            title: "Triangle Rectangle - Théorème de Pythagore",
            question: "Dans un triangle rectangle ABC, si AB = 5 cm et BC = 12 cm, quelle est la longueur de l'hypoténuse AC ?",
            type: "triangle_rectangle",
            explanation: "1. Identifier les côtés : AB = 5 cm, BC = 12 cm\n2. Appliquer le théorème de Pythagore : AC² = AB² + BC²\n3. Calculer : AC² = 5² + 12² = 25 + 144 = 169\n4. Extraire la racine : AC = √169 = 13 cm",
            svg_content: '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><polygon points="50,120 50,50 150,120" fill="lightblue" stroke="blue" stroke-width="2"/><text x="40" y="140">A</text><text x="40" y="45">B</text><text x="155" y="140">C</text></svg>',
            created_at: new Date(),
            updated_at: new Date()
        },
        triangle_equilateral: {
            id: 2,
            title: "Triangle Équilatéral - Périmètre",
            question: "Quel est le périmètre d'un triangle équilatéral de côté 8 cm ?",
            type: "triangle_equilateral",
            explanation: "1. Un triangle équilatéral a tous ses côtés égaux\n2. Périmètre = 3 × côté\n3. Calculer : P = 3 × 8 = 24 cm",
            svg_content: '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><polygon points="100,30 50,120 150,120" fill="lightgreen" stroke="green" stroke-width="2"/><text x="95" y="25">A</text><text x="40" y="140">B</text><text x="155" y="140">C</text></svg>',
            created_at: new Date(),
            updated_at: new Date()
        },
        square: {
            id: 3,
            title: "Carré - Aire et Périmètre",
            question: "Un carré a un côté de 7 cm. Calculer son aire et son périmètre.",
            type: "square",
            explanation: "1. Aire du carré : A = côté²\n2. A = 7² = 49 cm²\n3. Périmètre du carré : P = 4 × côté\n4. P = 4 × 7 = 28 cm",
            svg_content: '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect x="50" y="50" width="100" height="100" fill="lightyellow" stroke="orange" stroke-width="2"/><text x="40" y="45">7cm</text></svg>',
            created_at: new Date(),
            updated_at: new Date()
        },
        rectangle: {
            id: 4,
            title: "Rectangle - Dimensions",
            question: "Un rectangle a une longueur de 10 cm et une largeur de 6 cm. Calculer son aire.",
            type: "rectangle",
            explanation: "1. Aire du rectangle : A = longueur × largeur\n2. A = 10 × 6 = 60 cm²",
            svg_content: '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect x="25" y="60" width="150" height="90" fill="lightcoral" stroke="red" stroke-width="2"/><text x="90" y="55">10cm</text><text x="10" y="110">6cm</text></svg>',
            created_at: new Date(),
            updated_at: new Date()
        },
        circle: {
            id: 5,
            title: "Cercle - Aire et Circonférence",
            question: "Un cercle a un rayon de 4 cm. Calculer son aire et sa circonférence.",
            type: "circle",
            explanation: "1. Aire du cercle : A = π × r²\n2. A = π × 4² = 16π ≈ 50.27 cm²\n3. Circonférence : C = 2π × r\n4. C = 2π × 4 = 8π ≈ 25.13 cm",
            svg_content: '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="75" r="60" fill="lightpink" stroke="purple" stroke-width="2"/><line x1="100" y1="75" x2="160" y2="75" stroke="black" stroke-width="1"/><text x="125" y="70">r=4cm</text></svg>',
            created_at: new Date(),
            updated_at: new Date()
        },
        arc: {
            id: 6,
            title: "Arc de Cercle - Longueur",
            question: "Calculer la longueur d'un arc de cercle de rayon 5 cm et d'angle 60°.",
            type: "arc",
            explanation: "1. Longueur d'arc : L = (θ/360°) × 2πr\n2. L = (60°/360°) × 2π × 5\n3. L = (1/6) × 10π = 5π/3\n4. L ≈ 5.24 cm",
            svg_content: '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><path d="M 100 75 L 160 75 A 60 60 0 0 1 130 125" fill="none" stroke="teal" stroke-width="3"/><circle cx="100" cy="75" r="3" fill="black"/><text x="85" y="70">O</text><text x="125" y="65">60°</text></svg>',
            created_at: new Date(),
            updated_at: new Date()
        }
    };
    
    if (type && staticExamples[type]) {
        return Promise.resolve(staticExamples[type]);
    }
    
    // Return a random example if no type specified
    const types = Object.keys(staticExamples) as MathProblemType[];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return Promise.resolve(staticExamples[randomType]);
};