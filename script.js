// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', function() {
    // Elemen DOM
    const queueNumberInput = document.getElementById('queue-number');
    const operatorSelect = document.getElementById('operator-select');
    const callButton = document.getElementById('call-btn');
    const nextButton = document.getElementById('next-btn');
    const resetButton = document.getElementById('reset-btn');
    const testVoiceButton = document.getElementById('test-voice-btn');
    const currentNumberDisplay = document.getElementById('current-number');
    const currentOperatorDisplay = document.getElementById('current-operator');
    const operatorGrid = document.getElementById('operator-grid');
    const historyList = document.getElementById('history-list');
    const callSound = document.getElementById('call-sound');
    const currentDate = document.getElementById('current-date');
    const currentTime = document.getElementById('current-time');
    
    // Data aplikasi
    let queueHistory = [];
    let currentQueue = 0;
    let currentOperator = 0;
    
    // Nama-nama operator
    const operators = [
        { id: 1, name: "Operator 1", title: "OPERATOR 1", status: "idle" },
        { id: 2, name: "Operator 2", title: "OPERATOR 2", status: "idle" },
        { id: 3, name: "Operator 3", title: "OPERATOR 3", status: "idle" },
        { id: 4, name: "Operator 4", title: "OPERATOR 4", status: "idle" },
        { id: 5, name: "Operator 5", title: "OPERATOR 5",  status: "idle" },
        { id: 6, name: "Operator 6", title: "OPERATOR 6", status: "idle" },
        { id: 7, name: "Operator 7", title: "OPERATOR 8", status: "idle" },
        { id: 8, name: "Operator 8", title: "OPERATOR 9", status: "idle" }
    ];
    
    // Inisialisasi tampilan
    initOperators();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Event listener
    callButton.addEventListener('click', callQueue);
    nextButton.addEventListener('click', nextQueue);
    resetButton.addEventListener('click', resetQueue);
    testVoiceButton.addEventListener('click', testVoice);
    
    // Fungsi inisialisasi tampilan operator
    function initOperators() {
        operatorGrid.innerHTML = '';
        
        operators.forEach(operator => {
            const operatorCard = document.createElement('div');
            operatorCard.className = 'operator-card';
            operatorCard.id = `operator-${operator.id}`;
            operatorCard.innerHTML = `
                <div class="operator-number">${operator.id}</div>
                <div class="operator-title">${operator.title}</div>
                <div class="operator-status ${operator.status}">${operator.status === 'idle' ? 'Tersedia' : operator.status === 'busy' ? 'Sibuk' : 'Memanggil'}</div>
            `;
            operatorGrid.appendChild(operatorCard);
        });
    }
    
    // Fungsi untuk memperbarui tanggal dan waktu
    function updateDateTime() {
        const now = new Date();
        
        // Format tanggal: Senin, 19 Juni 2023
        const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDate.textContent = now.toLocaleDateString('id-ID', optionsDate);
        
        // Format waktu: 14:30:45
        const timeString = now.toLocaleTimeString('id-ID', { hour12: false });
        currentTime.textContent = timeString;
    }
    
    // Fungsi untuk memanggil antrian
    function callQueue() {
        const queueNumber = parseInt(queueNumberInput.value);
        const operatorId = parseInt(operatorSelect.value);
        
        if (isNaN(queueNumber) || queueNumber <= 0) {
            alert("Masukkan nomor antrian yang valid!");
            return;
        }
        
        // Update status operator sebelumnya menjadi idle
        if (currentOperator > 0) {
            updateOperatorStatus(currentOperator, 'idle');
        }
        
        // Update data saat ini
        currentQueue = queueNumber;
        currentOperator = operatorId;
        
        // Update tampilan
        updateDisplay();
        
        // Update status operator yang baru menjadi calling
        updateOperatorStatus(operatorId, 'calling');
        
        // Tambahkan ke riwayat
        addToHistory(queueNumber, operatorId);
        
        // Putar suara panggilan
        playCallSound();
        
        // Bicara dengan Web Speech API
        speakQueue(queueNumber, operatorId);
        
        // Auto reset status operator setelah 30 detik
        setTimeout(() => {
            if (currentOperator === operatorId) {
                updateOperatorStatus(operatorId, 'idle');
            }
        }, 30000);
    }
    
    // Fungsi untuk antrian berikutnya
    function nextQueue() {
        const nextNumber = currentQueue + 1;
        queueNumberInput.value = nextNumber;
        
        // Secara otomatis pindah ke operator berikutnya (siklus)
        const nextOperator = (currentOperator % 8) + 1;
        operatorSelect.value = nextOperator;
        
        // Panggil antrian berikutnya
        callQueue();
    }
    
    // Fungsi untuk mereset antrian
    function resetQueue() {
        if (confirm("Apakah Anda yakin ingin mereset semua antrian? Riwayat panggilan akan dihapus.")) {
            currentQueue = 0;
            currentOperator = 0;
            queueHistory = [];
            historyList.innerHTML = '';
            updateDisplay();
            
            // Reset semua operator ke status idle
            operators.forEach(op => {
                op.status = 'idle';
                updateOperatorStatus(op.id, 'idle');
            });
            
            // Reset input
            queueNumberInput.value = 1;
            operatorSelect.value = 1;
            
            alert("Antrian telah direset!");
        }
    }
    
    // Fungsi untuk menguji suara
    function testVoice() {
        speakText("Ini adalah uji suara untuk sistem antrian SPMB SMA Negeri 1 Magetan. Suara dapat didengar dengan jelas.");
        alert("Uji suara sedang diputar. Periksa volume speaker Anda.");
    }
    
    // Fungsi untuk memperbarui tampilan antrian
    function updateDisplay() {
        const numberElement = currentNumberDisplay.querySelector('.number');
        const operatorElement = currentOperatorDisplay.querySelector('.operator-name');
        
        if (currentQueue > 0) {
            numberElement.textContent = currentQueue.toString().padStart(3, '0');
            operatorElement.textContent = currentOperator;
            
            // Efek visual saat nomor berubah
            numberElement.style.animation = 'none';
            setTimeout(() => {
                numberElement.style.animation = 'bounce 2s infinite';
            }, 10);
        } else {
            numberElement.textContent = '-';
            operatorElement.textContent = '-';
        }
    }
    
    // Fungsi untuk memperbarui status operator
    function updateOperatorStatus(operatorId, status) {
        const operatorIndex = operators.findIndex(op => op.id === operatorId);
        if (operatorIndex !== -1) {
            operators[operatorIndex].status = status;
            
            const operatorCard = document.getElementById(`operator-${operatorId}`);
            if (operatorCard) {
                const statusElement = operatorCard.querySelector('.operator-status');
                
                // Hapus semua kelas status
                operatorCard.classList.remove('active');
                statusElement.classList.remove('idle', 'busy', 'calling');
                
                // Tambahkan kelas yang sesuai
                statusElement.classList.add(status);
                
                // Update teks status
                if (status === 'idle') {
                    statusElement.textContent = 'Tersedia';
                } else if (status === 'busy') {
                    statusElement.textContent = 'Sibuk';
                } else if (status === 'calling') {
                    statusElement.textContent = 'Memanggil';
                    operatorCard.classList.add('active');
                }
            }
        }
    }
    
    // Fungsi untuk menambahkan ke riwayat
    function addToHistory(queueNumber, operatorId) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' });
        
        const operatorName = operators.find(op => op.id === operatorId).title;
        
        const historyItem = {
            number: queueNumber,
            operator: operatorName,
            time: timeString
        };
        
        // Tambahkan ke awal array
        queueHistory.unshift(historyItem);
        
        // Batasi riwayat menjadi 10 item
        if (queueHistory.length > 10) {
            queueHistory = queueHistory.slice(0, 10);
        }
        
        // Update tampilan riwayat
        updateHistoryDisplay();
    }
    
    // Fungsi untuk memperbarui tampilan riwayat
    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        
        queueHistory.forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className = 'history-item';
            historyElement.innerHTML = `
                <div>
                    <span class="history-number">No. ${item.number.toString().padStart(3, '0')}</span>
                    <span class="history-operator"> → ${item.operator}</span>
                </div>
                <div class="history-time">${item.time}</div>
            `;
            historyList.appendChild(historyElement);
        });
    }
    
    // Fungsi untuk memutar suara panggilan
    function playCallSound() {
        callSound.currentTime = 0;
        callSound.play().catch(e => {
            console.log("Autoplay dicegah oleh browser. Klik tombol untuk memainkan suara.");
        });
    }
    
    // Fungsi untuk berbicara menggunakan Web Speech API
    function speakQueue(queueNumber, operatorId) {
        const operatorName = operators.find(op => op.id === operatorId).title;
        const text = `Nomor antrian ${queueNumber}, silahkan menuju ${operatorName}`;
        speakText(text);
    }
    
    // Fungsi untuk mengucapkan teks
    function speakText(text) {
        // Cek dukungan Web Speech API
        if ('speechSynthesis' in window) {
            // Hentikan ucapan yang sedang berlangsung
            speechSynthesis.cancel();
            
            // Buat objek ucapan
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Atur bahasa Indonesia
            utterance.lang = 'id-ID';
            
            // Atur kecepatan dan nada
            utterance.rate = 0.9;
            utterance.pitch = 1.2;
            utterance.volume = 1;
            
            // Pilih suara wanita jika tersedia
            const voices = speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice => 
                voice.lang.includes('id') && voice.name.toLowerCase().includes('female')
            ) || voices.find(voice => 
                voice.lang.includes('id')
            ) || voices[0];
            
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }
            
            // Mulai berbicara
            speechSynthesis.speak(utterance);
        } else {
            alert("Browser Anda tidak mendukung fitur text-to-speech. Gunakan browser modern seperti Chrome atau Edge.");
        }
    }
    
    // Inisialisasi suara untuk Web Speech API
    if ('speechSynthesis' in window) {
        // Tunggu hingga suara tersedia
        speechSynthesis.onvoiceschanged = function() {
            console.log("Web Speech API siap digunakan.");
        };
    }
});