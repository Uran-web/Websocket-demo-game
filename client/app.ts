import Store from "./store.js";
import {
  validateAnswerAndWordInput,
  validateHintInput,
  validateNameInput,
  validatePasswordInput,
} from "./utils/validation.js";
import { showElement } from "./utils/showElement.js";

// const body = document.getElementsByTagName('body') as HTMLCollectionOf<HTMLBodyElement>;

const logElement = document.getElementById("log") as HTMLPreElement;

// form elements
const passwordInput = document.getElementById("password") as HTMLInputElement;
const nickNameInput = document.getElementById("nickName") as HTMLInputElement;
const authenticationForm = document.getElementById(
  "authFrom"
) as HTMLFormElement;

// initiator elements
const competitorsSection = document.getElementById(
  "competitors"
) as HTMLElement;
const competitorsTableBody = document.getElementById(
  "competitorsTableBody"
) as HTMLElement;
const competitorsTable = document.getElementById(
  "competitorsTable"
) as HTMLElement;
const guessWordInput = document.getElementById(
  "guessWordInput"
) as HTMLInputElement;
const secreteWordButton = document.getElementById(
  "secreteWordButton"
) as HTMLElement;

// modal elements
const modal = document.getElementById("modalWindow") as HTMLElement;
const modalCross = document.getElementsByClassName("close")[0] as HTMLElement;
const modalDescription = document.getElementById(
  "modalDescription"
) as HTMLElement;
const modalCancelButton = document.getElementById(
  "modalCancelButton"
) as HTMLElement;
const modalAcceptButton = document.getElementById(
  "modalAcceptButton"
) as HTMLElement;

// game progress UI
const matchFieldBlock = document.getElementById("matchField") as HTMLElement;

const opponentId = document.getElementById("opponentId") as HTMLElement;
const attemptsTableBody = document.getElementById(
  "attemptsTableBody"
) as HTMLElement;

const answerBlock = document.getElementById("answerContainer") as HTMLElement;
const wordInputAnswer = document.getElementById(
  "answerInput"
) as HTMLInputElement;
const competitorGiveUpBlock = document.getElementById(
  "competitorGiveUp"
) as HTMLElement;
const giveUpButton = document.getElementById(
  "giveUpButton"
) as HTMLButtonElement;

const hintBlock = document.getElementById("hintContainer") as HTMLElement;
const hintInput = document.getElementById("hintInput") as HTMLInputElement;

const hintBlockContent = document.getElementById("hintBlock") as HTMLElement;
const hintBlockText = document.getElementById("hintText") as HTMLElement;

const nickNameError = document.getElementById("nickNameError") as HTMLElement;
const passwordError = document.getElementById("passwordError") as HTMLElement;
const guessWordError = document.getElementById("guessWordError") as HTMLElement;
const answerError = document.getElementById("answerError") as HTMLElement;
const hintError = document.getElementById("hintError") as HTMLElement;

export type IMatchStatusReason = "guessed" | "giveUp";

export interface IMatchInfo {
  id?: number;
  word?: string;
  initiator: string;
  initiator_nick_name: string;
  opponent: string;
  opponent_nick_name: string;
  match_status: "pending" | "progress" | "finished";
  reason?: IMatchStatusReason;
}

export type TMatch = {
  id?: number;
  word?: string;
  initiator_player_id: number;
  initiator_nick_name: string;
  acceptor_player_id: number;
  opponent_nick_name: string;
  match_status: "pending" | "progress" | "finished";
  reason?: IMatchStatusReason;
};

export interface IInitialState {
  authenticated: boolean;
  clientId: string;
  competitors: [];
  word: string;
  matchInfo: IMatchInfo;
  nickName: string;
  attempts: IAttempts[];
  hint: IHint;
}

export interface IAnswer {
  possibleWord: string;
  matchId: string;
  opponent: string;
}

export interface IAttempts {
  acceptor_player_id: string;
  match_id: string;
  possible_word: string;
}

export interface IHint {
  description: string;
  match_id: string;
  initiator_player_id: string;
}

function log(message: string) {
  if (logElement) {
    logElement.textContent += message + "\n";
  }
}

// NOTE: should add valid PORT to .env
const ws = new WebSocket(`ws://localhost:3000`);

ws.onopen = () => {
  log("Connected to server");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case "authenticated":
      competitorsSection.style.display = "block";
      store.setState({ authenticated: true, clientId: data.clientId });
      log(`Authenticated, received client ID: ${data.clientId}`);
      break;
    case "error":
      log(`Error ${data.message}`);
      break;
    case "competitors":
      store.setState({ competitors: data.competitors });
      break;
    case "initiate match error":
      console.log("initiate match error");
      break;
    case "newMatch":
      store.setState({ matchInfo: data.matchInfo });
      showModal(data.match);
      break;
    case "declineMatch":
      store.setState({
        matchInfo: { ...store.getState().matchInfo, opponent: "" },
      });
      break;
    case "confirmMatch":
      store.setState({
        matchInfo: {
          ...data.match,
          initiator: data.match.initiator_player_id,
          opponent: data.match.acceptor_player_id,
        },
      });
      hideCompetitorsBlock();
      showMatchField();
      showAcceptorAttributes();
      showHintBlock();
      opponentId.textContent =
        store.getState().clientId === store.getState().matchInfo.opponent
          ? store.getState().matchInfo.initiator
          : store.getState().matchInfo.opponent;
      break;
    case "hint":
      store.setState({ hint: data.hint });
      showHintItself();
      break;
    case "answer":
      populateAttempts(data.answer);
      store.setState({ attempts: data.answer });

      const word = store.getState().matchInfo.word;
      const possibleWord = data.answer[data.answer.length - 1];
      if (word === possibleWord.possible_word) {
        correctAnswerSend("guessed");
      }
      break;
    case "finishMatch":
      store.setState({
        matchInfo: {
          ...data.match,
          initiator: data.match.initiator_player_id,
          opponent: data.match.acceptor_player_id,
        },
      });
      showFinishModal();
      break;
  }
};

ws.onclose = () => {
  log("Connection closed");
};

document.getElementById("connectButton")?.addEventListener("click", () => {
  if (ws.readyState === WebSocket.OPEN) {
    log("Already connected");
  } else {
    log("Connecting");
  }
});

document
  .getElementById("sendPasswordButton")
  ?.addEventListener("click", (event) => {
    event.preventDefault();
    validateNameInput(nickNameInput, nickNameError);

    const isValid = validatePasswordInput(passwordInput, passwordError);

    if (ws.readyState === WebSocket.OPEN && isValid) {
      const password = passwordInput.value;
      const nickName = nickNameInput.value;

      store.setState({ nickName });
      ws.send(JSON.stringify({ type: "auth", password, nick_name: nickName }));
      authenticationForm.reset();
      log("Password and nick name send.");
    } else {
      log("Not connected");
    }
  });

document.getElementById("answerButton")?.addEventListener("click", () => {
  const { matchInfo } = store.getState();
  const { id, initiator } = matchInfo;

  const answer: IAnswer = {
    possibleWord: wordInputAnswer?.value,
    matchId: id?.toString() as string,
    opponent: initiator.toString(),
  };

  const isValidAnswer = validateAnswerAndWordInput(
    wordInputAnswer,
    answerError
  );

  if (ws.readyState === WebSocket.OPEN && isValidAnswer) {
    ws.send(JSON.stringify({ type: "answer", ...answer }));
    log("Answer send");
  } else {
    log("Not connected");
  }
});

function showFinishModal() {
  modalDescription.innerHTML = "";

  const { clientId, matchInfo } = store.getState();
  const { initiator, match_status, reason } = matchInfo;

  // UI part
  const pModal = document.createElement("p");
  const spanModal = document.createElement("span");

  if (match_status === "finished" && reason === "giveUp") {
    if (initiator === clientId) {
      pModal.textContent = `Your opponent gave up:`;
      spanModal.textContent = `${matchInfo.word}`;
    } else {
      pModal.textContent = `The correct word was:`;
      spanModal.textContent = `${matchInfo.word}`;
    }
  } else if (match_status === "finished" && reason === "guessed") {
    if (initiator === clientId) {
      pModal.textContent = `Your opponent guessed the word`;
      spanModal.textContent = `${matchInfo.word}`;
    } else {
      pModal.textContent = `Congratulations! You guess whe word!`;
      spanModal.textContent = `${matchInfo.word}`;
    }
  }

  modalCross.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  modalDescription.appendChild(pModal);
  modalDescription.appendChild(spanModal);
  // End UI

  modal.style.display = "block";
  modalCancelButton.style.display = "none";
  modalAcceptButton.style.display = "none";
}

giveUpButton.addEventListener("click", () => {
  const { matchInfo } = store.getState();
  const { initiator, initiator_nick_name, opponent, id } = matchInfo;

  const preparedMatchInfo = {
    word: matchInfo.word,
    initiator: initiator.toString(),
    initiator_nick_name: initiator_nick_name,
    opponent: opponent.toString(),
    match_status: "finished",
    id: id,
    reason: "giveUp",
  };

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "finishMatch", ...preparedMatchInfo }));
    log("Finish match request send.");
  } else {
    log("Not connected");
  }
});

function correctAnswerSend(reason: IMatchStatusReason) {
  const { matchInfo } = store.getState();
  const { initiator, initiator_nick_name, opponent, id } = matchInfo;

  const preparedMatchInfo = {
    word: matchInfo.word,
    initiator: initiator.toString(),
    initiator_nick_name: initiator_nick_name,
    opponent: opponent.toString(),
    match_status: "finished",
    id: id,
    reason: reason,
  };

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "finishMatch", ...preparedMatchInfo }));
    log("Finish match request send.");
  } else {
    log("Not connected");
  }
}

function populateAttempts(attempts: IAttempts[]) {
  attemptsTableBody.innerHTML = "";

  const { matchInfo } = store.getState();
  const { word } = matchInfo;

  attempts.forEach((attempt) => {
    const row = document.createElement("tr");
    row.id = !!attempts.length ? attempts.length.toString() : "";
    const attemptCell = document.createElement("td");
    attemptCell.className = "attemptCell";
    const statusCell = document.createElement("td");
    statusCell.className = "statusCell";

    attemptCell.textContent = attempt.possible_word;
    statusCell.textContent =
      attempt.possible_word === word ? "Correct!" : "Miss";

    row.appendChild(attemptCell);
    row.appendChild(statusCell);

    attemptsTableBody.appendChild(row);
  });
}

document.getElementById("hintButton")?.addEventListener("click", () => {
  const { matchInfo } = store.getState();
  const { id, opponent } = matchInfo;

  const hint: IHint = {
    description: hintInput.value,
    match_id: id?.toString() as string,
    initiator_player_id: opponent.toString(),
  };

  const isValidHint = validateHintInput(hintInput, hintError);

  if (ws.readyState === WebSocket.OPEN && isValidHint) {
    ws.send(JSON.stringify({ type: "hint", ...hint }));
    log("Hint send");
  } else {
    log("Not connected");
  }
});

// NOTE: get potential competitors
document
  .getElementById("showCompetitors")
  ?.addEventListener("click", (event) => {
    event.preventDefault();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "showCompetitors" }));
      log("Show competitors request send.");
    } else {
      log("Not connected");
    }
  });

function populateCompetitors(
  competitors: { id: number | string; nick_name: string; status: string }[]
) {
  competitorsTable.style.display = "block";
  competitorsTableBody.innerHTML = "";

  // Populate new rows
  competitors.forEach((competitor, ind) => {
    const row = document.createElement("tr");
    row.id = competitor.nick_name;
    const idCell = document.createElement("td");
    idCell.className = "idCell";
    const nickNameCell = document.createElement("td");
    nickNameCell.className = "nickNameCell";
    const statusCell = document.createElement("td");
    statusCell.className = "statusCell";
    const actionsCell = document.createElement("td");
    actionsCell.className = "actionsCell";

    // NOTE: table button section
    const tableActionButton = document.createElement("button");
    tableActionButton.textContent = "Challenge";
    tableActionButton.id = `challengeButton-${ind}`;
    tableActionButton.className = `button`;
    tableActionButton.disabled =
      !store.getState().word ||
      (!!store.getState().matchInfo.opponent &&
        +store.getState().matchInfo.opponent !== competitor.id);

    // End table button section

    idCell.textContent = competitor.id.toString();
    nickNameCell.textContent = competitor.nick_name;
    statusCell.textContent = competitor.status;
    actionsCell.appendChild(tableActionButton);

    row.appendChild(idCell);
    row.appendChild(nickNameCell);
    row.appendChild(statusCell);
    row.appendChild(actionsCell);

    tableActionButton.addEventListener("click", () => {
      const matchInfo = {
        word: store.getState().word,
        initiator: store.getState().clientId,
        initiator_nick_name: store.getState().nickName,
        opponent: competitor.id.toString(),
        opponent_nick_name: competitor.nick_name,
        match_status: "pending" as "pending",
      };
      store.setState({ matchInfo });
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "addNewMatch", ...matchInfo }));
        log("Request to competition send.");
      } else {
        log("Not connected");
      }
    });

    competitorsTableBody.appendChild(row);
  });
}

secreteWordButton.addEventListener("click", () => {
  const secreteWord = guessWordInput.value.toLowerCase();

  const isValidSecretWord = validateAnswerAndWordInput(
    guessWordInput,
    guessWordError
  );

  if (isValidSecretWord) {
    store.setState({ word: secreteWord });
  }
});

function showModal(match: TMatch) {
  const pModal = document.createElement("p");
  pModal.className = "confirmation";
  const spanModal = document.createElement("span");
  spanModal.className = "shortDescription";

  pModal.textContent = `Player ${match.initiator_nick_name} want\'s to challenge you!`;
  spanModal.textContent = "Are you want to accept challenge?";

  modalDescription.appendChild(pModal);
  modalDescription.appendChild(spanModal);

  modal.style.display = "block";

  modalCross.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  const matchInfo = {
    word: match.word,
    initiator: match.initiator_player_id.toString(),
    initiator_nick_name: match.initiator_nick_name,
    opponent: match.acceptor_player_id.toString(),
    match_status: "pending",
    id: match.id,
  };

  // Match confirmation
  modalCancelButton.addEventListener("click", () => {
    const updatedMatchInfo = {
      ...matchInfo,
      match_status: "finished",
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "declineMatch", ...updatedMatchInfo }));
      log("Request to cancel send.");
      modal.style.display = "none";
    } else {
      log("Not connected");
    }
  });

  modalAcceptButton.addEventListener("click", () => {
    const updatedMatchInfo = {
      ...matchInfo,
      match_status: "progress",
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "confirmMatch", ...updatedMatchInfo }));
      log("Confirm match request send.");
      modal.style.display = "none";
    } else {
      log("Not connected");
    }
  });
}

function showMatchField() {
  const { match_status } = store.getState().matchInfo;
  if (match_status === "progress") {
    matchFieldBlock.style.display = "block";
  }
}

function showAcceptorAttributes() {
  const { clientId, matchInfo } = store.getState();
  const { match_status, opponent } = matchInfo;

  const acceptorAttributes = [answerBlock, competitorGiveUpBlock];

  if (match_status === "progress" && clientId === opponent) {
    acceptorAttributes.forEach((attribute) => showElement(attribute));
  }
}

function showHintBlock() {
  const { clientId, matchInfo } = store.getState();
  const { match_status, opponent } = matchInfo;

  const hintBlockAttribute = [hintBlock];

  if (match_status === "progress" && clientId !== opponent) {
    hintBlockAttribute.forEach((attribute) => showElement(attribute));
  }
}

function showHintItself() {
  const { clientId, matchInfo, hint } = store.getState();
  const { match_status, opponent } = matchInfo;

  if (
    match_status === "progress" &&
    clientId === opponent &&
    hint.description
  ) {
    hintBlockText.textContent = hint.description;
    hintBlockContent.style.display = "block";
  }
}

function hideCompetitorsBlock() {
  const { matchInfo } = store.getState();
  const { match_status } = matchInfo;

  if (match_status === "progress") {
    competitorsSection.style.display = "none";
  }
}

const initialState: IInitialState = {
  authenticated: false,
  clientId: "",
  competitors: [],
  word: "",
  matchInfo: {
    initiator: "",
    initiator_nick_name: "",
    opponent: "",
    opponent_nick_name: "",
    match_status: "pending",
  },
  nickName: "",
  attempts: [],
  hint: {
    description: "",
    match_id: "",
    initiator_player_id: "",
  },
};

const store = new Store(initialState);

store.subscribe((state) => {
  if (state.authenticated) {
    authenticationForm.style.display = "none";
  }

  if (state?.competitors.length > 0) {
    populateCompetitors(state.competitors);
  }

  if (state.word) {
    console.log("word updated");
  }
  if (state.matchInfo) {
    // TODO: remove this console
    console.log("math info updated");
  }

  if (state.attempts) {
    console.log("attempts added");
  }

  if (state.hint) {
    console.log("hint added");
  }
});
