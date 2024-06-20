const socket = io();

const tickActual = document.getElementById('ticketTitle');
const tickActualPuesto = document.getElementById('ticketPuesto');
const ticketsToday = document.getElementById('ticketsAtndHoy');

const tickListName1 = document.getElementById('ticketName1');
const tickListName2 = document.getElementById('ticketName2');
const tickListName3 = document.getElementById('ticketName3');
const tickListCallMins1 = document.getElementById('ticketCall1');
const tickListCallMins2 = document.getElementById('ticketCall2');
const tickListCallMins3 = document.getElementById('ticketCall3');

const btnPassTicket = document.getElementById('callTicket');
const btnNewTicket = document.getElementById('newTicket');


const fetchDataGraphQL = async (query = {}) => {
    const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });
    const { data } = await response.json();
    return data;
};

const getData = async () => {
    const randmMins = Math.floor(Math.random() * 21); // mins entre 0 y 20
    const randmMins2 = Math.floor(Math.random() * (41 - 20)) + 20; // mins entre 20 y 40
    const randmMins3 = Math.floor(Math.random() * (61 - 40)) + 40; // mins entre 40 y 60

    const query = `
        {
            ultimoTicket {
                turno
                puesto
            }
            lastThree {
                turno
                puesto
            }
            ticketsAtendidos
        }
    `;

    const data = await fetchDataGraphQL(query);

    tickActual.textContent = data.ultimoTicket ? data.ultimoTicket.turno : '-';
    tickActualPuesto.textContent = data.ultimoTicket ? data.ultimoTicket.puesto : '-';
    ticketsToday.textContent = data.ticketsAtendidos ? data.ticketsAtendidos : '-';

    const listTcks = data.lastThree.slice(-3);
    listTcks.reverse();

    tickListName1.textContent = listTcks[0] ? listTcks[0].turno : '-';
    tickListName2.textContent = listTcks[1] ? listTcks[1].turno : '-';
    tickListName3.textContent = listTcks[2] ? listTcks[2].turno : '-';

    tickListCallMins1.textContent = listTcks[0] ? `Llamado hace ${randmMins} mins` : '-'
    tickListCallMins2.textContent = listTcks[1] ? `Llamado hace ${randmMins2} mins` : '-'
    tickListCallMins3.textContent = listTcks[2] ? `Llamado hace ${randmMins3} mins` : '-'

}

// callTicket1
btnPassTicket.addEventListener('click', async () => {
    const mutation = `
        mutation {
            callTicket {
                turno
                puesto
            }
        }
    `;

    await fetchDataGraphQL(mutation);
});

// addTicket
btnNewTicket.addEventListener('click', async () => {
    const letras = ['A', 'B', 'C', 'D'];
    const ltrAleatoria = letras[Math.floor(Math.random() * letras.length)];
    const numAleatorio = Math.floor(Math.random() * 10) + 1;
    const pstoAleatorio = Math.floor(Math.random() * 15) + 1;

    const turno = ltrAleatoria + numAleatorio;

    const mutation = `
        mutation {
            addTicket(turno: "${turno}", puesto: ${pstoAleatorio}) {
                turno
                puesto
            }
        }
    `;

    await fetchDataGraphQL(mutation).then(() => {
        return alert(`Turno creado. En unos minutos sera atendido. Turno: ${turno}`);
    });
});

socket.on('ticketCalled', () => {
    // Reproducir sonido
    const audio = new Audio('./assets/ticket-sound.mp3');
    audio.play();
    getData();
});

getData();
