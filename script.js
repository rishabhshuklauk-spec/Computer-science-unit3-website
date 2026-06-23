const themeSelector = document.getElementById('themeSelector');

function loadTheme() {
    const savedTheme = localStorage.getItem('appTheme') || 'classic';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeSelector) {
        themeSelector.value = savedTheme;
    }
}

if (themeSelector) {
    themeSelector.addEventListener('change', (e) => {
        const theme = e.target.value;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('appTheme', theme);
    });
}

loadTheme();

const btnLearn = document.getElementById('btnLearn');
const btnProtocols = document.getElementById('btnProtocols');
const btnQuiz = document.getElementById('btnQuiz');

const viewLearn = document.getElementById('viewLearn');
const viewProtocols = document.getElementById('viewProtocols');
const viewQuiz = document.getElementById('viewQuiz');

function switchView(targetView, targetBtn) {
    viewLearn.classList.add('hidden-view');
    viewProtocols.classList.add('hidden-view');
    viewQuiz.classList.add('hidden-view');

    btnLearn.classList.remove('active');
    btnProtocols.classList.remove('active');
    btnQuiz.classList.remove('active');

    targetView.classList.remove('hidden-view');
    targetBtn.classList.add('active');
}

btnLearn.addEventListener('click', () => switchView(viewLearn, btnLearn));
btnProtocols.addEventListener('click', () => switchView(viewProtocols, btnProtocols));
btnQuiz.addEventListener('click', () => switchView(viewQuiz, btnQuiz));

let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

const quizSetup = document.getElementById('quizSetup');
const quizContent = document.getElementById('quizContent');
const quizResults = document.getElementById('quizResults');
const startQuizBtn = document.getElementById('startQuizBtn');
const questionText = document.getElementById('questionText');
const quizAnswer = document.getElementById('quizAnswer');
const submitAnswer = document.getElementById('submitAnswer');
const continueBtn = document.getElementById('continueBtn');
const quizFeedback = document.getElementById('quizFeedback');
const quizExplanation = document.getElementById('quizExplanation');
const inputWarning = document.getElementById('inputWarning');

const qDefinitions = [
    { q: "What hardware device is designed to route data packets across a wide area network?", a: "Router", alt: ["A router", "routers"], hint: "Its name comes directly from its job: it finds the best 'route' for packets." },
    { q: "What piece of hardware is required to connect any network-enabled device (e.g. using an Ethernet cable)?", a: "NIC", alt: ["Network Interface Card", "Network Interface Controller"], hint: "It is a 3-letter acronym that stands for Network Interface Card." },
    { q: "What does WAN stand for?", a: "Wide Area Network", alt: ["wide area networks"], hint: "The opposite of a Local Area Network (LAN)." },
    { q: "What network topology connects all computers to a central hub, switch or server?", a: "Star", alt: ["star network", "star topology"], hint: "Think of a shape in the night sky with points radiating from the center." },
    { q: "What is the main factor affecting network performance, measured in Mbps?", a: "Bandwidth", alt: [], hint: "Refers to the maximum amount of data that can travel through the 'width' of the connection." },
    { q: "What is the time delay between the moment that transmission starts and when it is received?", a: "Latency", alt: [], hint: "Another word for delay. It starts with an 'L'." },
    { q: "What is the physical component that receives data from a network and converts it into radio waves?", a: "WAP", alt: ["Wireless Access Point"], hint: "It's a 3-letter acronym standing for Wireless Access Point." }
];

const qProtocols = [
    { q: "Which protocol is used for accessing and receiving web pages in the form of HTML?", a: "HTTP", alt: ["HyperText Transfer Protocol", "HTTPS"], hint: "It stands for HyperText Transfer Protocol." },
    { q: "Which protocol receives and holds email for an individual until they pick it up?", a: "POP", alt: ["Post Office Protocol"], hint: "Think of a real-world building where mail is held: the Post Office (Protocol)." },
    { q: "Which protocol is used for sending e-mail messages between servers?", a: "SMTP", alt: ["Simple Mail Transfer Protocol"], hint: "It stands for Simple Mail Transfer Protocol." },
    { q: "Which protocol is used when transferring computer files between a client and server?", a: "FTP", alt: ["File Transfer Protocol"], hint: "It stands for File Transfer Protocol." },
    { q: "Which protocol stores email messages on a server but allows users to view them as though they were local?", a: "IMAP", alt: ["Internet Messaging Access Protocol", "Internet Message Access Protocol"], hint: "It stands for Internet Message Access Protocol." }
];

const qLayers = [
    { q: "Which TCP/IP layer encodes the data being sent so that it will be understandable by the recipient?", a: "Application", alt: ["Application layer"], hint: "This is the top layer where your web browser or email client operates." },
    { q: "Which TCP/IP layer splits the data into packets and adds packet information like sequence numbers?", a: "Transport", alt: ["Transport layer"], hint: "This layer handles the 'transportation' mechanics of the packets." },
    { q: "Which TCP/IP layer attaches the IP address of the sender and the destination IP address?", a: "Internet", alt: ["Internet layer"], hint: "It shares its name with the global network of networks." },
    { q: "Which TCP/IP layer attaches the MAC addresses of the sender and the recipient?", a: "Link", alt: ["Link layer"], hint: "This layer provides the physical 'link' between devices." }
];

function generateQuestions(types, count) {
    let pool = [];
    if (types.includes('definitions')) pool = pool.concat(qDefinitions);
    if (types.includes('protocols')) pool = pool.concat(qProtocols);
    if (types.includes('layers')) pool = pool.concat(qLayers);

    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return pool.slice(0, count);
}

if (startQuizBtn) {
    startQuizBtn.addEventListener('click', () => {
        const tDef = document.getElementById('typeDefinitions').checked;
        const tPro = document.getElementById('typeProtocols').checked;
        const tLay = document.getElementById('typeLayers').checked;
        const count = parseInt(document.getElementById('questionCount').value);

        const types = [];
        if (tDef) types.push('definitions');
        if (tPro) types.push('protocols');
        if (tLay) types.push('layers');

        if (types.length === 0) {
            document.getElementById('setupError').style.display = 'block';
            return;
        }

        document.getElementById('setupError').style.display = 'none';
        quizQuestions = generateQuestions(types, count);

        if (quizQuestions.length === 0) return;

        currentQuestionIndex = 0;
        score = 0;

        quizSetup.classList.add('hidden-view');
        quizContent.classList.remove('hidden-view');
        loadQuestion();
    });
}

function loadQuestion() {
    const quizAnswerContainer = document.getElementById('quizAnswerContainer');
    if (!quizAnswerContainer) return;
    
    quizAnswerContainer.innerHTML = '';
    const qfb = document.getElementById('quizFeedback');
    if(qfb) qfb.textContent = '';
    if(quizExplanation) quizExplanation.textContent = '';
    if(inputWarning) inputWarning.textContent = '';
    if(submitAnswer) submitAnswer.classList.remove('hidden-view');
    if(continueBtn) continueBtn.classList.add('hidden-view');

    const currentQ = quizQuestions[currentQuestionIndex];
    questionText.textContent = currentQ.q;
    
    const words = currentQ.a.split(' ');
    words.forEach((word, index) => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'quiz-word-input';
        input.autocomplete = 'off';
        input.style.width = '120px';
        input.style.textAlign = 'center';
        input.style.textTransform = 'lowercase';
        input.style.padding = '10px';
        input.style.borderRadius = 'var(--radius)';
        input.style.border = '1px solid var(--border-color)';
        input.style.background = 'var(--bg-input)';
        input.style.color = 'var(--text-main)';
        input.style.fontSize = '1.1rem';
        input.style.fontFamily = "'Bahnschrift', sans-serif";
        
        input.addEventListener('input', () => {
            input.value = input.value.replace(/\s+/g, '').toLowerCase();
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                const next = quizAnswerContainer.children[index + 1];
                if (next) next.focus();
            } else if (e.key === 'Enter') {
                if (index === words.length - 1 && !submitAnswer.classList.contains('hidden-view')) {
                    checkAnswer();
                } else {
                    const next = quizAnswerContainer.children[index + 1];
                    if (next) {
                        next.focus();
                    } else if (!submitAnswer.classList.contains('hidden-view')) {
                        checkAnswer();
                    }
                }
            }
        });
        
        quizAnswerContainer.appendChild(input);
    });
    
    if (quizAnswerContainer.children.length > 0) {
        quizAnswerContainer.children[0].focus();
    }
}

function checkAnswer() {
    const quizAnswerContainer = document.getElementById('quizAnswerContainer');
    const inputs = quizAnswerContainer.querySelectorAll('.quiz-word-input');
    const userWords = Array.from(inputs).map(input => input.value.trim().toLowerCase());
    const userAnswer = userWords.join(' ');
    const currentQ = quizQuestions[currentQuestionIndex];
    const correctAnswer = currentQ.a.toLowerCase();
    const altAnswers = currentQ.alt.map(ans => ans.toLowerCase());

    if (userAnswer === correctAnswer || altAnswers.includes(userAnswer)) {
        score++;
        const qfb = document.getElementById('quizFeedback');
        if(qfb) {
            qfb.textContent = "Correct!";
            qfb.style.color = "#4caf50";
        }
        inputs.forEach(input => {
            input.style.borderColor = "#4caf50";
            input.style.color = "#4caf50";
        });
    } else {
        const qfb = document.getElementById('quizFeedback');
        if(qfb) {
            qfb.textContent = "Incorrect. The correct answer is shown below.";
            qfb.style.color = "#ff5252";
        }
        const words = currentQ.a.toLowerCase().split(' ');
        inputs.forEach((input, index) => {
            if (words[index]) {
                input.value = words[index];
            }
            input.style.borderColor = "#ff5252";
            input.style.color = "#ff5252";
        });
    }

    inputs.forEach(input => input.disabled = true);
    if(submitAnswer) submitAnswer.classList.add('hidden-view');
    if(continueBtn) {
        continueBtn.classList.remove('hidden-view');
    }
}

if (submitAnswer) {
    submitAnswer.addEventListener('click', checkAnswer);
}

if (continueBtn) {
    continueBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizQuestions.length) {
            loadQuestion();
        } else {
            quizContent.classList.add('hidden-view');
            quizResults.classList.remove('hidden-view');
            document.getElementById('scoreText').textContent = `You scored ${score} out of ${quizQuestions.length}`;
        }
    });
}

const restartQuiz = document.getElementById('restartQuiz');
if (restartQuiz) {
    restartQuiz.addEventListener('click', () => {
        quizResults.classList.add('hidden-view');
        quizSetup.classList.remove('hidden-view');
    });
}

const ipOctets = document.querySelectorAll('.ip-octet');
const ipBinaryOut = document.getElementById('ipBinaryOut');

function updateIpBinary() {
    if (!ipBinaryOut) return;
    let binaries = [];
    ipOctets.forEach(input => {
        let val = parseInt(input.value);
        if (isNaN(val)) val = 0;
        if (val < 0) {
            val = 0;
            input.value = 0;
        }
        if (val > 255) {
            val = 255;
            input.value = 255;
        }
        binaries.push(val.toString(2).padStart(8, '0'));
    });
    ipBinaryOut.textContent = binaries.join('.');
}

if (ipOctets.length > 0) {
    ipOctets.forEach(input => {
        input.addEventListener('input', updateIpBinary);
    });
    updateIpBinary();
}



