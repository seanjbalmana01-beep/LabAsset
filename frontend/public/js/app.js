let requests = [
    { id: 1, professor: 'Dr. Alcantara', equipment: 'Oscilloscope Rigol DS1054Z', room: 'Hardware Lab', date: '2026-10-12 10:00', status: 'Pending' }
];

function switchView(viewName) {
    const profView = document.getElementById('view-professor');
    const custView = document.getElementById('view-custodian');
    const btnProf = document.getElementById('btn-prof');
    const btnCust = document.getElementById('btn-cust');

    if (viewName === 'professor') {
        profView.classList.remove('hidden');
        custView.classList.add('hidden');
        btnProf.className = 'px-4 py-1.5 rounded-lg text-sm font-medium bg-indigo-700 shadow-inner transition';
        btnCust.className = 'px-4 py-1.5 rounded-lg text-sm font-medium bg-indigo-950 text-indigo-200 hover:bg-indigo-800 transition';
    } else {
        profView.classList.add('hidden');
        custView.classList.remove('hidden');
        btnCust.className = 'px-4 py-1.5 rounded-lg text-sm font-medium bg-indigo-700 shadow-inner transition';
        btnProf.className = 'px-4 py-1.5 rounded-lg text-sm font-medium bg-indigo-950 text-indigo-200 hover:bg-indigo-800 transition';
        renderCustodianTable();
    }
}

function handleRequestSubmit(event) {
    event.preventDefault();
    const equipment = document.getElementById('eq-select').value;
    const room = document.getElementById('eq-room').value;
    const date = document.getElementById('eq-date').value;

    const newReq = {
        id: requests.length + 1,
        professor: 'Dr. Alcantara',
        equipment,
        room,
        date: date.replace('T', ' '),
        status: 'Pending'
    };

    requests.push(newReq);
    renderProfessorList();
    renderCustodianTable();
    event.target.reset();
    alert('Equipment request submitted successfully!');
}

function renderProfessorList() {
    const listContainer = document.getElementById('prof-requests-list');
    listContainer.innerHTML = requests.map(req => `
        <div class="p-2.5 bg-${getStatusBg(req.status)}-50 border border-${getStatusBg(req.status)}-200 rounded-lg flex justify-between items-center">
            <div>
                <p class="font-semibold text-slate-800">${req.equipment}</p>
                <p class="text-slate-500">${req.room} • ${req.date}</p>
            </div>
            <span class="px-2 py-0.5 bg-${getStatusBg(req.status)}-100 text-${getStatusBg(req.status)}-700 rounded-full font-medium">${req.status}</span>
        </div>
    `).join('');
}

function renderCustodianTable() {
    const tbody = document.getElementById('custodian-table-body');
    const statPending = document.getElementById('stat-pending');
    
    const pendingCount = requests.filter(r => r.status === 'Pending').length;
    statPending.textContent = pendingCount;

    tbody.innerHTML = requests.map(req => `
        <tr>
            <td class="p-3.5 font-medium text-slate-800">${req.professor}</td>
            <td class="p-3.5 text-slate-600">${req.equipment}</td>
            <td class="p-3.5 text-slate-600">${req.room}</td>
            <td class="p-3.5 text-slate-600">${req.date}</td>
            <td class="p-3.5"><span class="px-2.5 py-0.5 bg-${getStatusBg(req.status)}-100 text-${getStatusBg(req.status)}-700 rounded-full text-xs font-semibold">${req.status}</span></td>
            <td class="p-3.5 text-right space-x-2">
                ${req.status === 'Pending' ? `
                    <button onclick="updateStatus(${req.id}, 'Approved')" class="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700">Approve</button>
                    <button onclick="updateStatus(${req.id}, 'Rejected')" class="px-2.5 py-1 bg-rose-600 text-white rounded text-xs font-medium hover:bg-rose-700">Reject</button>
                ` : `<span class="text-xs text-slate-400 font-medium">Completed</span>`}
            </td>
        </tr>
    `).join('');
}

function updateStatus(id, newStatus) {
    const req = requests.find(r => r.id === id);
    if (req) {
        req.status = newStatus;
        renderCustodianTable();
        renderProfessorList();
    }
}

function getStatusBg(status) {
    if (status === 'Approved') return 'emerald';
    if (status === 'Rejected') return 'rose';
    return 'amber';
}

function loadRequests() {
    renderCustodianTable();
}
