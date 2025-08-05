// ---- Configuration ----
const API_KEY  = 'e3oA7kTHjTTLCSCxsovQFtbjw1XIw2GxcMPgViUE';
const BASE_URL = 'https://quizapi.io/api/v1/questions?limit=1';

// ---- State ----
let stats = JSON.parse(localStorage.getItem('quizStats')) || { correct: 0, incorrect: 0 };

// ---- DOM Refs ----
const correctEl    = document.getElementById('correct-count');
const incorrectEl  = document.getElementById('incorrect-count');
const resetBtn     = document.getElementById('reset-btn');
const selectSect   = document.getElementById('select-difficulty');
const diffForm     = document.getElementById('difficulty-form');
const diffInput    = document.getElementById('difficulty');
const questionSect = document.getElementById('question-panel');
const questionH2   = document.getElementById('question-text');
const choicesDiv   = document.getElementById('choices');
const answerForm   = document.getElementById('answer-form');
const nextBtn      = document.getElementById('next-question');

// ---- Initialize ----
updateStatsUI();
bindEventListeners();

// ---- Bind all listeners ----
function bindEventListeners() {
  resetBtn.addEventListener('click', onReset);
  diffForm.addEventListener('submit', onFetchQuestion);
  answerForm.addEventListener('submit', onSubmitAnswer);
  nextBtn.addEventListener('click', onNextQuestion);
}

// ---- UI Updaters ----
function updateStatsUI() {
  correctEl.textContent   = stats.correct;
  incorrectEl.textContent = stats.incorrect;
}

function saveStats() {
  localStorage.setItem('quizStats', JSON.stringify(stats));
}

// ---- Handlers ----
function onReset() {
  stats = { correct: 0, incorrect: 0 };
  saveStats();
  updateStatsUI();
}

async function onFetchQuestion(e) {
  e.preventDefault();
  const level = diffInput.value;
  if (!level) {
    alert('Please select a difficulty level.');
    return;
  }

  try {
    const url = `${BASE_URL}&difficulty=${encodeURIComponent(level)}&apiKey=${API_KEY}`;
    const res = await fetch(url);
    const [q] = await res.json();

    renderQuestion(q);
    selectSect.classList.add('hidden');
    questionSect.classList.remove('hidden');
    nextBtn.classList.add('hidden');
  } catch (err) {
    console.error(err);
    alert('Error fetching question. Try again.');
  }
}

function renderQuestion(q) {
  questionH2.textContent = q.question;
  choicesDiv.innerHTML   = '';

  // loop through answer_* properties
  Object.entries(q.answers).forEach(([key, text]) => {
    if (!text) return; // skip null
    const correct = q.correct_answers[`${key}_correct`] === 'true';

    const wrapper = document.createElement('div');
    wrapper.className = 'choice';
    wrapper.innerHTML = `
      <input type="radio" name="answer" id="${key}" value="${correct}">
      <label for="${key}">${text}</label>
    `;
    choicesDiv.append(wrapper);
  });
}

function onSubmitAnswer(e) {
  e.preventDefault();
  const sel = document.querySelector('input[name="answer"]:checked');
  if (!sel) {
    alert('Please choose an answer.');
    return;
  }

  // tally
  if (sel.value === 'true') stats.correct++;
  else stats.incorrect++;
  saveStats();
  updateStatsUI();

  // show Next
  nextBtn.classList.remove('hidden');
}

function onNextQuestion() {
  // reset form & UI
  answerForm.reset();
  questionSect.classList.add('hidden');
  selectSect.classList.remove('hidden');
}

