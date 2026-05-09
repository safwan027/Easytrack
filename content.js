(function () {
    // const soundPath = chrome.runtime.getURL("assets/alert.wav");
    // const alertSound = new Audio(soundPath);

    // alertSound.volume = 1;
    // alertSound.loop = true;

    // // For console testing
    // window.alertSound = alertSound;


    // alertSound.oncanplaythrough = () => console.log("✅ Extension audio bundled and ready!");
    // alertSound.onerror = (e) => console.error("❌ Extension audio failed to load:", e);

    // 1. DATA INITIALIZATION
    window.myTickets = JSON.parse(localStorage.getItem('wa_tickets')) || [];
    let currentTab = 'All';

    // 2. STYLES (Inline CSS)
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
                .ticket-group-text { font-size: 11px; color: #667781; margin-top: 2px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; line-height: 1.3; }
                .action-btns { display: flex; align-items: center; gap: 8px; }
                .edit-btn, .priority-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; }
                .edit-btn { color: #    ; }
                .priority-btn { color: #ccc; }
                .priority-btn.active { color: #d32f2f; }
                #ticket-sidebar-header { cursor: move; user-select: none; background: #008069; color: white; padding: 12px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; border-radius: 8px 8px 0 0; }
                .m-label { display: block; font-size: 13px; color: #54656f; margin-bottom: 4px; font-weight: 600; text-align: left; margin-top: 10px; }
                
                /* Launcher Style */
                #easytrack-launcher { position: fixed; left: 0; bottom: 120px; width: 60px; height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; z-index: 9999; color: #8696a0; margin-left:3px;margin-bottom:11px; }
                #easytrack-launcher:hover { color: #008069; }
                #easytrack-launcher svg { width: 24px; height: 24px; fill: currentColor; }
                .bell-icon { font-size: 14px; }

                /* Header Title Link Format */
                .header-title-link { background: none; border: none; color: white; cursor: pointer; font-weight: bold; padding: 0; font-size: 15px; text-decoration: none; font-family: inherit; display: flex; align-items: center; }
                .header-title-link:hover { text-decoration: underline; }

                /* Independent Popup Modal */
                #info-modal-overlay {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0,0,0,0.6); z-index: 10005;
                    display: none; justify-content: center; align-items: center;
                }
                .info-modal-content {
                    background: white; width: 380px; padding: 25px; border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3); position: relative;
                    font-family: Segoe UI, Helvetica, Arial, sans-serif;
                }
                .info-item { margin-bottom: 15px; font-size: 13px; color: #54656f; line-height: 1.4; text-align: left; }
                .info-item b { color: #008069; display: block; margin-bottom: 3px; font-size: 14px; }
                .close-info-modal { position: absolute; top: 12px; right: 12px; background: none; border: none; cursor: pointer; font-size: 20px; color: #8696a0; }
            `;
    document.head.appendChild(style);

    // 3. UI ELEMENTS - OVERLAY GUIDE
    // const infoModalOverlay = document.createElement('div');
    // infoModalOverlay.id = 'info-modal-overlay';
    // infoModalOverlay.innerHTML = `
    //     <div class="info-modal-content">
    //         <h2 style="margin-top:0; color:#008069; font-size: 20px;">EasyTrack Functionalities</h2>
    //         <div style="margin: 20px 0;">
    //             <div class="info-item"><b>➕ Manual Tickets</b>Create personal tasks using the '+' icon in the sidebar.</div>
    //             <div class="info-item"><b>🖱️ Context Menu</b>Right-click any message in WhatsApp to instantly turn it into a ticket.</div>
    //             <div class="info-item"><b>⏰ Follow-up Alarms</b>Set alert times for follow-ups; we'll play a sound when it's time to check.</div>
    //             <div class="info-item"><b>⚠️ Priority Support</b>Highlight urgent tickets to keep them at the top of your list.</div>
    //             <div class="info-item"><b>📥 Data Export</b>Download your ticket list as an Excel file from any tab.</div>
    //              <div class="info-item"><b>➜ Ticket Routing</b>Open the chat for which the tickets has been created, At the time when ticket created message is loaded, when you click on the ticket listings it will route to that specific message highlighting them.</div>
    //         </div>
    //         <button id="info-ok-btn" style="width:100%; padding:10px; background:#008069; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">Got it!</button>
    //     </div>
    // `;
    // document.body.appendChild(infoModalOverlay);

    // const closeInfo = () => infoModalOverlay.style.display = 'none';
    // //infoModalOverlay.querySelector('.close-info-modal').onclick = closeInfo;
    // infoModalOverlay.querySelector('#info-ok-btn').onclick = closeInfo;
    // infoModalOverlay.onclick = (e) => { if(e.target === infoModalOverlay) closeInfo(); };

    // 4. MAIN SIDEBAR UI
    const launcher = document.createElement('div');
    launcher.id = 'easytrack-launcher';
    launcher.title = 'EasyTrack';
    //launcher.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 12V6H4V12H6V14H4C2.9 14 2 13.1 2 12V6C2 4.9 2.9 4 4 4H20C21.1 4 22 4.9 22 6V12C22 13.1 21.1 14 20 14H18V12H20M17 17H7V15H17V17M17 20H7V18H17V20Z"/></svg>`;
    launcher.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M416 224C398.3 224 384 209.7 384 192C384 174.3 398.3 160 416 160L576 160C593.7 160 608 174.3 608 192L608 352C608 369.7 593.7 384 576 384C558.3 384 544 369.7 544 352L544 269.3L374.6 438.7C362.1 451.2 341.8 451.2 329.3 438.7L224 333.3L86.6 470.6C74.1 483.1 53.8 483.1 41.3 470.6C28.8 458.1 28.8 437.8 41.3 425.3L201.3 265.3C213.8 252.8 234.1 252.8 246.6 265.3L352 370.7L498.7 224L416 224z"/></svg>'
    document.body.appendChild(launcher);

    const sidebar = document.createElement('div');
    sidebar.id = 'ticket-sidebar';
    Object.assign(sidebar.style, {
        position: 'fixed', top: '60px', right: '20px', width: '340px',
        zIndex: '9998', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', borderRadius: '8px',
        backgroundColor: 'white', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif', display: 'block'
    });

    const headerUI = document.createElement('div');
    headerUI.id = 'ticket-sidebar-header';

    // const titleLink = document.createElement('button'); 
    // titleLink.className = 'header-title-link';
    // titleLink.innerHTML = 'EasyTrack';
    // titleLink.title = 'Click for EasyTrack Guide';
    // titleLink.href = 'https://easytrack27.netlify.app/';
    // titleLink.onclick = () => infoModalOverlay.style.display = 'flex';

    const titleLink = document.createElement('a');
    titleLink.className = 'header-title-link';
    titleLink.innerHTML = 'EasyTrack';
    titleLink.innerHTML = '<span style="font-family: Garet; font-weight: bold;">EasyTrack</span>';
    titleLink.title = 'Click for EasyTrack Guide';
    titleLink.href = 'https://easytrackio.vercel.app/';
    titleLink.target = '_blank'; // This is the secret sauce for new tabs
    titleLink.rel = 'noopener noreferrer'; // Security best practice for external links



    // No onclick needed unless you want to prevent default behavior!

    headerUI.appendChild(titleLink);

    const headerActions = document.createElement('div');
    headerActions.style.display = 'flex';
    headerActions.style.gap = '12px';

    const CloseBtn = document.createElement('button');
    CloseBtn.innerHTML = 'x';
    Object.assign(CloseBtn.style, { background: 'transparent', color: 'white', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: '600', lineHeight: '1', padding: '2px 4px' });
    CloseBtn.onclick = () => { sidebar.style.display = 'none'; }

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

    headerActions.append(addBtn, exportBtn, CloseBtn);
    headerUI.appendChild(headerActions);

    const tabsContainer = document.createElement('div');
    Object.assign(tabsContainer.style, { display: 'flex', borderBottom: '1px solid #eee' });

    const listContainer = document.createElement('div');
    listContainer.style.maxHeight = '450px';
    listContainer.style.overflowY = 'auto';

    sidebar.append(headerUI, tabsContainer, listContainer);
    document.body.appendChild(sidebar);

    launcher.onclick = () => sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';

    // Dragging Logic
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

    // 5. MODAL LOGIC
    const createModal = (data, index = null) => {
        const isEdit = index !== null;
        const existing = document.getElementById('ticket-modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'ticket-modal-overlay';
        Object.assign(overlay.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: '10001', display: 'flex', justifyContent: 'center', alignItems: 'center' });

        const form = document.createElement('div');
        Object.assign(form.style, { background: 'white', padding: '20px', borderRadius: '12px', width: '350px' });

        console.log("Creating modal for data:", data);

        form.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <h3 style="margin:0; color:#008069;">${isEdit ? 'Edit Ticket' : 'New Ticket'}</h3>
                    </div>
                    <label class="m-label">Ticket Name</label>
                    <label style="font-size:10px; color:#8696a0; margin-bottom:4px;">(Make the ticket name short)</label>
                    <input id="m-name" type="text" maxlength="15" value="${isEdit ? data.ticketName : 'Ticket ' + (window.myTickets.length + 1)}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">
                    <div id="m-name-counter" style="text-align:right; font-size:11px; color:#8696a0; margin-top:3px;">
                        ${isEdit ? data.ticketName.length : ('Ticket ' + (window.myTickets.length + 1)).length}/15
                    </div>
                    <label class="m-label">Description</label>
                    <textarea id="m-desc" style="width:100%; height:60px; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box; resize:none;">${isEdit ? data.description : data.text}</textarea>
                    <label class="m-label">Status</label>
                    <select id="m-status" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; margin-bottom:10px; color:#000; background:#fff; appearance:auto;">
                        ${['Pending', 'Follow-ups', 'Hold', 'Completed'].map(s => `<option value="${s}" ${(isEdit ? data.status : "Pending") === s ? "selected" : ""}>${s}</option>`).join('')}
                    </select>
                    <div id="timer-section" style="display:${(isEdit ? data.status : "Pending") === 'Follow-ups' ? 'block' : 'none'};">
                        <label class="m-label">Alert Time</label>
                        <input id="m-timer" type="datetime-local" value="${data.alertTime ? data.alertTime : ''}" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">
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



        form.querySelector('#m-timer').value = data.alertTime ? data.alertTime : '';

        // form.querySelector('#m-name').onchange = (e) => {
        //  const nameInput = form.querySelector('#m-name');
        //     const nameCounter = form.querySelector('#m-name-counter');
        //     nameInput.addEventListener('input', () => {
        //         const len = nameInput.value.length;
        //         nameCounter.textContent = `${len}/15`;
        //         nameCounter.style.color = len >= 15 ? '#e53935' : '#8696a0';
        //     });
        // };

        form.querySelector('#m-status').onchange = (e) => {
            const nameInput = form.querySelector('#m-name');
            const nameCounter = form.querySelector('#m-name-counter');
            nameInput.addEventListener('input', () => {
                const len = nameInput.value.length;
                nameCounter.textContent = `${len}/15`;
                nameCounter.style.color = len >= 15 ? '#e53935' : '#8696a0';
            });
            form.querySelector('#timer-section').style.display = e.target.value === 'Follow-ups' ? 'block' : 'none';
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

        const handleSave = () => {
            const statusVal = form.querySelector('#m-status').value;
            const timerVal = form.querySelector('#m-timer').value;
            const ticketObj = {
                ...data,
                //parentmssg: document.querySelector(`[data-id="${data.messageId}"]`):",
                ticketName: form.querySelector('#m-name').value,
                description: form.querySelector('#m-desc').value,
                status: statusVal,
                alertTime: timerVal,
                isBell: statusVal === 'Follow-ups' && timerVal !== '',
                alertFired: isEdit && data.alertTime === timerVal ? data.alertFired : false,
                //createdTime: isEdit ? data.createdTime : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                createdTime: isEdit ? data.createdTime : new Date().toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                //parentdiv: data.parentmssg
            };
            if (isEdit) window.myTickets[index] = ticketObj;
            else window.myTickets.push(ticketObj);
            saveAndRefresh();
            overlay.remove();
        };

        form.querySelector('#m-save').onclick = handleSave;
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }
        });
    };

    const updateSidebar = () => {
        tabsContainer.innerHTML = '';
        ['All', 'Pending', 'Follow-ups', 'Hold', 'Completed'].forEach(status => {
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


            // console.log("Message ID:", t.messageId);
            // let parentMsg = [];
            // const el = document.querySelector(`[data-id="${t.messageId}"]`);
            // console.log("el", el);
            // parentMsg.push(el);
            // console.log("Parent message found:", el);

        });
    };

    // 6. TIMER MONITOR
    // setInterval(() => {
    //     const now = new Date().getTime();
    //     window.myTickets.forEach(t => {
    //         if (t.status === 'Follow-ups' && t.alertTime && !t.alertFired) {
    //             if (new Date(t.alertTime).getTime() <= now) {
    //                 t.alertFired = true;
    //                 console.log("alertsound",window.alertSound);
    //                 if (alertSound) {
    //                     alertSound.play().catch(e => console.log("Playback delayed until user interaction."));
    //                 }else{
    //                     console.error("Alert sound not found or failed to play.");
    //                 }

    //                 const snooze = confirm(
    //                     `⏰ Follow-up Reminder\n\nTicket: ${t.ticketName}\nSource: ${t.displayName}\n\nPress OK to Snooze (5m)\nPress Cancel to Stop`
    //                 );

    //                 if (snooze) {
    //                     const snoozeMinutes = 5;
    //                     window.alertSound.pause();
    //                     window.alertSound.currentTime = 0;
    //                     const newTime = new Date(new Date().getTime() + snoozeMinutes * 60000);
    //                     console.log("newTime", newTime);
    //                     t.alertTime = newTime;//.toISOString().slice(0, 16);
    //                     console.log("t.alertTime", t.alertTime);
    //                     t.alertFired = false;
    //                     t.isBell = true;
    //                 } else {
    //                     window.alertSound.pause();
    //                     window.alertSound.currentTime = 0;
    //                     t.alertTime = null;
    //                     t.alertFired = true;
    //                     t.isBell = false;
    //                 }
    //                 saveAndRefresh();
    //             }   
    //         }
    //     });
    // }, 10000);

    setInterval(() => {
        const now = new Date().getTime();
        window.myTickets.forEach(t => {
            if (t.status === 'Follow-ups' && t.alertTime && !t.alertFired) {
                if (new Date(t.alertTime).getTime() <= now) {
                    t.alertFired = true;
                    //window.alertSound.play().catch(e => console.log("Playback delayed until user interaction."));
                    chrome.runtime.sendMessage({ action: "playAlert" })
                    const snooze = confirm(
                        `⏰ Follow-up Reminder\n\nTicket: ${t.ticketName}\nSource: ${t.displayName}\n\nPress OK to Snooze (5m)\nPress Cancel to Stop`
                    );

                    if (snooze) {
                        const snoozeMinutes = 5;
                        // window.alertSound.pause();
                        chrome.runtime.sendMessage({ action: "stopAlert" })
                        //window.alertSound.currentTime = 0;

                        const newTime = new Date(new Date().getTime() + snoozeMinutes * 60000);
                        console.log("newTime", newTime);


                        const year = newTime.getFullYear();
                        const month = String(newTime.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
                        const day = String(newTime.getDate()).padStart(2, '0');
                        const hours = String(newTime.getHours()).padStart(2, '0');
                        const minutes = String(newTime.getMinutes()).padStart(2, '0');
                        const displayFormat = `${year}-${month}-${day}T${hours}:${minutes}`;

                        // const rawTime = newTime.toString();
                        // const parts = rawTime.split(" ");
                        // const timeOnly = parts[4].substring(0, 5); // Gets "23:09"
                        // const displayFormat = `${parts[2]} ${parts[1]} ${parts[3]} ${timeOnly}`;

                        console.log("displayFormat", displayFormat);
                        t.alertTime = displayFormat;
                        //t.alertTime = newTime;


                        t.alertFired = false;
                        t.isBell = true;
                    } else {
                        //window.alertSound.pause();
                        chrome.runtime.sendMessage({ action: "stopAlert" })
                        //window.alertSound.currentTime = 0;
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
    //function pressEscape() { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, code: 'Escape', bubbles: true })); }
    function pressEscape() {
        const escEvent = new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
            keyCode: 27,
            which: 27,
            bubbles: true,
            cancelable: true
        });

        // Try all possible targets
        document.activeElement?.dispatchEvent(escEvent);
        document.body.dispatchEvent(escEvent);
        document.dispatchEvent(escEvent);
        window.dispatchEvent(escEvent);
    }

    // 7. OBSERVER
    // const observer = new MutationObserver((mutations) => {
    //     mutations.forEach(m => {
    //         m.addedNodes.forEach(node => {
    //             if (node.nodeType === 1 && node.querySelector('ul')) {
    //                 const parent = document.querySelector('[data-js-context-icon="true"][aria-expanded="true"]')?.closest('div[data-id]');
    //                 console.log("Context menu opened for message:", parent);
    //                 if (!parent) return;

    //                 const msgId = parent.getAttribute('data-id');
    //                 console.log("msgId", msgId);
    //                 const exists = window.myTickets.findIndex(x => x.messageId === msgId);
    //                 const replyLi = document.querySelector('li[role="button"]');
    //                 console.log("replyLi", replyLi);

    //                 if (replyLi) {
    //                     const optionDiv = replyLi.parentElement;
    //                     const scrollContainer = optionDiv.parentElement;
    //                     const newOptionDiv = optionDiv.cloneNode(true);
    //                     const newLi = newOptionDiv.querySelector('li[role="button"]');

    //                     if (newLi) {
    //                         newLi.style.opacity = '1';
    //                         newLi.style.visibility = 'visible';
    //                         newLi.style.display = 'flex';   //important for WhatsApp menus
    //                     }
    //                     const textSpan = [...newLi.querySelectorAll('span')].find(span => span.getAttribute('aria-hidden') !== 'true');
    //                     if (textSpan) textSpan.textContent = exists !== -1 ? '  Go to Ticket' : 'Create Ticket';

    //                     newOptionDiv.onclick = (e) => {
    //                         e.stopPropagation(); e.preventDefault(); pressEscape();
    //                         if (exists !== -1) { sidebar.style.display = 'block'; window.goToTicket(exists); }
    //                         else {
    //                             const name = document.querySelector('header span[dir="auto"]')?.innerText?.trim() || "Unknown";
    //                             createModal({ messageId: msgId, displayName: name, chatTitle: name, text: parent.querySelector('.copyable-text span')?.textContent || "" });
    //                         }
    //                     };
    //                     scrollContainer.appendChild(newOptionDiv);
    //                 }
    //             }
    //         });
    //     });
    // });

    const observer = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.querySelector('[data-menu-content="true"]')) {
                    // aria-expanded is false at this point, so find the last hovered message instead
                    const parent = document.querySelector('div[data-id]:hover')
                        || document.querySelector('[data-js-context-icon="true"]')?.closest('div[data-id]');
                    console.log("Context menu opened for message:", parent);
                    if (!parent) return;

                    const msgId = parent.getAttribute('data-id');
                    const parentMsgId = document.querySelector(`[data-id="${msgId}"]`);
                    const stringParentMsgId = parentMsgId ? parentMsgId.outerHTML : "";
                    console.log("msgId", msgId);
                    const exists = window.myTickets.findIndex(x => x.messageId === msgId);

                    const deleteBtn = node.querySelector('li[aria-label="Delete"], [role="menuitem"][aria-label="Delete"]')
                        || [...node.querySelectorAll('[role="menuitem"]')].find(el => el.textContent.trim() === 'Delete');
                    console.log("deleteBtn", deleteBtn);
                    if (!deleteBtn) return;

                    const menuContainer = deleteBtn.parentElement;
                    const newBtn = deleteBtn.cloneNode(true);

                    newBtn.setAttribute('aria-label', exists !== -1 ? 'Go to Ticket' : 'Create Ticket');
                    newBtn.style.opacity = '1';
                    newBtn.style.visibility = 'visible';
                    newBtn.style.display = 'flex';

                    const textSpan = [...newBtn.querySelectorAll('span')].find(span => span.getAttribute('aria-hidden') !== 'true');
                    if (textSpan) textSpan.textContent = exists !== -1 ? 'Go to Ticket' : 'Create Ticket';

                    newBtn.onclick = (e) => {
                        e.stopPropagation(); e.preventDefault(); pressEscape();
                        if (exists !== -1) { sidebar.style.display = 'block'; window.goToTicket(exists); }
                        else {
                            const name = document.querySelector('header span[dir="auto"]')?.innerText?.trim() || "Unknown";
                            createModal({ messageId: msgId, displayName: name, chatTitle: name, text: parent.querySelector('.copyable-text span')?.textContent || "", parentMsg: stringParentMsgId });
                        }
                    };

                    // newBtn.onclick = (e) => {
                    //     e.stopPropagation();
                    //     e.preventDefault();
                    //     pressEscape();

                    //     setTimeout(() => {
                    //         if (exists !== -1) {
                    //             sidebar.style.display = 'block';
                    //             window.goToTicket(exists);
                    //         } else {
                    //             const name = document.querySelector('header span[dir="auto"]')?.innerText?.trim() || "Unknown";
                    //             createModal({
                    //                 messageId: msgId,
                    //                 displayName: name,
                    //                 chatTitle: name,
                    //                 text: parent.querySelector('.copyable-text span')?.textContent || "",
                    //                 parentMsg: stringParentMsgId
                    //             });
                    //         }
                    //     }, 100); // give the escape event time to close the menu
                    // };

                    // newBtn.onclick = (e) => {
                    //     e.stopPropagation();
                    //     e.preventDefault();

                    //     // Capture what you need before the menu is removed
                    //     const isExisting = exists !== -1;
                    //     const msgIdCopy = msgId;
                    //     const stringParentMsgIdCopy = stringParentMsgId;
                    //     const name = document.querySelector('header span[dir="auto"]')?.innerText?.trim() || "Unknown";
                    //     const text = parent.querySelector('.copyable-text span')?.textContent || "";

                    //     const menuOverlay = node.closest('div[data-menu-content="true"]');
                    //         // || node.closest('[role="menu"]')?.closest('div')
                    //         // || node;

                    //     menuOverlay.remove();

                    //     setTimeout(() => {
                    //         if (isExisting) {
                    //             sidebar.style.display = 'block';
                    //             window.goToTicket(exists);
                    //         } else {
                    //             createModal({
                    //                 messageId: msgIdCopy,
                    //                 displayName: name,
                    //                 chatTitle: name,
                    //                 text,
                    //                 parentMsg: stringParentMsgIdCopy
                    //             });
                    //         }
                    //     }, 50);
                    // };

                    // newBtn.onclick = (e) => {
                    //     e.stopPropagation();
                    //     e.preventDefault();

                    //     // Log the chain to find the right container
                    //     let el = node;
                    //     while (el) {
                    //         console.log(el.tagName, el.className, el.getAttribute?.('data-id'));
                    //         el = el.parentElement;
                    //     }
                    // };

                    // const menuOverlay = node.closest('div[style*="z-index"]') || node;
                    // menuOverlay.remove();


                    menuContainer.appendChild(newBtn);
                }
            });
        });
    });

    document.addEventListener('keydown', (e) => {
        console.log('keydown fired, isTrusted:', e.isTrusted, 'key:', e.key);
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
        // if (targetInSidebar) {
        //     targetInSidebar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        //     targetInSidebar.style.backgroundColor = "#fff59d";
        //     setTimeout(() => targetInSidebar.style.backgroundColor = "", 2000);
        // }

        if (!t.messageId)
            return alert("No associated message found for this ticket. It might have been created manually or the message was deleted.");
        console.log("messageId:", t.messageId);

        const target = Array.from(document.querySelectorAll('#pane-side span[title]')).find(el => el.title === t.chatTitle);
        if (target) { target.click(); await new Promise(r => setTimeout(r, 800)); }

        const el = document.querySelector(`[data-id="${t.messageId}"]`);
        // const el = t.parentMsg ? (() => {
        //     const tempDiv = document.createElement('div');
        //     tempDiv.innerHTML = t.parentMsg;           
        //     return tempDiv;
        // })() : document.querySelector(`[data-id="${t.messageId}"]`);  

        console.log("el", el);

        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.backgroundColor = "#fff59d";
            setTimeout(() => el.style.backgroundColor = "", 2000);

            targetInSidebar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            targetInSidebar.style.backgroundColor = "#fff59d";
            setTimeout(() => targetInSidebar.style.backgroundColor = "", 2000);
        } else {
            alert("Message not found in the chat. It might have been deleted or the ticket was created before the message loaded. Please scroll through the specific sender chat to load more messages and try again.");
        }
    };

    updateSidebar();

    // const exportToExcel = (dataList, tabName) => {
    //     if (dataList.length === 0) {
    //         alert("No tickets to export in this tab.");
    //         return;
    //     }

    //     let excelData = `<table><tr><th>Name</th><th>Source</th><th>Time</th><th>Status</th><th>Desc</th></tr>`;
    //     dataList.forEach(t => { excelData += `<tr><td>${t.ticketName}</td><td>${t.displayName}</td><td>${t.createdTime}</td><td>${t.status}</td><td>${t.description}</td></tr>`; });
    //     excelData += '</table>';

    //     const blob = new Blob([excelData], { type: 'application/vnd.ms-excel' });
    //     const link = document.createElement('a');

    //     link.href = URL.createObjectURL(blob);
    //     link.download = `${tabName}_Tickets.xls`;
    //     link.click();
    // };
    const exportToExcel = (dataList, tabName) => {
        if (dataList.length === 0) {
            alert("No tickets to export in this tab.");
            return;
        }

        // ✅ Step 1: Sanitize all values to prevent formula injection
        const sanitizeCell = (value) => {
            if (value === null || value === undefined) return '';
            const str = String(value);
            // Strip dangerous formula-triggering prefixes
            const dangerous = ['=', '+', '-', '@', '\t', '\r'];
            if (dangerous.some(char => str.startsWith(char))) {
                return `'${str}`; // Apostrophe prefix = plain text in Excel
            }
            // Escape HTML entities to prevent XSS if ever rendered
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        };

        // ✅ Step 2: Build clean data array with sanitized values
        const sanitizedData = dataList.map(t => ({
            Name: sanitizeCell(t.ticketName),
            Source: sanitizeCell(t.displayName),
            Time: sanitizeCell(t.createdTime),
            Status: sanitizeCell(t.status),
            Desc: sanitizeCell(t.description),
        }));

        // ✅ Step 3: Create a real .xlsx file using SheetJS
        const worksheet = XLSX.utils.json_to_sheet(sanitizedData);

        // ✅ Step 4: Set safe column widths
        worksheet['!cols'] = [
            { wch: 30 }, // Name
            { wch: 20 }, // Source
            { wch: 20 }, // Time
            { wch: 15 }, // Status
            { wch: 50 }, // Desc
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');

        // ✅ Step 5: Export as real .xlsx (not fake HTML-as-xls)
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        // ✅ Step 6: Clean up object URL to prevent memory leak
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${sanitizeCell(tabName)}_Tickets.xlsx`; // Sanitize filename too
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000); // ✅ Revoke after download starts
    };

})();