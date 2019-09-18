// Displays the progress bar elements
const progressBarWrapper = document.querySelector("#progress-bar");
// Displays "Start" and "New Quiz" buttons
const startButtonWrapper = document.querySelector(".start-button");
// Displays all the quiz elements
const quizContainer = document.querySelector("#quiz-container");
// Displays info on how many questions user has left
const quizStatus = document.querySelector("#quiz-status");
// Displays message related to submission selection (Correct/Incorrect/None)
const choiceResult = document.querySelector("#choice-result");
// Displays result at the end of each quiz
const quizResult = document.querySelector("#quiz-result");

// Contains the full list of existing questions
let allQuestionsPool = [];
// List of radnomly selectes questions that will be used in the Quiz
let quizQuestionsPool = [];
// Contains the Index of the currently active question in the Quiz question Pool
let currentQuestionIndex = 0;
// Contains list of id's of those questions that were already presented to the user
let previousQuestions = [];

// Counter of how many questions were taken so far during the quiz
let questionsTakenCounter = 0;
// Counter of how many correct answers are submitted during the quiz
let correctAnswerCounter = 0;

// Used for stopwatch timer thas triggers every 1 second
let stopWatch;
// Quiz time spent counter (seconds)
let quizTimeSpent = 0;

// TODO: Might come from some external location later?
/* Populating All question list */
getQuizQuestionsList();

/** Invoked every time user clicks on "Start Quiz!" button */
function initQuiz() {
  /* Removing Start Quiz button after quiz starts & Setting up background color */
  startButtonWrapper.removeChild(document.querySelector("#start-quiz"));
  document.querySelector("#quiz-wrapper").style.backgroundColor = "#b5f0fd";

  /* Clear all data related to previous quiz instance */
  quizQuestionsPool = [];
  currentQuestionIndex = 0;
  questionsTakenCounter = 0;
  correctAnswerCounter = 0;
  quizTimeSpent = 0;
  quizStatus.innerHTML = "";
  quizResult.innerHTML = "";
  progressBarWrapper.style = "";

  /* Generates new list of questions each time a quiz is started */
  randomizeQuestions(allQuestionsPool, quizQuestionsPool, 5);

  /* Starting up stopwatch timer when user starts a quiz instance */
  stopWatch = setInterval(() => {
    quizTimeSpent++;
  }, 1000);

  /* Creates the first question when quiz starts */
  initQuestion();
}

/** Invoked every time user clicks on "Next Question" buttons */
function initQuestion() {
  /* Clears all data related to the previous Quiz question */
  quizContainer.innerHTML = "";
  choiceResult.innerHTML = "";
  progressBarWrapper.innerHTML = "";

  /* Implementation of Bootstrap progress bar element */
  let calc = ((questionsTakenCounter + 1) / quizQuestionsPool.length) * 100;
  progressBarWrapper.setAttribute("class", "progress mb-4");
  let progressBar = document.createElement("DIV");
  progressBar.setAttribute("class", "progress-bar");
  progressBar.setAttribute("role", "progressbar");
  progressBar.setAttribute("style", "width: " + calc + "%");
  progressBar.setAttribute("aria-valuenow", calc);
  progressBar.setAttribute("aria-valuemin", "0");
  progressBar.setAttribute("aria-valuemax", "100");
  progressBarWrapper.appendChild(progressBar);

  /* Indicator for user to see how many questions are answered so far */
  quizStatus.innerHTML =
    "Question " +
    (questionsTakenCounter + 1) +
    " of " +
    quizQuestionsPool.length;

  /* Creation of a P element which will contain the Question text */
  const currentQuestionText = document.createElement("P");
  currentQuestionText.innerHTML =
    quizQuestionsPool[currentQuestionIndex].question;
  quizContainer.appendChild(currentQuestionText);
  currentQuestionText.setAttribute("class", "h4 mb-3");

  /* Creating a DIV CONNTAINER ELEMENT for the Answer items list*/
  const answerItemsList = document.createElement("DIV");
  answerItemsList.setAttribute("class", "answer-list mb-3");

  /* Creating of list of Answers for the active Question item */
  let currentQuestionAnswers = quizQuestionsPool[currentQuestionIndex].answers;
  for (let x in currentQuestionAnswers) {
    /* Creating a DIV CONNTAINER ELEMENT for the Answer item */
    const answerWrapper = document.createElement("DIV");
    answerWrapper.setAttribute("class", "answer-wrapper");
    /* Creating a DIV CONNTAINER ELEMENT for the Answer item elements (Radio+Label) */
    const answerElements = document.createElement("DIV");
    answerElements.setAttribute("class", "answer-elements");
    answerElements.id = "answer" + x;
    /* Creating a RADIO BUTTON ELEMENT for the Answer item */
    const answerItemRadio = document.createElement("INPUT");
    answerItemRadio.type = "radio";
    answerItemRadio.setAttribute("class", "answer-radio");
    answerItemRadio.name = "answer";
    answerItemRadio.id = "a" + x;
    answerItemRadio.value = x;
    answerItemRadio.setAttribute("onchange", "focusSubmitBtn()");
    /* Creating a LABEL ELEMENT (Answer text) for the Answer item */
    const answerItemLabel = document.createElement("LABEL");
    answerItemLabel.setAttribute("for", answerItemRadio.id);
    answerItemLabel.setAttribute("class", "answer-label");
    answerItemLabel.innerText = currentQuestionAnswers[x];

    /* Adding pre-created Answer item elements into Answer item List */
    answerElements.appendChild(answerItemRadio);
    answerElements.appendChild(answerItemLabel);
    answerWrapper.appendChild(answerElements);
    answerItemsList.appendChild(answerWrapper);
  }

  /* Creation of a "Submit question" button */
  const submitQuestionButton = document.createElement("BUTTON");
  submitQuestionButton.setAttribute("class", "btn btn-info btn-lg mr-3");
  submitQuestionButton.type = "button";
  submitQuestionButton.id = "submit-button";
  submitQuestionButton.setAttribute("onclick", "submitAnswer()");
  submitQuestionButton.innerHTML = "Submit Answer";

  /* Adding pre-created AnswerList and SubmitButton elements into Quiz container */
  quizContainer.appendChild(answerItemsList);
  quizContainer.appendChild(submitQuestionButton);
}

/** Invoked when change is detected on Answer radio buttons.
 * If one of them is checked Submit button will be focused */
function focusSubmitBtn() {
  document.querySelector("#submit-button").focus();
}

/** Invoked every time user clicks on "Submit Answer" button */
function submitAnswer() {
  if (isAnythingSelected()) {
    Array.from(document.getElementsByTagName("input")).forEach(element => {
      if (element.checked) {
        /* Resets "choice-result" box (populated if user Submits without selecting an option) */
        choiceResult.innerHTML = "";

        /* Checks if submitted answer is correct for current question */
        const isAnswerCorrect =
          element.value == quizQuestionsPool[currentQuestionIndex].correct;

        /* Applying Correct or Wrong markers to submitted answer */
        const correctAnswer = document.querySelector(
          "#answer" + quizQuestionsPool[currentQuestionIndex].correct
        );
        const wrongAnswer = document.querySelector("#answer" + element.value);
        if (isAnswerCorrect) {
          correctAnswer.setAttribute("class", "answer-elements answer-correct");
        } else {
          wrongAnswer.setAttribute("class", "answer-elements answer-wrong");
          correctAnswer.setAttribute("class", "answer-elements answer-correct");
        }

        /* Creation of a P element contaning submitted answer "grade" */
        const answerStatus = document.createElement("P");
        answerStatus.innerHTML = isAnswerCorrect
          ? "<b>Correct :)</b><hr> " +
            quizQuestionsPool[currentQuestionIndex].description
          : "<b>Incorrect :(</b><hr> " +
            quizQuestionsPool[currentQuestionIndex].description;
        answerStatus.setAttribute(
          "class",
          isAnswerCorrect
            ? "h6 alert alert-success mt-2"
            : "h6 alert alert-danger mt-2"
        );
        choiceResult.append(answerStatus);

        /* Increasing the counters used for end of the quiz statistics */
        if (isAnswerCorrect) correctAnswerCounter++;
        questionsTakenCounter++;

        /* Disabling answer radio buttons and submit button when user clicks "Submit Answer" */
        disableElements(["#submit-button", "#a1", "#a2", "#a3", "#a4"]);
      }
    });

    if (currentQuestionIndex < quizQuestionsPool.length - 1) {
      /* Quiz starts with question at index 0 and continues until the last question */
      currentQuestionIndex++;

      /* Creation of the "Next Question" button after submitting a question */
      const nextQuestionButton = document.createElement("BUTTON");
      nextQuestionButton.type = "button";
      nextQuestionButton.id = "next-question-btn";
      nextQuestionButton.setAttribute("onclick", "initQuestion()");
      nextQuestionButton.setAttribute("class", "btn btn-info btn-lg");
      nextQuestionButton.innerHTML = "Next Question";
      quizContainer.appendChild(nextQuestionButton);
      nextQuestionButton.focus();
    } else {
      /* Case: User finished answering the last question from "quizQuestionsPool" array */

      /* As quiz has ended at this point, stopWatch timer is stopped */
      clearInterval(stopWatch);

      /* Creation of the "Show Quiz Results?" button after quiz completion */
      const quizResultsButton = document.createElement("BUTTON");
      quizResultsButton.type = "button";
      quizResultsButton.id = "quiz-results-btn";
      quizResultsButton.setAttribute("onclick", "showQuizResults()");
      quizResultsButton.setAttribute("class", "btn btn-info btn-lg");
      quizResultsButton.innerHTML = "Show Quiz Results?";
      quizContainer.appendChild(quizResultsButton);
      quizResultsButton.focus();
    }
  } else {
    /* Case: User doesn't select an answer and clicks on "Submit Answer" */

    /* Resetting the parent container so answerStatuses are not stacked */
    choiceResult.innerHTML = "";

    /* Creation of a P element contaning error message */
    const answerStatus = document.createElement("P");
    answerStatus.innerHTML = "Select an answer before submission!";
    answerStatus.setAttribute("class", "h4 alert alert-secondary mt-2");
    answerStatus.setAttribute("role", "alert");
    choiceResult.append(answerStatus);
  }
}

/** Invoked when user clicks on "Show Quiz Results?" button */
function showQuizResults() {
  /* When user has went through all existing question once, 
  previousQuestions Array is reset so questions can be repeated*/
  if (previousQuestions.length == allQuestionsPool.length)
    previousQuestions = [];

  /* Cleaning quiz elements at Show Results View */
  progressBarWrapper.innerHTML = "";
  progressBarWrapper.style.display = "none";
  quizContainer.innerHTML = "";
  quizStatus.innerHTML = "";
  choiceResult.innerHTML = "";

  /* Creating a title element for Quiz results screen */
  const quizStatsTitle = document.createElement("P");
  quizStatsTitle.setAttribute("class", "display-4 mb-3 text-center");
  quizStatsTitle.innerHTML = "Quiz stats:<hr>";
  quizResult.appendChild(quizStatsTitle);

  /* Displaying Quiz result statistics at the end of the quiz */
  const finalScore = (correctAnswerCounter / questionsTakenCounter) * 100;
  const quizFinalStats = document.createElement("P");
  quizFinalStats.setAttribute("class", "h5 lead mb-3 text-center");
  quizFinalStats.style.fontSize = "26px";
  quizFinalStats.innerHTML = "Total questions taken: " + questionsTakenCounter;
  quizFinalStats.innerHTML += "<br>Answered correctly: " + correctAnswerCounter;
  quizFinalStats.innerHTML += "<br>Answered correctly (%): " + finalScore + "%";
  quizFinalStats.innerHTML += "<br>Time spent: " + quizTimeSpent + " seconds";
  quizResult.appendChild(quizFinalStats);

  /* Displaying Quiz result message at the end of the quiz */
  const quizScoreMessage = document.createElement("P");
  quizScoreMessage.setAttribute("class", "display-4 my-4 text-center");
  quizScoreMessage.style.fontSize = "50px";
  quizScoreMessage.innerHTML = "<hr>";
  if (finalScore == 0) {
    quizScoreMessage.innerHTML += "Didn't school teach you anything? &#128556;";
  } else if (finalScore >= 20 && finalScore < 40) {
    quizScoreMessage.innerHTML += "At least you guessed something... &#129323;";
  } else if (finalScore >= 40 && finalScore < 60) {
    quizScoreMessage.innerHTML += "I guess it could be worse... &#129320;";
  } else if (finalScore >= 60 && finalScore < 80) {
    quizScoreMessage.innerHTML += "Mediocre. Not great, not terrible &#128528;";
  } else if (finalScore >= 80 && finalScore < 100) {
    quizScoreMessage.innerHTML += "Not bad kid! &#128516;";
  } else if (finalScore == 100) {
    quizScoreMessage.innerHTML += "You should be a teacher! &#128513;";
  }
  quizResult.appendChild(quizScoreMessage);

  /* Creation of the "Start another Quiz?" button at the end of the quiz */
  const newQuizButton = document.createElement("BUTTON");
  newQuizButton.style.fontSize = "25px";
  newQuizButton.id = "start-quiz";
  newQuizButton.type = "button";
  newQuizButton.setAttribute("onclick", "initQuiz()");
  newQuizButton.setAttribute("class", "btn btn-info btn-lg btn-block mt-3");
  newQuizButton.innerHTML = "Start another Quiz?";
  startButtonWrapper.appendChild(newQuizButton);
}

/** We pass an array of HTML element id's ("#elementId") to the function and they get disabled */
function disableElements(elementsArray) {
  for (let i = 0; i < elementsArray.length; i++) {
    document.querySelector(elementsArray[i]).setAttribute("disabled", true);
  }
}

/** Checks all Answer item Radio buttons on the page and returns true if any of them is selected */
function isAnythingSelected() {
  let isSelected = false;
  Array.from(document.getElementsByTagName("input")).forEach(element => {
    if (element && element.checked) isSelected = true;
  });
  return isSelected;
}

/**  Function randomly chooses specified number of questions (numberOfQuestions) from
 *   source pool of questions (sourcePool) and adds them to list of questions used for that
 *   quiz instance (destinationPool). */
function randomizeQuestions(sourcePool, destinationPool, numberOfQuestions) {
  /* numberOfQuestions must NOT excede the number of questions in source pool. 
     If it does, we set it to the number of questions available in the main pool */
  if (numberOfQuestions > sourcePool.length)
    numberOfQuestions = sourcePool.length;

  for (let i = 0; i < numberOfQuestions; i++) {
    /* We generate the random Array index (must be the same as the amount of Arr elements) */
    let randomIndex = generateRandomNumFromTo(0, sourcePool.length - 1);
    /* If the Random question is NOT already in the new pool */
    if (!wasQuestionShown(sourcePool[randomIndex])) {
      /* Adding the Random question to the quiz pool of questions */
      destinationPool.push(sourcePool[randomIndex]);
      /* Adding the Random question ID to list that collects previously displayed questions */
      previousQuestions.push(sourcePool[randomIndex].id);
    } else {
      /* Otherwise we take the loop one iteration backwards to have the required number of random questions */
      i--;
    }
  }
}

/** Returns a random number within provided range (min & max included) */
function generateRandomNumFromTo(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Function makes sure random questions are also unique and they don't repeat too frequently:
 * In order to have "Unique random questions througout multiple quiz instances" we will
 * take one question at a time from the main pool, make sure it wasn't previously presented by
 * saving previously appeared questions into an array (previousQuestions) and checking it each time
 * we try to use a new question. When unique questions run out (we went through the entire main pool),
 * we reset the array,  and allow those questions to appear again.
 * This way we will have as many random unique questions as the main question pool has questions.
 * */
function wasQuestionShown(potentialQuestion) {
  for (let i = 0; i < previousQuestions.length; i++) {
    if (previousQuestions.indexOf(potentialQuestion.id) != -1) return true;
  }
  return false;
}

/** Populates the full question list that will be used for the application */
function getQuizQuestionsList() {
  allQuestionsPool.push(
    {
      id: 1,
      question: "World War I began in which year?",
      answers: {
        1: "1923",
        2: "1938",
        3: "1917",
        4: "1914"
      },
      correct: 4,
      description:
        "World War I began shortly after the assassination of Arch-Duke Ferdinand of the Austro-Hungarian empire in 1914."
    },
    {
      id: 2,
      question: "John F. Kennedy was assassinated in:",
      answers: {
        1: "New York",
        2: "Austin",
        3: "Dallas",
        4: "Miami"
      },
      correct: 3,
      description:
        "On November 22, 1963, JFK was assassinated as he rode in a motorcade through Dealey Plaza in downtown Dallas."
    },
    {
      id: 3,
      question: "Adolf Hitler was born in which country?",
      answers: {
        1: "France",
        2: "Germany",
        3: "Austria",
        4: "Hungary"
      },
      correct: 3,
      description: "Hitler was born in Lintz, Austria near the German border."
    },
    {
      id: 4,
      question:
        "American involvement in the Korean War took place in which decade?",
      answers: {
        1: "1970s",
        2: "1950s",
        3: "1920s",
        4: "1960s"
      },
      correct: 2,
      description:
        "The American involvement in the Korean war lasted from 1950-1953."
    },
    {
      id: 5,
      question: "The Battle of Hastings in 1066 was fought in which country?",
      answers: {
        1: "France",
        2: "Russia",
        3: "England",
        4: "Norway"
      },
      correct: 3,
      description:
        "The Battle of Hastings was fought on 14 October 1066 between the Norman-French army of William, the Duke of Normandy, and an English army under the Anglo-Saxon King Harold Godwinson, beginning the Norman conquest of England."
    },
    {
      id: 6,
      question: "The first European printing press was created by who?",
      answers: {
        1: "Johannes Gutenburg",
        2: "Benjamin Franklin",
        3: "Sir Isaac Newton",
        4: "Martin Luther"
      },
      correct: 1,
      description:
        "Gutenberg was a German goldsmith and printer who is credited with inventing movable type printing in Europe around 1439, and mechanical printing globally."
    },
    {
      id: 7,
      question:
        "The disease that ravaged and killed a third of Europe's population in the 14th century is known as:",
      answers: {
        1: "The White Death",
        2: "The Black Plague",
        3: "Smallpox",
        4: "The Bubonic Plague"
      },
      correct: 4,
      description:
        "The Bubonic Plague was carried by fleas on rats aboard trading ships from the East and ravaged Europe for many centuries."
    },
    {
      id: 8,
      question: "The Hundred Years War was fought between what two countries?",
      answers: {
        1: "Italy and Carthage",
        2: "England and Germany",
        3: "France and England",
        4: "Spain and France"
      },
      correct: 3,
      description:
        "The conflict lasted 116 years from 1337 to 1453. The war was punctuated by several brief periods of peace, and two lengthy periods of peace, before it finally ended. Joan of Ark was a legendary figure during this conflict."
    },
    {
      id: 9,
      question:
        "The Khmer Rouge was a regime ruling this nation in the 20th century:",
      answers: {
        1: "Vietnam",
        2: "Laos",
        3: "Cambodia",
        4: "China"
      },
      correct: 3,
      description:
        "Khmer was the ruling political party of Cambodia which it renamed to 'Democratic Kampuchea' from 1975 to 1979."
    },
    {
      id: 10,
      question:
        "What famous 5th century A.D conqueror was known as 'The Scourge of God'? ",
      answers: {
        1: "Hannibal",
        2: "Julius Caesar",
        3: "William the Conqueror",
        4: "Atilla the Hun"
      },
      correct: 4,
      description:
        "The Latin statement 'Ego sum Attila flagellum Dei', which means I am Attila, the scourge of God , is said to have been first expressed in 1387, and is obviously making a reference to Attila the Hun."
    },
    {
      id: 11,
      question: "Who was the first Western explorer to reach China?",
      answers: {
        1: "Magellan",
        2: "Cook",
        3: "Marco Polo",
        4: "Sir Francis Drake"
      },
      correct: 3,
      description:
        "Marco Polo was an Venetian merchant, explorer, and writer who travelled through Asia along the Silk Road between 1271 and 1295."
    },
    {
      id: 12,
      question: "Who re-discovered America first?",
      answers: {
        1: "Christopher Columbus",
        2: "Leif Erikson",
        3: "Francis Drake",
        4: "Hernan Cortes"
      },
      correct: 2,
      description:
        "Leif Erikson ( c. 970 – c. 1020) was a Norse explorer from Iceland. He was the first known European to have set foot on continental North America (excluding Greenland), before Christopher Columbus."
    },
    {
      id: 13,
      question: "What was Alexander the Great's horse's name?",
      answers: {
        1: "Khartoum",
        2: "Pegasus",
        3: "Arion",
        4: "Bucephalus"
      },
      correct: 4,
      description:
        "Bucephalus (355 BC – 326 BC) was the horse of Alexander the Great, and one of the most famous horses of antiquity. Bucephalus (meaning 'ox-head') was named after a branding mark depicting an ox's head on his haunch."
    },
    {
      id: 14,
      question: "In which year did the demolition of the Berlin Wall begin?",
      answers: {
        1: "1959",
        2: "1989",
        3: "1969",
        4: "1979"
      },
      correct: 2,
      description:
        "The evening of 9 November 1989 is known as the night the Wall came down. The 'fall of the Berlin Wall' paved the way for German reunification, which formally took place on 3 October 1990."
    },
    {
      id: 15,
      question:
        "In 1297, at which battle did William Wallace defeat the English?",
      answers: {
        1: "Battle of Stirling Bridge",
        2: "Battle of Hastings",
        3: "Battle of Agincourt",
        4: "Battle of Falkirk"
      },
      correct: 1,
      description:
        "The first major defeat of the English in the Wars of Scottish Independence, the Battle of Stirling Bridge afforded Sir William Wallace the opportunity to prove his military credentials and obtain significant political power."
    },
    {
      id: 16,
      question: "In which war was The Battle of Agincourt?",
      answers: {
        1: "First Crusade",
        2: "Armagnac–Burgundian Civil War",
        3: "Hundred Years War",
        4: "Fourth Crusade"
      },
      correct: 3,
      description:
        "The Battle of Agincourt was one of the greatest English victories in the Hundred Years' War. It took place on 25 October 1415 near Azincourt in northern France."
    },
    {
      id: 17,
      question: "In which year did the Titanic sink?",
      answers: {
        1: "1894",
        2: "1905",
        3: "1912",
        4: "1917"
      },
      correct: 2,
      description:
        "The RMS Titanic sank in the early morning of 15 April 1912 in the North Atlantic Ocean, four days into the ship's maiden voyage from Southampton to New York City."
    },
    {
      id: 18,
      question: "Who was the ruler of the Russia from 1917-24?",
      answers: {
        1: "Nikolai Romanov",
        2: "Joseph Stalin",
        3: "Leon Trotsky",
        4: "Vladimir Lenin"
      },
      correct: 4,
      description:
        "Vladimir Ilyich Ulyanov, better known by his alias Lenin, was a Russian revolutionary, politician, and political theorist. He served as head of government of Soviet Russia from 1917 to 1922 and of the Soviet Union from 1922 to 1924."
    },
    {
      id: 19,
      question:
        "In which year did the UK hand over Hong Kong sovereignty to China?",
      answers: {
        1: "1977",
        2: "1987",
        3: "1997",
        4: "2007"
      },
      correct: 3,
      description:
        "The transfer of sovereignty over Hong Kong occurred at midnight on 1 July 1997, when the United Kingdom ended administration for the colony of Hong Kong and returned control of the territory to China"
    },
    {
      id: 20,
      question:
        "What Russian cleric was poisoned, shot and finally drowned on December 30, 1916?",
      answers: {
        1: "Nikolai Romanov",
        2: "Grigori Rasputin",
        3: "Leon Trotsky",
        4: "Felix Yusupov"
      },
      correct: 2,
      description:
        "Prince Yussupov, the nephew of the Tsar, hatched a plot to poison Rasputin with cakes and wine 'laced with enough cyanide to kill several men instantly'. Rasputin ate the poison, but the cyanide had no apparent effect and the monk died only after being shot and beaten and then drowned in a frozen river."
    },
    {
      id: 21,
      question:
        "Which country did Germany invade on the 1st of September 1939?",
      answers: {
        1: "France",
        2: "Czechoslovakia",
        3: "Poland",
        4: "Finland"
      },
      correct: 3,
      description:
        "Germany invaded Poland on the 1st of September 1939, marking the beginning of World War Two. Two days later France and England declared war on Germany. Two weeks later the Soviet Union also invaded Poland."
    },
    {
      id: 22,
      question: "What is the oldest known story in the world?",
      answers: {
        1: "The Bible",
        2: "The Histories",
        3: "The Odyssey",
        4: "The Epic of Gilgamesh"
      },
      correct: 4,
      description:
        "The oldest parts of the Epic of Gilgamesh are close to four thousand years old."
    },
    {
      id: 23,
      question:
        "Which of these was one of the seven ancient wonders of the world?",
      answers: {
        1: "Great Wall of China",
        2: "Macchu Picchu",
        3: "Lighthouse of Alexandria",
        4: "Taj Mahal"
      },
      correct: 3,
      description:
        "Lighthouse of Alexandria, built around 280BC, was the tallest building in the world for many centuries."
    },
    {
      id: 24,
      question: "Where was Napoleon exiled after the Battle of Waterloo?",
      answers: {
        1: "Saint Helena",
        2: "Malta",
        3: "Elba",
        4: "Corsica"
      },
      correct: 1,
      description:
        "After defeat at the Battle of Waterloo in June, the British exiled him to the remote island of Saint Helena in the South Atlantic, where he died six years later at the age of 51."
    },
    {
      id: 25,
      question: "Which Greek historian is known as the 'Father of History'?",
      answers: {
        1: "Herodotus",
        2: "Aristotle",
        3: "Plato",
        4: "Socrates"
      },
      correct: 1,
      description:
        "Herodotus was an ancient Greek historian who was born in Halicarnassus in the Persian Empire. He is known for having written the book The Histories, a detailed record of his 'inquiry' on the origins of the Greco-Persian Wars."
    },
    {
      id: 26,
      question:
        "The Peloponnesian War was fought between Athens and which other ancient Greek state?",
      answers: {
        1: "Thebes",
        2: "Corinth",
        3: "Sparta",
        4: "Rhodes"
      },
      correct: 3,
      description:
        "The Peloponnesian War was an ancient Greek war fought by the Delian League led by Athens against the Peloponnesian League led by Sparta."
    },
    {
      id: 27,
      question:
        "During the 'Golden Age of Piracy' just two women were ever convicted of piracy. One was Anne Bonney, but who was the other?",
      answers: {
        1: "Ching Shih",
        2: "Mary Read",
        3: "Anne Dieu-le-Veut",
        4: "Rachel Wall"
      },
      correct: 2,
      description:
        "Mary Read, also known as Mark Read, was an English pirate. She and Anne Bonny are two of the most famed female pirates of all time, and among the few women known to have been convicted of piracy during the early 18th century, at the height of the 'Golden Age of Piracy'."
    },
    {
      id: 28,
      question: "What was Blackbeard's real name?",
      answers: {
        1: "Francis Drake",
        2: "Edward Low",
        3: "Henry Morgan",
        4: "Edward Teach"
      },
      correct: 4,
      description:
        "Edward Teach or Edward Thatch, better known as Blackbeard, was an English pirate who operated around the West Indies and the eastern coast of Britain's North American colonies."
    },
    {
      id: 29,
      question:
        "Which Welshman became notorious as a pirate leader after conquering and looting the Spanish Panamanian strongholds of Portobello and Santiago Castle?",
      answers: {
        1: "Henry Morgan",
        2: "Calico Jack Rackam",
        3: "Blackbeard",
        4: "Francis Drake"
      },
      correct: 1,
      description:
        "Sir Henry Morgan was a Welsh privateer, plantation owner, and, later, Lieutenant Governor of Jamaica. From his base in Port Royal, Jamaica, he raided settlements and shipping on the Spanish Main, becoming wealthy as he did so."
    },
    {
      id: 30,
      question: "Where was the capital of Inca civilization, Cuzco, located?",
      answers: {
        1: "Peru",
        2: "Yuacatan",
        3: "Mexico",
        4: "Caribbean"
      },
      correct: 1,
      description:
        "The administrative, political and military center of the empire was located in the city of Cusco (Modern day Peru). The Inca civilization arose from the Peruvian highlands sometime in the early 13th century"
    }
  );
}
