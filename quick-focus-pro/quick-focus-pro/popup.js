let timeLeft = 1500, timerId = null, isRunning = false;
const disp = document.getElementById('timer-display'), sBtn = document.getElementById('start-btn');

function updateDisp() {
    let m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    let s = (timeLeft % 60).toString().padStart(2, '0');
    disp.innerText = m + ":" + s;
}
function setMode(sec, btn) {
    clearInterval(timerId); isRunning = false; sBtn.innerText = "Start";
    timeLeft = sec; updateDisp();
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}
document.getElementById('m1').onclick = function() { setMode(1500, this); };
document.getElementById('m2').onclick = function() { setMode(300, this); };
document.getElementById('m3').onclick = function() { setMode(900, this); };

sBtn.onclick = () => {
    if (isRunning) { clearInterval(timerId); isRunning = false; sBtn.innerText = "Start"; }
    else {
        isRunning = true; sBtn.innerText = "Pause";
        timerId = setInterval(() => {
            if (timeLeft > 0) { timeLeft--; updateDisp(); }
            else { clearInterval(timerId); isRunning = false; sBtn.innerText = "Start"; alert("Session Complete!"); }
        }, 1000);
    }
};
document.getElementById('reset-btn').onclick = () => document.getElementById('m1').click();

function loadTasks() {
    chrome.storage.local.get({ tasks: [] }, (data) => {
        const list = document.getElementById('task-list'); list.innerHTML = '';
        let done = 0;
        data.tasks.forEach((t, i) => {
            if (t.completed) done++;
            const li = document.createElement('li'); li.className = 'task-item';
            li.innerHTML = '<span class="'+(t.completed?'completed':'')+'">'+t.text+'</span><div><button style="color:#10b981" data-i="'+i+'" class="c-btn">✔</button><button style="color:#ef4444" data-i="'+i+'" class="d-btn">✕</button></div>';
            list.appendChild(li);
        });
        document.getElementById('completed-count').innerText = 'Done: ' + done;
        document.querySelectorAll('.c-btn').forEach(b => b.onclick = () => toggleTask(b.dataset.i));
        document.querySelectorAll('.d-btn').forEach(b => b.onclick = () => delTask(b.dataset.i));
    });
}
document.getElementById('add-btn').onclick = () => {
    const inp = document.getElementById('task-input'), val = inp.value.trim();
    if (!val) return;
    chrome.storage.local.get({ tasks: [] }, (d) => {
        d.tasks.push({ text: val, completed: false });
        chrome.storage.local.set({ tasks: d.tasks }, () => { inp.value = ''; loadTasks(); });
    });
};
function toggleTask(i) {
    chrome.storage.local.get({ tasks: [] }, (d) => {
        d.tasks[i].completed = !d.tasks[i].completed;
        chrome.storage.local.set({ tasks: d.tasks }, loadTasks);
    });
}
function delTask(i) {
    chrome.storage.local.get({ tasks: [] }, (d) => {
        d.tasks.splice(i, 1);
        chrome.storage.local.set({ tasks: d.tasks }, loadTasks);
    });
}
updateDisp(); loadTasks();