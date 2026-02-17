const gameState = {
    score: 0,
    level: 1,
    timeLeft: 60,
    timer: null,
    currentQuestion: null,
    correctAnswer: null,
    questionsAnswered: 0,
    correctAnswers: 0,
    difficulty: 'easy',
    operations: ['+'],
    timeLimit: 60,
    adaptiveMode: false,
    gameActive: false,
    playerName: 'Player'
};

const elements = {
    time: document.getElementById('time'),
    score: document.getElementById('score'),
    level: document.getElementById('level'),
    question: document.getElementById('question'),
    answer: document.getElementById('answer'),
    feedback: document.getElementById('feedback'),
    startBtn: document.getElementById('startBtn'),
    submitBtn: document.getElementById('submitBtn'),
    nextBtn: document.getElementById('nextBtn'),
    applySettings: document.getElementById('applySettings'),
    leaderboard: document.getElementById('leaderboard'),
    scoreTableBody: document.getElementById('scoreTableBody'),
    retryBtn: document.getElementById('retryBtn'),
    progress: document.getElementById('progress')
};

elements.startBtn.addEventListener('click', startGame);
elements.submitBtn.addEventListener('click', checkAnswer);
elements.nextBtn.addEventListener('click', generateQuestion);
elements.applySettings.addEventListener('click', applySettings);
elements.retryBtn.addEventListener('click', resetGame);
elements.answer.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

updateUI();
loadLeaderboard();

function startGame() {
    gameState.playerName = prompt("Enter your name:", gameState.playerName) || gameState.playerName;
    gameState.score = 0;
    gameState.level = 1;
    gameState.timeLeft = gameState.timeLimit;
    gameState.questionsAnswered = 0;
    gameState.correctAnswers = 0;
    gameState.gameActive = true;
    
    elements.leaderboard.style.display = 'none';
    
    elements.startBtn.disabled = true;
    elements.submitBtn.disabled = false;
    elements.nextBtn.disabled = true;
    elements.answer.disabled = false;
    elements.answer.focus();
    
    startTimer();
    
    generateQuestion();
    
    updateUI();
}

function startTimer() {
    clearInterval(gameState.timer);
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        elements.time.textContent = gameState.timeLeft;
        updateProgressBar();
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function updateProgressBar() {
    const percentage = (gameState.timeLeft / gameState.timeLimit) * 100;
    elements.progress.style.width = `${percentage}%`;
    
    if (percentage < 20) {
        elements.progress.style.backgroundColor = 'var(--wrong)';
    } else if (percentage < 50) {
        elements.progress.style.backgroundColor = 'orange';
    } else {
        elements.progress.style.backgroundColor = 'var(--accent)';
    }
}

function generateQuestion() {
    if (!gameState.gameActive) return;
    
    elements.feedback.textContent = '';
    elements.feedback.className = 'feedback';
    elements.answer.value = '';
    
    let operation;
    if (gameState.adaptiveMode) {
        const successRate = gameState.questionsAnswered > 0 
            ? gameState.correctAnswers / gameState.questionsAnswered 
            : 0.5;
        
        if (successRate > 0.8) {
            gameState.level = Math.min(gameState.level + 1, 10);
        } else if (successRate < 0.4) {
            gameState.level = Math.max(gameState.level - 1, 1);
        }
        
        const availableOperations = [];
        if (gameState.operations.includes('+')) availableOperations.push('+');
        if (gameState.operations.includes('-')) availableOperations.push('-');
        if (gameState.level >= 3 && gameState.operations.includes('*')) availableOperations.push('*');
        if (gameState.level >= 5 && gameState.operations.includes('/')) availableOperations.push('/');
        
        operation = availableOperations[Math.floor(Math.random() * availableOperations.length)];
    } else {
        operation = gameState.operations[Math.floor(Math.random() * gameState.operations.length)];
    }
    let num1, num2;
    switch (gameState.difficulty) {
        case 'easy':
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            break;
        case 'medium':
            num1 = Math.floor(Math.random() * 50) + 1;
            num2 = Math.floor(Math.random() * 50) + 1;
            break;
        case 'hard':
            num1 = Math.floor(Math.random() * 100) + 1;
            num2 = Math.floor(Math.random() * 100) + 1;
            break;
        default: 
            const base = gameState.level * 10;
            num1 = Math.floor(Math.random() * base) + 1;
            num2 = Math.floor(Math.random() * base) + 1;
    }
    
    if (operation === '/') {
        num1 = num1 * num2;
    }
    if (operation === '-') {
        if (num1 < num2) {
            [num1, num2] = [num2, num1]; 
        }
    }
    
    gameState.currentQuestion = `${num1} ${operation} ${num2}`;
    gameState.correctAnswer = calculateAnswer(num1, operation, num2);
    elements.question.textContent = gameState.currentQuestion + " = ?";
    elements.submitBtn.disabled = false;
    elements.nextBtn.disabled = true;
}

function calculateAnswer(num1, operation, num2) {
    switch (operation) {
        case '+': return num1 + num2;
        case '-': return num1 - num2;
        case '*': return num1 * num2;
        case '/': return num1 / num2;
        default: return 0;
    }
}

function checkAnswer() {
    if (!gameState.gameActive) return;
    
    const userAnswer = parseFloat(elements.answer.value);
    
    if (isNaN(userAnswer)) {
        elements.feedback.textContent = "Please enter a valid number!";
        elements.feedback.className = "feedback wrong";
        return;
    }
    
    gameState.questionsAnswered++;
    
    if (Math.abs(userAnswer - gameState.correctAnswer) < 0.0001) {
        gameState.score += gameState.level * 10;
        gameState.correctAnswers++;
        elements.feedback.textContent = "Correct! Well done!";
        elements.feedback.className = "feedback correct";
        if (gameState.adaptiveMode && Math.random() > 0.7) {
            gameState.level = Math.min(gameState.level + 1, 10);
        }
    } else {
        elements.feedback.textContent = `Incorrect. The correct answer was ${gameState.correctAnswer}.`;
        elements.feedback.className = "feedback wrong";
        
        if (gameState.adaptiveMode && Math.random() > 0.7) {
            gameState.level = Math.max(gameState.level - 1, 1);
        }
    }
    
    updateUI();
    
    elements.submitBtn.disabled = true;
    elements.nextBtn.disabled = false;
}

function updateUI() {
    elements.score.textContent = gameState.score;
    elements.level.textContent = gameState.level;
    elements.time.textContent = gameState.timeLeft;
}

function endGame() {
    clearInterval(gameState.timer);
    gameState.gameActive = false;
    elements.answer.disabled = true;
    elements.submitBtn.disabled = true;
    elements.nextBtn.disabled = true;
    elements.startBtn.disabled = false;
    elements.question.textContent = `Game Over! Final Score: ${gameState.score}`;
    elements.feedback.textContent = `You answered ${gameState.correctAnswers} out of ${gameState.questionsAnswered} correctly.`;
    elements.feedback.className = "feedback";
    showLeaderboard();
    saveScore();
}

function resetGame() {
    elements.leaderboard.style.display = 'none';
    elements.question.textContent = "Ready to start?";
    elements.feedback.textContent = '';
    elements.answer.value = '';
    updateUI();
}

function applySettings() {
    const difficultyRadio = document.querySelector('input[name="difficulty"]:checked');
    gameState.difficulty = difficultyRadio.value;
    gameState.adaptiveMode = difficultyRadio.value === 'adaptive';
    gameState.operations = [];
    document.querySelectorAll('input[name="operations"]:checked').forEach(op => {
        gameState.operations.push(op.value);
    });
    if (gameState.operations.length === 0) {
        gameState.operations.push('+');
        document.querySelector('input[name="operations"][value="+"]').checked = true;
    }
    const timeLimitRadio = document.querySelector('input[name="timeLimit"]:checked');
    gameState.timeLimit = parseInt(timeLimitRadio.value);
    gameState.timeLeft = gameState.timeLimit;
    updateUI();
    elements.feedback.textContent = "Settings applied successfully!";
    elements.feedback.className = "feedback correct";
    setTimeout(() => {
        elements.feedback.textContent = '';
        elements.feedback.className = "feedback";
    }, 2000);
}

function showLeaderboard() {
    elements.leaderboard.style.display = 'block';
    loadLeaderboard();
}

function loadLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('mathQuizScores')) || [];
    scores.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return new Date(b.date) - new Date(a.date);
    });
    elements.scoreTableBody.innerHTML = '';
    scores.slice(0, 10).forEach((score, index) => {
        const row = document.createElement('tr');
        if (score.name === gameState.playerName && score.score === gameState.score) {
            row.style.backgroundColor = '#e3f2fd';
            row.style.fontWeight = 'bold';
        }
        
        const rankCell = document.createElement('td');
        rankCell.textContent = index + 1;
        row.appendChild(rankCell);
        
        const nameCell = document.createElement('td');
        nameCell.textContent = score.name;
        row.appendChild(nameCell);
        
        const scoreCell = document.createElement('td');
        scoreCell.textContent = score.score;
        row.appendChild(scoreCell);
        
        const levelCell = document.createElement('td');
        levelCell.textContent = score.level;
        row.appendChild(levelCell);
        
        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(score.date).toLocaleDateString();
        row.appendChild(dateCell);
        
        elements.scoreTableBody.appendChild(row);
    });
    if (scores.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 5;
        cell.textContent = 'No scores yet. Be the first!';
        cell.style.textAlign = 'center';
        row.appendChild(cell);
        elements.scoreTableBody.appendChild(row);
    }
}

function saveScore() {
    const scores = JSON.parse(localStorage.getItem('mathQuizScores')) || [];
    const existingIndex = scores.findIndex(s => 
        s.name === gameState.playerName && s.score === gameState.score
    );
    if (existingIndex === -1) {
        scores.push({
            name: gameState.playerName,
            score: gameState.score,
            level: gameState.level,
            date: new Date().toISOString(),
            correctAnswers: gameState.correctAnswers,
            totalQuestions: gameState.questionsAnswered
        });
        
        localStorage.setItem('mathQuizScores', JSON.stringify(scores));
    }
    logResearchData();
}

function logResearchData() {
    console.log("Research data:", {
        player: gameState.playerName,
        score: gameState.score,
        level: gameState.level,
        correctAnswers: gameState.correctAnswers,
        totalQuestions: gameState.questionsAnswered,
        difficulty: gameState.difficulty,
        operations: gameState.operations,
        timeLimit: gameState.timeLimit,
        date: new Date().toISOString()
    });
}