class DeutscheHauptstadteQuiz {
    constructor() {
        // Alle deutschen Bundesländer mit ihren Hauptstädten
        this.bundeslaender = [
            { name: 'Baden-Württemberg', hauptstadt: 'Stuttgart', hint: 'Heimat von Mercedes-Benz und Porsche' },
            { name: 'Bayern', hauptstadt: 'München', hint: 'Oktoberfest und Weißwurst' },
            { name: 'Berlin', hauptstadt: 'Berlin', hint: 'Deutschlands Hauptstadt und größte Stadt' },
            { name: 'Brandenburg', hauptstadt: 'Potsdam', hint: 'Schloss Sanssouci befindet sich hier' },
            { name: 'Bremen', hauptstadt: 'Bremen', hint: 'Stadtmusikanten und Hansestadt' },
            { name: 'Hamburg', hauptstadt: 'Hamburg', hint: 'Tor zur Welt, Hafenstadt' },
            { name: 'Hessen', hauptstadt: 'Wiesbaden', hint: 'Nicht Frankfurt, sondern die Kurstadt!' },
            { name: 'Mecklenburg-Vorpommern', hauptstadt: 'Schwerin', hint: 'Land der tausend Seen' },
            { name: 'Niedersachsen', hauptstadt: 'Hannover', hint: 'Messestadt und Expo 2000' },
            { name: 'Nordrhein-Westfalen', hauptstadt: 'Düsseldorf', hint: 'Mode und Kunst am Rhein' },
            { name: 'Rheinland-Pfalz', hauptstadt: 'Mainz', hint: 'Gutenberg und das ZDF' },
            { name: 'Saarland', hauptstadt: 'Saarbrücken', hint: 'Kleinstes Flächenland Deutschlands' },
            { name: 'Sachsen', hauptstadt: 'Dresden', hint: 'Elbflorenz und Frauenkirche' },
            { name: 'Sachsen-Anhalt', hauptstadt: 'Magdeburg', hint: 'Otto der Große regierte hier' },
            { name: 'Schleswig-Holstein', hauptstadt: 'Kiel', hint: 'Land zwischen den Meeren' },
            { name: 'Thüringen', hauptstadt: 'Erfurt', hint: 'Grünes Herz Deutschlands' }
        ];

        // Spielzustand
        this.currentQuestion = 0;
        this.score = 0;
        this.streak = 0;
        this.bestStreak = parseInt(localStorage.getItem('bestStreak') || '0');
        this.gameMode = 'classic';
        this.questions = [];
        this.correctAnswers = 0;
        this.hintUsed = false;
        this.gameStartTime = null;
        this.timer = null;
        this.timePerQuestion = 10; // Sekunden für Schnell-Modus
        
        this.initializeGame();
    }

    initializeGame() {
        this.setupEventListeners();
        this.shuffleQuestions();
        this.renderBundeslaenderOverview();
        this.updateUI();
        this.showQuestion();
    }

    setupEventListeners() {
        // Spielmodus-Buttons
        document.getElementById('mode-classic').addEventListener('click', () => this.setGameMode('classic'));
        document.getElementById('mode-multiple').addEventListener('click', () => this.setGameMode('multiple'));
        document.getElementById('mode-speed').addEventListener('click', () => this.setGameMode('speed'));

        // Antwort-Submit
        document.getElementById('submit-btn').addEventListener('click', () => this.submitAnswer());
        document.getElementById('answer-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });

        // Multiple Choice Buttons
        document.querySelectorAll('.choice-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => this.selectChoice(index));
        });

        // Kontroll-Buttons
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('play-again-btn').addEventListener('click', () => this.restartGame());
        
        // Tipp-Button
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
    }

    setGameMode(mode) {
        this.gameMode = mode;
        
        // UI Update für Modus-Buttons
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`mode-${mode}`).classList.add('active');
        
        // Anzeige der entsprechenden Input-Sektion
        if (mode === 'multiple') {
            document.getElementById('text-input-section').style.display = 'none';
            document.getElementById('multiple-choice-section').style.display = 'block';
        } else {
            document.getElementById('text-input-section').style.display = 'flex';
            document.getElementById('multiple-choice-section').style.display = 'none';
        }
        
        this.restartGame();
    }

    shuffleQuestions() {
        this.questions = [...this.bundeslaender].sort(() => Math.random() - 0.5);
    }

    showQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endGame();
            return;
        }

        const currentBundesland = this.questions[this.currentQuestion];
        
        // Frage anzeigen
        document.getElementById('question-text').textContent = 
            `Wie lautet die Hauptstadt von ${currentBundesland.name}?`;
        
        // Fortschritt aktualisieren
        document.getElementById('question-number').textContent = this.currentQuestion + 1;
        document.getElementById('total-questions').textContent = this.questions.length;
        
        // Input zurücksetzen
        document.getElementById('answer-input').value = '';
        document.getElementById('answer-input').focus();
        
        // Feedback verstecken
        document.getElementById('feedback').style.display = 'none';
        document.getElementById('hint-text').style.display = 'none';
        document.getElementById('next-btn').style.display = 'none';
        
        // Tipp zurücksetzen
        this.hintUsed = false;
        document.getElementById('hint-btn').disabled = false;
        
        // Multiple Choice Setup
        if (this.gameMode === 'multiple') {
            this.setupMultipleChoice(currentBundesland);
        }
        
        // Timer für Schnell-Modus
        if (this.gameMode === 'speed') {
            this.startQuestionTimer();
        }
        
        this.updateBundeslaenderOverview();
    }

    setupMultipleChoice(correctBundesland) {
        const choices = [correctBundesland.hauptstadt];
        
        // 3 falsche Antworten hinzufügen
        const otherCapitals = this.bundeslaender
            .filter(bl => bl.hauptstadt !== correctBundesland.hauptstadt)
            .map(bl => bl.hauptstadt)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        choices.push(...otherCapitals);
        choices.sort(() => Math.random() - 0.5);
        
        // Buttons mit Antworten füllen
        const choiceBtns = document.querySelectorAll('.choice-btn');
        choiceBtns.forEach((btn, index) => {
            btn.textContent = choices[index];
            btn.classList.remove('selected', 'correct', 'incorrect');
            btn.disabled = false;
            btn.dataset.answer = choices[index];
        });
    }

    selectChoice(choiceIndex) {
        if (this.gameMode !== 'multiple') return;
        
        // Alle Buttons deselektieren
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Gewählten Button markieren
        const selectedBtn = document.querySelectorAll('.choice-btn')[choiceIndex];
        selectedBtn.classList.add('selected');
        
        // Antwort direkt prüfen
        this.checkMultipleChoiceAnswer(selectedBtn.dataset.answer);
    }

    startQuestionTimer() {
        let timeLeft = this.timePerQuestion;
        this.updateTimerDisplay(timeLeft);
        
        this.questionTimer = setInterval(() => {
            timeLeft--;
            this.updateTimerDisplay(timeLeft);
            
            if (timeLeft <= 3) {
                document.getElementById('timer').classList.add('timer-critical');
            } else if (timeLeft <= 5) {
                document.getElementById('timer').classList.add('timer-warning');
            }
            
            if (timeLeft <= 0) {
                clearInterval(this.questionTimer);
                this.skipQuestion();
            }
        }, 1000);
    }

    updateTimerDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    stopQuestionTimer() {
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
        document.getElementById('timer').classList.remove('timer-warning', 'timer-critical');
    }

    submitAnswer() {
        const userAnswer = document.getElementById('answer-input').value.trim();
        if (!userAnswer) return;
        
        this.checkAnswer(userAnswer);
    }

    checkAnswer(userAnswer) {
        const correctAnswer = this.questions[this.currentQuestion].hauptstadt;
        const isCorrect = this.normalizeAnswer(userAnswer) === this.normalizeAnswer(correctAnswer);
        
        this.stopQuestionTimer();
        this.processAnswer(isCorrect, correctAnswer);
    }

    checkMultipleChoiceAnswer(selectedAnswer) {
        const correctAnswer = this.questions[this.currentQuestion].hauptstadt;
        const isCorrect = selectedAnswer === correctAnswer;
        
        // Visuelle Rückmeldung für Multiple Choice
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.answer === correctAnswer) {
                btn.classList.add('correct');
            } else if (btn.classList.contains('selected') && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        this.stopQuestionTimer();
        this.processAnswer(isCorrect, correctAnswer);
    }

    normalizeAnswer(answer) {
        return answer.toLowerCase()
            .replace(/ä/g, 'ae')
            .replace(/ö/g, 'oe')
            .replace(/ü/g, 'ue')
            .replace(/ß/g, 'ss')
            .replace(/[^a-z]/g, '');
    }

    processAnswer(isCorrect, correctAnswer) {
        const feedback = document.getElementById('feedback');
        
        if (isCorrect) {
            // Punkte berechnen
            let points = 10;
            if (this.gameMode === 'speed') points += 5; // Bonus für Schnell-Modus
            if (this.streak >= 3) points += 2; // Serien-Bonus
            if (this.hintUsed) points -= 2; // Tipp-Abzug
            
            this.score += Math.max(points, 1);
            this.streak++;
            this.correctAnswers++;
            
            if (this.streak > this.bestStreak) {
                this.bestStreak = this.streak;
                localStorage.setItem('bestStreak', this.bestStreak.toString());
            }
            
            feedback.className = 'feedback correct';
            feedback.textContent = `🎉 Richtig! ${correctAnswer} ist korrekt. (+${Math.max(points, 1)} Punkte)`;
        } else {
            this.streak = 0;
            feedback.className = 'feedback incorrect';
            feedback.textContent = `❌ Leider falsch. Die richtige Antwort ist: ${correctAnswer}`;
        }
        
        feedback.style.display = 'block';
        document.getElementById('next-btn').style.display = 'inline-block';
        
        // Input deaktivieren
        document.getElementById('answer-input').disabled = true;
        document.getElementById('submit-btn').disabled = true;
        
        this.updateUI();
        this.updateBundeslaenderOverview();
    }

    showHint() {
        if (this.hintUsed) return;
        
        const hint = this.questions[this.currentQuestion].hint;
        document.getElementById('hint-text').textContent = hint;
        document.getElementById('hint-text').style.display = 'block';
        document.getElementById('hint-btn').disabled = true;
        
        this.hintUsed = true;
    }

    nextQuestion() {
        this.currentQuestion++;
        
        // Input wieder aktivieren
        document.getElementById('answer-input').disabled = false;
        document.getElementById('submit-btn').disabled = false;
        
        this.showQuestion();
    }

    skipQuestion() {
        const correctAnswer = this.questions[this.currentQuestion].hauptstadt;
        
        this.stopQuestionTimer();
        
        const feedback = document.getElementById('feedback');
        feedback.className = 'feedback incorrect';
        feedback.textContent = `⏭️ Übersprungen. Die richtige Antwort wäre: ${correctAnswer}`;
        feedback.style.display = 'block';
        
        document.getElementById('next-btn').style.display = 'inline-block';
        
        this.streak = 0;
        this.updateUI();
        this.updateBundeslaenderOverview();
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
        document.getElementById('progress').textContent = 
            `${this.correctAnswers}/${this.questions.length}`;
        
        // Gesamtzeit aktualisieren
        if (this.gameStartTime && this.gameMode !== 'speed') {
            const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    renderBundeslaenderOverview() {
        const grid = document.getElementById('bundeslaender-grid');
        grid.innerHTML = '';
        
        this.questions.forEach((bundesland, index) => {
            const item = document.createElement('div');
            item.className = 'bundesland-item';
            
            item.innerHTML = `
                <div>
                    <div class="bundesland-name">${bundesland.name}</div>
                    <div class="bundesland-capital">${bundesland.hauptstadt}</div>
                </div>
                <div class="status-icon">❓</div>
            `;
            
            grid.appendChild(item);
        });
    }

    updateBundeslaenderOverview() {
        const items = document.querySelectorAll('.bundesland-item');
        
        items.forEach((item, index) => {
            item.classList.remove('current', 'completed', 'incorrect');
            
            if (index < this.currentQuestion) {
                const wasCorrect = this.wasAnswerCorrect(index);
                item.classList.add(wasCorrect ? 'completed' : 'incorrect');
                const statusIcon = item.querySelector('.status-icon');
                statusIcon.textContent = wasCorrect ? '✅' : '❌';
            } else if (index === this.currentQuestion) {
                item.classList.add('current');
            }
        });
    }

    wasAnswerCorrect(questionIndex) {
        // Vereinfachte Logik: prüfen ob Frage übersprungen wurde
        return this.correctAnswers > questionIndex;
    }

    endGame() {
        this.stopQuestionTimer();
        
        const totalTime = this.gameStartTime ? 
            Math.floor((Date.now() - this.gameStartTime) / 1000) : 0;
        
        // Endstatistiken anzeigen
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('correct-answers').textContent = 
            `${this.correctAnswers}/${this.questions.length}`;
        document.getElementById('best-streak').textContent = this.bestStreak;
        
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        document.getElementById('final-time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Leistungsbewertung
        const percentage = (this.correctAnswers / this.questions.length) * 100;
        const performanceMsg = document.getElementById('performance-message');
        
        if (percentage >= 90) {
            performanceMsg.textContent = '🏆 Ausgezeichnet! Du kennst dich perfekt mit deutschen Hauptstädten aus!';
            performanceMsg.className = 'performance-message excellent';
        } else if (percentage >= 70) {
            performanceMsg.textContent = '👍 Gut gemacht! Du hast ein solides Wissen über deutsche Geografie.';
            performanceMsg.className = 'performance-message good';
        } else {
            performanceMsg.textContent = '📚 Nicht schlecht! Mit etwas Übung wirst du noch besser.';
            performanceMsg.className = 'performance-message needs-improvement';
        }
        
        document.getElementById('game-end').style.display = 'flex';
    }

    restartGame() {
        // Spiel zurücksetzen
        this.currentQuestion = 0;
        this.score = 0;
        this.streak = 0;
        this.correctAnswers = 0;
        this.hintUsed = false;
        this.gameStartTime = Date.now();
        
        this.stopQuestionTimer();
        
        // UI zurücksetzen
        document.getElementById('game-end').style.display = 'none';
        document.getElementById('answer-input').disabled = false;
        document.getElementById('submit-btn').disabled = false;
        document.getElementById('timer').classList.remove('timer-warning', 'timer-critical');
        
        // Neue Fragen mischen
        this.shuffleQuestions();
        this.renderBundeslaenderOverview();
        
        this.updateUI();
        this.showQuestion();
    }
}

// Spiel initialisieren wenn die Seite geladen ist
document.addEventListener('DOMContentLoaded', () => {
    new DeutscheHauptstadteQuiz();
});