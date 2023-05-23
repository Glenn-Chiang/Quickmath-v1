const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const timeButtons = document.querySelectorAll('.time-btn');
const numButtons = document.querySelectorAll('.num-btn');
const settingButtons = document.querySelectorAll('.difficulty-btn, .time-btn, .num-btn')

const startButton = document.getElementById('start-btn');
const drillWindow = document.getElementById('drill-window');

const problemNumberDisplay = document.getElementById('problem-number');
const numProblemsDisplay = document.getElementById('num-problems');
const timerDisplay = document.getElementById('timer');

let timer; // Interval

const problemContainer = document.querySelector('.problem-container');

const num1Elem = document.getElementById('num1');
const num2Elem = document.getElementById('num2');
const operatorElem = document.getElementById('operator');
const answerField = document.getElementById('answer');

const resultsElem = document.querySelector('.results');

// Default settings
let mode = 'min-time';
let difficulty = 'medium';
let timeLimit = 30;
let numProblems = 20;

let drillIsActive = false;
enableSettings();


startButton.addEventListener('click', function() {
    toggleStart();
    resultsElem.classList.remove('show');    

    if (!drillIsActive) {
    // Start drill
        drillIsActive = true;

        if (!drillWindow.classList.contains('active')) {
            drillWindow.classList.add('active');
        }

        if (problemContainer.classList.contains('hide')) {
            problemContainer.classList.remove('hide');
        }

        answerField.focus(); // Once drill starts, go to the input field so the user can start typing immediately
        disableSettings(); // Prevent user from changing settings while a drill is running

        if (mode === 'min-time') {
            runMinTimeDrill(difficulty, numProblems);
        }
        else {
            runMaxNumDrill(difficulty, timeLimit);
        }
                
    // Quit drill
    } else {
        resetDrill();
        drillWindow.classList.remove('active');
    } 
})


function resetDrill() {
    drillIsActive = false;
    clearInterval(timer);
    answerField.value = '';
    enableSettings();       
}


// Toggle button between Start and Quit
function toggleStart() {
    if (!startButton.classList.contains('active')) {
        startButton.classList.add('active');
        startButton.innerHTML = '<h2>Quit</h2>';
    } else {
        startButton.classList.remove('active');
        startButton.innerHTML = '<h2>Start</h2>';
    }
}

// Settings are enabled as long as no drill is running
function enableSettings() {
    for (let button of settingButtons) {
        button.addEventListener('click', toggleSetting);
    }
}

// When drill is running, settings buttons will not be active
function disableSettings() {
    for (let button of settingButtons) {
        button.removeEventListener('click', toggleSetting);
    }
}

function toggleSetting(event) {
    const clickedButton = event.target;

    // If button is already active, nothing happens
    if (clickedButton.classList.contains('active')) {
        return;
    } 
    
    if (clickedButton.classList.contains('difficulty-btn')) {
        toggleButton(clickedButton, difficultyButtons);
        difficulty = clickedButton.id;

    } else if (clickedButton.classList.contains('time-btn')) {
        toggleButton(clickedButton, timeButtons);
        timeLimit = Number(clickedButton.value);
        
    } else {
        toggleButton(clickedButton, numButtons);
        numProblems = Number(clickedButton.value);
    }
}

function toggleButton(clickedButton, settingButtons) {
    // If another button within the same setting is already active, deactivate it
    for (let button of settingButtons) {
        if (button.classList.contains('active')) {
            button.classList.remove('active');
        }
    }
    // Activate the clicked button 
    clickedButton.classList.add('active');
}


function displayResults(mode, difficulty, setting, score) {
    if (mode === 'min-time') {
        document.querySelector('.results span.mode').innerHTML = 'Blitz';
        document.querySelector('.results span.setting-type').innerHTML = 'Number of Problems';
        document.querySelector('.results span.setting').innerHTML = setting;
        document.querySelector('.results span.score-type').innerHTML = 'Time taken';
        document.querySelector('.results span.score').innerHTML = score + 's';
    } else {
        document.querySelector('.results span.mode').innerHTML = 'Frenzy';
        document.querySelector('.results span.setting-type').innerHTML = 'Time Limit';
        document.querySelector('.results span.setting').innerHTML = Number(setting) + 's';
        document.querySelector('.results span.score-type').innerHTML = 'Problems solved';
        document.querySelector('.results span.score').innerHTML = score;
    }
    document.querySelector('.results span.difficulty').innerHTML = difficulty;
 
    resultsElem.classList.add('show');
    resultsElem.focus();
}


// Solve the given number of problems in the shortest possible time
function runMinTimeDrill(difficulty, numProblems) {
    let problemNumber = 1;
    let currentProblem = generateProblem(difficulty);
    renderProblem(currentProblem, problemNumber);
    numProblemsDisplay.innerHTML = '/ ' + numProblems;
    timerDisplay.innerHTML = '0';

    let timeElapsed = 1;
    timer = setInterval(() => {
        timerDisplay.innerHTML = timeElapsed;
        timeElapsed += 1;
    }, 1000)

    function check_answer(event) {
        if (event.key === 'Enter') {
            const answer = Number(event.target.value);
            // If user enters correct answer, progress to next problem
            if (answer === currentProblem.solution) {
                // Once user has solved all problems i.e. completed the drill:
                if (problemNumber >= numProblems) {
                    resetDrill();
                    toggleStart();

                    answerField.removeEventListener('keydown', check_answer);

                    problemContainer.classList.add('hide');
                    resultsElem.classList.add('show');
                    displayResults('min-time', difficulty, numProblems, timeElapsed - 1);
                    return;
                }

                problemNumber += 1;
                currentProblem = generateProblem(difficulty);
                renderProblem(currentProblem, problemNumber);

            // If user enters wrong answer, do not progress to next problem
            } 

            answerField.value = '' // Clear the input field regardless of whether the answer is correct or wrong
        }
    }

    answerField.addEventListener('keydown', check_answer);
    // answerField.addEventListener('keydown', event => {
    //     if (event.key === 'Enter') {
    //         const answer = Number(event.target.value);
    //         // If user enters correct answer, progress to next problem
    //         if (answer === currentProblem.solution) {
    //             // Once user has solved all problems i.e. completed the drill:
    //             if (problemNumber >= numProblems) {
    //                 resetDrill();
    //                 toggleStart();

    //                 problemContainer.classList.add('hide');
    //                 resultsElem.classList.add('show');
    //                 displayResults('min-time', difficulty, numProblems, timeElapsed - 1);
    //                 return;
    //             }

    //             problemNumber += 1;
    //             currentProblem = generateProblem(difficulty);
    //             renderProblem(currentProblem, problemNumber);

    //         // If user enters wrong answer, do not progress to next problem
    //         } 

    //         answerField.value = '' // Clear the input field regardless of whether the answer is correct or wrong
    //     }
    // })
}

// Solve as many questions as possible within the given time
function runMaxNumDrill(difficulty, timeLimit) {
    let problemNumber = 1;
    let currentProblem = generateProblem(difficulty);
    renderProblem(currentProblem); // Display the current problem along with its problem number

    let timeLeft = timeLimit;
    const timer = setInterval(function() {
        if (timeLeft <= 0) {
            clearInterval(timer);
            return;
        } else {
            timerDisplay.innerHTML = timeLeft;
            timeLeft -= 1;
        }
    }, 1000)

    answerField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const answer = Number(event.target.value);
            // If user enters correct answer, progress to next problem
            if (answer === currentProblem.solution) {
                currentProblem = generateProblem(difficulty);
                renderProblem(currentProblem, problemNumber);
                problemNumber += 1;

            // If user enters wrong answer, do not progress to next problem
            } else {
                
            }

            answerField.value = '' // Clear the input field regardless of whether the answer is correct or wrong
        }
    })
}


// Visually update the problem displayed on the screen
function renderProblem(problem, problemNumber) {
    num1Elem.innerHTML = problem.num1;
    num2Elem.innerHTML = problem.num2;
    operatorElem.innerHTML = problem.operator;
    problemNumberDisplay.innerHTML = problemNumber;
}

function generateProblem(difficulty) {
    let problem; 

    const operators = ['+', '-', 'x', '/']

    // Generate random number within range
    function randint(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function generateEasyProblem() {
        const operator = operators[randint(0,2)]; // no division
        let num1, num2;

        if (operator === '+' || operator === '-') {
            num1 = randint(2, 100);
            num2 = randint(2, 100);
        } else if (operator === 'x') {
            num1 = randint(2, 12);
            num2 = randint(2, 12);
        }
        
        const problem = {
            num1: Math.max(num1, num2), // Num1 will always be greater than num2,
            num2: Math.min(num1, num2), // so the solution will always be positive
            operator
        };

        return problem;
    }

    function generateMediumProblem() {
        const operator = operators[randint(0,2)];
        const num1 = randint(2, 100);
        let num2;

        if (operator === '+' || operator === '-') {
            num2 = randint(2, 100);
        } else {
            num2 = randint(2, 12);
        }
        
        const problem = { num1, num2, operator };
        return problem;
    }

    function generateHardProblem() {
        const operator = operators[randint(0,2)];
        const num1 = randint(2, 100);
        const num2 = randint(2, 100);
        const problem = { num1, num2, operator };
        return problem;
    }

    function computeSolution(problem) {
        let solution;

        if (problem.operator === '+') {
            solution = problem.num1 + problem.num2;
        } else if (problem.operator === '-') {
            solution = problem.num1 - problem.num2;
        } else {
            solution = problem.num1 * problem.num2;
        }

        return solution;
    }

    if (difficulty === 'easy') {
        problem = generateEasyProblem();
    } else if (difficulty === 'medium') {
        problem = generateMediumProblem();
    } else {
        problem = generateHardProblem();
    }

    problem.solution = computeSolution(problem);
    return problem;
}





// Toggle difficulty descriptions
const descriptionButtons = document.querySelectorAll('.description-button');

for (let descriptionButton of descriptionButtons) {
    descriptionButton.addEventListener('click', function () {
        descriptionButton.nextElementSibling.classList.toggle('show');
        
        const icon = descriptionButton.querySelector('i');
        if (icon.className == 'fa fa-chevron-down') {
            icon.className = 'fa fa-chevron-up';
        } else {
            icon.className = 'fa fa-chevron-down';
        }
    })
}