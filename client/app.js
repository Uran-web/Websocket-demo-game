"use strict";
import Store from './store'

const logElement = document.getElementById('log');
const passwordInput = document.getElementById('password');
const nickNameInput = document.getElementById('nickName');
const wordInputAnswer = document.getElementById('wordInputAnswer');
const wordInputGuess = document.getElementById('wordInputGuess');
const authenticationForm = document.getElementById('authFrom');
const competitorsSection = document.getElementById('competitors');
const competitorsTableBody = document.getElementById('competitorsTableBody');
const competitorsTable = document.getElementById('competitorsTable');

function log(message) {
    if (logElement) {
        logElement.textContent += message + '\n';
    }
}
const ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => {
    log('Connected to server');
};
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // TODO: remove this console
    console.log('JSON front data ==>', event.data)

    if (data.type === 'authenticated') {
         // authenticationForm.style.display = 'none'
         competitorsSection.style.display = 'block'
         store.setState({authenticated: true, clientId: data.clientId})
         log(`Authenticated, received client ID: ${data.clientId}`)
    }
    else if (data.type === 'error') {
        log(`Error: ${data.message}`);
    } else if (data.type === 'competitors') {
        populateCompetitors(data.competitors)
    }
};
ws.onclose = () => {
    log('Connection closed');
};
document.getElementById('connectButton')?.addEventListener('click', () => {
    if (ws.readyState === WebSocket.OPEN) {
        log('Already connected');
    }
    else {
        log('Connecting...');
    }
});
document.getElementById('sendPasswordButton')?.addEventListener('click', (event) => {
    event.preventDefault();
    if (ws.readyState === WebSocket.OPEN) {
        const password = passwordInput.value
        const nickName = nickNameInput.value

        ws.send(JSON.stringify({type: 'auth', password, nick_name: nickName}))
        authenticationForm.reset()
        log('Password and nick name send.')
    }
    else {
        log('Not connected');
    }
});

document.getElementById('answerButton')?.addEventListener('click', () => {
    console.log(wordInputAnswer.value)
    if(ws.readyState === WebSocket.OPEN) {
        ws.send(wordInputAnswer.value)
        log('Answer send')
    } else {
        log('Not connected')
    }
})

document.getElementById('secreteWordButton')?.addEventListener('click', () => {
    console.log(wordInputGuess?.value)
    if(ws.readyState === WebSocket.OPEN) {
        ws.send(wordInputGuess?.value)
        log('Secrete word send')
    } else {
        log('Not connected')
    }
})

// NOTE: get potential competitors
document.getElementById('showCompetitors')?.addEventListener('click', (event) => {
    event.preventDefault();
    if(ws.readyState === WebSocket.OPEN) {

        ws.send(JSON.stringify({type: 'showCompetitors'}))
        log('Show competitors request send.')
    } else {
        log('Not connected')
    }
})

function populateCompetitors(competitors) {
    competitorsTable.style.display = 'block';
    competitorsTableBody.innerHTML = '';
    console.log('competitors in front end', competitors)


    // Populate new rows
    competitors.forEach(competitor => {
        const row = document.createElement('tr');
        row.id = competitor.nick_name
        const idCell = document.createElement('td');
        const nickNameCell = document.createElement('td');
        const statusCell = document.createElement('td');

        idCell.textContent = competitor.id.toString();
        nickNameCell.textContent = competitor.nick_name;
        statusCell.textContent = competitor.status;

        row.appendChild(idCell);
        row.appendChild(nickNameCell);
        row.appendChild(statusCell);

        row.addEventListener('click', () => {
            console.log('ROW: ', competitor.id, competitor.nick_name, competitor.status)
            console.log('store ===>', store.getState())
            // if(ws.readyState === WebSocket.OPEN) {

    // word: string,
    // initiator: string,
    // opponent: string,
    // opponent_nick_name: string,
    // match_status: 'pending' | 'progress' | 'finished'

            //     ws.send(JSON.stringify({type: 'addNewMatch', }))
            //     log('Request to competition send.')
            // } else {
            //     log('Not connected')
            // }
        })

        competitorsTableBody.appendChild(row);
    })

}

const initialState = {
    authenticated: false,
    clientId: '',
    competitors: []
}

const store = new Store(initialState);

store.subscribe(state => {
    if (state.authenticated) {
        authenticationForm.style.display = 'none';
    }

    if (state?.competitors.length > 0) {
        populateCompetitors(state.competitors);
    }
})
