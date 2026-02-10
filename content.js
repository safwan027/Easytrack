(function () {
    // 1. DATA INITIALIZATION
    window.myTickets = JSON.parse(localStorage.getItem('wa_tickets')) || [];
    let currentTab = 'All';

    // 2. STYLES
    const style = document.createElement('style');
    style.textContent = `
        .tab-btn { padding: 8px 4px; cursor: pointer; border: none; background: none; font-size: 11px; color: #667781; border-bottom: 2px solid transparent; flex: 1; transition: 0.3s; display: flex; flex-direction: column; align-items: center; }
        .tab-btn.active { color: #008069; border-bottom: 2px solid #008069; font-weight: bold; }
        .tab-count { font-size: 10px; background: #eee; border-radius: 10px; padding: 1px 6px; margin-top: 2px; color: #667781; }
        .tab-btn.active .tab-count { background: #008069; color: white; }
        .ticket-item { padding: 12px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: white; transition: background 0.2s; }
        .ticket-item.priority-high { background-color: #fff1f0; border-left: 4px solid #d32f2f; }
        .ticket-item:hover { background-color: #f5f6f6; }
        .ticket-meta-box { flex: 1; cursor: pointer; display: flex; flex-direction: column; overflow: hidden; }
        .ticket-header-row { display: flex; justify-content: space-between; align-items: center; }
        .ticket-name-text { font-weight: bold; color: #111b21; font-size: 14px; }
        .ticket-time-text { font-size: 10px; color: #8696a0; margin-right: 10px; }
        .ticket-group-text { font-size: 11px; color: #667781; margin-top: 2px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
        .action-btns { display: flex; align-items: center; gap: 8px; }
        .edit-btn, .priority-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; }
        .edit-btn { color: #008069; }
        .priority-btn { color: #ccc; }
        .priority-btn.active { color: #d32f2f; }
        #ticket-sidebar-header { cursor: move; user-select: none; background: #008069; color: white; padding: 12px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; border-radius: 8px 8px 0 0; }
        .m-label { display: block; font-size: 13px; color: #54656f; margin-bottom: 4px; font-weight: 600; text-align: left; margin-top: 10px; }
        
        /* Sidebar Launcher Style */
        #easytrack-launcher { position: fixed; left: 0; bottom: 120px; width: 60px; height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; z-index: 9999; color: #8696a0; margin-left:3px;margin-bottom:11px; }
        #easytrack-launcher:hover { color: #008069; }
        #easytrack-launcher svg { width: 24px; height: 24px; fill: currentColor; }
        #easytrack-launcher span { font-size: 9px; margin-top: 2px; font-weight: 500; }
        .bell-icon { font-size: 14px; }
    `;
    document.head.appendChild(style);

    // 3. UI ELEMENTS
    const launcher = document.createElement('div');
    launcher.id = 'easytrack-launcher';
    launcher.title = 'EasyTrack';
    launcher.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M20 12V6H4V12H6V14H4C2.9 14 2 13.1 2 12V6C2 4.9 2.9 4 4 4H20C21.1 4 22 4.9 22 6V12C22 13.1 21.1 14 20 14H18V12H20M17 17H7V15H17V17M17 20H7V18H17V20Z"/></svg>`;
    document.body.appendChild(launcher);

    const sidebar = document.createElement('div');
    sidebar.id = 'ticket-sidebar';
    Object.assign(sidebar.style, {
        position: 'fixed', top: '60px', right: '20px', width: '340px',
        zIndex: '9998', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', borderRadius: '8px',
        backgroundColor: 'white', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif', display: 'none'
    });

    const headerUI = document.createElement('div');
    headerUI.id = 'ticket-sidebar-header';
    headerUI.innerHTML = '<span>EasyTrack</span>';

    const headerActions = document.createElement('div');
    headerActions.style.display = 'flex';
    headerActions.style.gap = '12px';
    
     const CloseBtn = document.createElement('button');
    CloseBtn.innerHTML = 'x';
    Object.assign(CloseBtn.style, {  background: 'transparent',
  color: 'white',   // soft red
  border: 'none',
  fontSize: '18px',   // slightly smaller
  cursor: 'pointer',
  fontWeight: '600',
  lineHeight: '1',
  padding: '2px 4px'});
    CloseBtn.onclick = () => { sidebar.style.display = 'none';}

    const addBtn = document.createElement('button');
    addBtn.innerHTML = '+';
    Object.assign(addBtn.style, { background: 'transparent', color: 'white', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' });
    addBtn.onclick = () => {
        const myName = document.querySelector('header [data-testid="default-user"] img')?.alt || "Me (Manual)";
        createModal({ displayName: myName, chatTitle: myName, text: "" });
    };

    const exportBtn = document.createElement('button');
    exportBtn.innerHTML = '📥';
    Object.assign(exportBtn.style, { background: 'transparent', color: 'white', border: 'none', fontSize: '18px', cursor: 'pointer' });
    exportBtn.onclick = () => {
        const ticketsToExport = currentTab === 'All' ? window.myTickets : window.myTickets.filter(t => t.status === currentTab);
        if (ticketsToExport) exportToExcel(ticketsToExport, currentTab);
    };

    headerActions.append(addBtn, exportBtn,CloseBtn);
    headerUI.appendChild(headerActions);

    const tabsContainer = document.createElement('div');
    Object.assign(tabsContainer.style, { display: 'flex', borderBottom: '1px solid #eee' });

    const listContainer = document.createElement('div');
    listContainer.style.maxHeight = '450px';
    listContainer.style.overflowY = 'auto';

    sidebar.append(headerUI, tabsContainer, listContainer);
    document.body.appendChild(sidebar);

    launcher.onclick = () => sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';

    let isDragging = false, offset = [0, 0];
    headerUI.onmousedown = (e) => {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        offset = [sidebar.offsetLeft - e.clientX, sidebar.offsetTop - e.clientY];
    };

    document.onmousemove = (e) => {
        if (!isDragging) return;
        let x = Math.min(Math.max(e.clientX + offset[0], 0), window.innerWidth - sidebar.offsetWidth);
        let y = Math.min(Math.max(e.clientY + offset[1], 0), window.innerHeight - sidebar.offsetHeight);
        sidebar.style.left = x + 'px'; sidebar.style.top = y + 'px'; sidebar.style.right = 'auto';
    };
    document.onmouseup = () => isDragging = false;

    // 5. MODAL WITH TIMER AND DELETE
    const createModal = (data, index = null) => {
        const isEdit = index !== null;
        const existing = document.getElementById('ticket-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'ticket-modal-overlay';
        Object.assign(overlay.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: '10001', display: 'flex', justifyContent: 'center', alignItems: 'center' });

        const form = document.createElement('div');
        Object.assign(form.style, { background: 'white', padding: '20px', borderRadius: '12px', width: '350px' });

        form.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h3 style="margin:0; color:#008069;">${isEdit ? 'Edit Ticket' : 'New Ticket'}</h3>
            </div>
            <label class="m-label">Ticket Name</label>
            <input id="m-name" type="text" value="${isEdit ? data.ticketName : 'Ticket ' + (window.myTickets.length + 1)}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">
            <label class="m-label">Description</label>
            <textarea id="m-desc" style="width:100%; height:60px; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box; resize:none;">${isEdit ? data.description : data.text}</textarea>
            <label class="m-label">Status</label>
            <select id="m-status" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; margin-bottom:10px; color:#000; background:#fff; appearance:auto;">
                ${['Pending', 'Follow ups', 'Completed', 'Holded'].map(s => `<option value="${s}" ${(isEdit ? data.status : "Pending") === s ? "selected" : ""}>${s}</option>`).join('')}
            </select>
            <div id="timer-section" style="display:${(isEdit ? data.status : "Pending") === 'Follow ups' ? 'block' : 'none'};">
                <label class="m-label">Alert Time</label>
                <input id="m-timer" type="datetime-local" value="${isEdit && data.alertTime ? data.alertTime : ''}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">
            </div>
            <div style="display:flex; justify-content:flex-start; margin-top:20px;">
                <div style="display:flex; align-items:center; width:100%;">
                    ${isEdit ? `<button id="m-delete" style="padding:6px 12px; background:#e53935; color:white; border:none; border-radius:4px; cursor:pointer;">Delete</button>` : ''}
                    <div style="margin-left:auto; display:flex; gap:8px;">
                        <button id="m-cancel" style="padding:6px 12px; background:#e0e0e0; border:none; border-radius:4px; cursor:pointer;">Cancel</button>
                        <button id="m-save" style="padding:6px 15px; background:#008069; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Save</button>
                    </div>
                </div>
            </div>
        `;

        form.querySelector('#m-status').onchange = (e) => {
            form.querySelector('#timer-section').style.display = e.target.value === 'Follow ups' ? 'block' : 'none';
        };

        overlay.appendChild(form);
        document.body.appendChild(overlay);

        if (isEdit) {
            form.querySelector('#m-delete').onclick = () => {
                if (confirm("Are you sure you want to delete this ticket?")) {
                    window.myTickets.splice(index, 1);
                    saveAndRefresh();
                    overlay.remove();
                }
            };
        }

        form.querySelector('#m-cancel').onclick = () => overlay.remove();
        form.querySelector('#m-save').onclick = () => {
            const statusVal = form.querySelector('#m-status').value;
            const timerVal = form.querySelector('#m-timer').value;
            
            const ticketObj = {
                ...data,
                ticketName: form.querySelector('#m-name').value,
                description: form.querySelector('#m-desc').value,
                status: statusVal,
                alertTime: timerVal,
                // The bell is active if it's a Follow Up and a time is set
                isBell: statusVal === 'Follow ups' && timerVal !== '',
                alertFired: isEdit && data.alertTime === timerVal ? data.alertFired : false,
                createdTime: isEdit ? data.createdTime : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            if (isEdit) window.myTickets[index] = ticketObj;
            else window.myTickets.push(ticketObj);
            saveAndRefresh();
            overlay.remove();
        };
    };

    const updateSidebar = () => {
        tabsContainer.innerHTML = '';
        ['All', 'Pending', 'Follow ups', 'Completed', 'Holded'].forEach(status => {
            const count = status === 'All' ? window.myTickets.length : window.myTickets.filter(t => t.status === status).length;
            const btn = document.createElement('button');
            btn.className = 'tab-btn' + (currentTab === status ? ' active' : '');
            btn.innerHTML = `<span>${status}</span><span class="tab-count">${count}</span>`;
            btn.onclick = () => { currentTab = status; updateSidebar(); };
            tabsContainer.appendChild(btn);
        });

        listContainer.innerHTML = '';
        let filtered = (currentTab === 'All' ? [...window.myTickets] : window.myTickets.filter(t => t.status === currentTab))
            .sort((a, b) => (b.isPriority && b.status !== 'Completed' ? 1 : 0) - (a.isPriority && a.status !== 'Completed' ? 1 : 0));

        filtered.forEach(t => {
            const item = document.createElement('div');
            const isHigh = t.isPriority && t.status !== 'Completed';
            item.className = `ticket-item ${isHigh ? 'priority-high' : ''}`;
            item.innerHTML = `
                <div class="ticket-meta-box">
                    <div class="ticket-header-row"><span class="ticket-name-text">${t.ticketName}</span><span class="ticket-time-text">${t.createdTime}</span></div>
                    <div class="ticket-group-text">${t.displayName} • ${t.status}</div>
                </div>
                <div class="action-btns">
                    <button class="priority-btn ${isHigh ? 'active' : ''}">${isHigh ? '⚠️' : '⚠'}</button>
                    <button class="edit-btn">✎</button>
                    <span class="bell-icon">${t.isBell ? '🔔' : ''}</span>
                </div>
            `;
            item.querySelector('.ticket-meta-box').onclick = () => window.goToTicket(window.myTickets.indexOf(t));
            item.querySelector('.edit-btn').onclick = () => createModal(t, window.myTickets.indexOf(t));
            item.querySelector('.priority-btn').onclick = () => {
                if (t.status === 'Completed') return;
                t.isPriority = !t.isPriority;
                saveAndRefresh();
            };
            listContainer.appendChild(item);
        });
    };

    // 6. TIMER MONITOR
    setInterval(() => {
        const now = new Date().getTime();
        window.myTickets.forEach(t => {
            if (t.status === 'Follow ups' && t.alertTime && !t.alertFired) {
                if (new Date(t.alertTime).getTime() <= now) {
                    t.alertFired = true;
                    const snooze = confirm(
                        `⏰ Follow-up Reminder\n\nTicket: ${t.ticketName}\nSource: ${t.displayName}\n\nPress OK to Snooze (5m)\nPress Cancel to Stop`
                    );

                    if (snooze) {
                        const snoozeMinutes = 5;
                        const newTime = new Date(new Date().getTime() + snoozeMinutes * 60000);
                        console.log("newTime",newTime);
                        t.alertTime = newTime;//.toISOString().slice(0, 16);
                        console.log("t.alertTime",t.alertTime);
                        t.alertFired = false;
                        t.isBell = true;
                    } else {
                        t.alertTime = null;
                        t.alertFired = true;
                        t.isBell = false;
                    }
                    saveAndRefresh();
                }
            }
        });
    }, 10000);

    const saveAndRefresh = () => { localStorage.setItem('wa_tickets', JSON.stringify(window.myTickets)); updateSidebar(); };

    // 7. OBSERVER
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.querySelector('ul')) {
                    const menu = node.querySelector('ul');
                    const parent = document.querySelector('[data-js-context-icon="true"][aria-expanded="true"]')?.closest('div[data-id]');
                    if (!parent) return;

                    const msgId = parent.getAttribute('data-id');
                    const exists = window.myTickets.findIndex(x => x.messageId === msgId);

                    const replyLi = document.querySelector('li[role="button"]');
                    if (replyLi) {
                        const optionDiv = replyLi.parentElement;
                        const scrollContainer = optionDiv.parentElement;
                        
                        const newOptionDiv = optionDiv.cloneNode(true);
                        const newLi = newOptionDiv.querySelector('li[role="button"]');

if (newLi) {
  newLi.style.opacity = '1';
  newLi.style.visibility = 'visible';
  newLi.style.display = 'flex';   // important for WhatsApp menus
}


                         console.log("newLi",newLi);
                        //const textSpan = newLi.querySelector('span[dir="auto"]');
                       const textSpan = [...newLi.querySelectorAll('span')]
  .find(span => span.getAttribute('aria-hidden') !== 'true');

                        console.log("textSpan",textSpan);
                        if (textSpan) textSpan.textContent = exists !== -1 ? 'Go to Ticket' : 'Create Ticket';

                        //newLi.replaceWith(newLi.cloneNode(true));
                        
                        newOptionDiv.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (exists !== -1) {
                                sidebar.style.display = 'block';
                                window.goToTicket(exists);
                            } else {
                                const latest = document.querySelector('header span[dir="auto"]')?.innerText?.trim() || "Unknown";
                                createModal({ messageId: msgId, displayName: latest, chatTitle: latest, text: parent.querySelector('.copyable-text span')?.textContent || "" });
                            }
                        });
                        scrollContainer.appendChild(newOptionDiv);
                    }
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.goToTicket = async (idx) => {
        const t = window.myTickets[idx];
        if (!t) return;
        sidebar.style.display = 'block';
        currentTab = 'All';
        updateSidebar();

        const ticketItems = listContainer.querySelectorAll('.ticket-item');
        const targetInSidebar = Array.from(ticketItems).find(item => item.querySelector('.ticket-name-text').textContent === t.ticketName);
        if (targetInSidebar) {
            targetInSidebar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            targetInSidebar.style.backgroundColor = "#fff59d";
            setTimeout(() => targetInSidebar.style.backgroundColor = "", 2000);
        }

        if (!t.messageId) return;
        const target = Array.from(document.querySelectorAll('#pane-side span[title]')).find(el => el.title === t.chatTitle);
        if (target) { target.click(); await new Promise(r => setTimeout(r, 800)); }
        const el = document.querySelector(`[data-id="${t.messageId}"]`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.backgroundColor = "#fff59d";
            setTimeout(() => el.style.backgroundColor = "", 2000);
        }
    };

    updateSidebar();

    const exportToExcel = (dataList, tabName) => {
        if (dataList.length === 0) { alert(`No tickets found in ${tabName} to export.`); return; }
        let excelData = `<table><tr><th>Ticket Name</th><th>Source</th><th>Time</th><th>Status</th><th>Description</th></tr>`;
        dataList.forEach(t => { excelData += `<tr><td>${t.ticketName}</td><td>${t.displayName}</td><td>${t.createdTime}</td><td>${t.status}</td><td>${t.description}</td></tr>`; });
        excelData += '</table>';
        const blob = new Blob([excelData], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${tabName} Tickets.xls`;
        link.click();
    };
})();