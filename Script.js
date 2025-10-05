// ===== VARIABEL GLOBAL BARU =====
let database = {}; // Objek untuk menyimpan data semua kelas
let currentClass = ''; // String untuk melacak kelas yang sedang aktif
let sortedStudents = [];

// ===== INISIALISASI =====
document.addEventListener('DOMContentLoaded', function() {
    loadSampleData(); 
    normalizeAllData();
    renderClassDropdown();
    renderStudentTable(); 

    document.getElementById('searchName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchStudent();
    });

    const mainDeleteBtn = document.getElementById('mainDeleteBtn');
    const dropdownContent = document.getElementById('deleteDropdownContent');
    
    mainDeleteBtn.addEventListener('click', function() {
        toggleSelectionMode();
        dropdownContent.classList.toggle('show');
    });

    document.getElementById('deleteSelectedLink').addEventListener('click', function(e) {
        e.preventDefault();
        if (!this.classList.contains('disabled')) {
            deleteSelectedStudents();
            dropdownContent.classList.remove('show');
        }
    });

    document.getElementById('deleteAllLink').addEventListener('click', function(e) {
        e.preventDefault();
        deleteAllStudents();
        dropdownContent.classList.remove('show');
    });

    window.addEventListener('click', function(event) {
        const tableBody = document.getElementById('studentTableBody');
        const isClickOnDeleteControl = mainDeleteBtn.contains(event.target);
        const isClickInDropdown = dropdownContent.contains(event.target);
        const isClickInTable = tableBody.contains(event.target);

        if (!isClickOnDeleteControl && !isClickInDropdown && !isClickInTable) {
            dropdownContent.classList.remove('show');
            toggleSelectionMode(true);
        }
    });

    document.getElementById('selectAllCheckbox').addEventListener('click', toggleAllCheckboxes);
});

// ===== FUNGSI BARU: MANAJEMEN KELAS =====
function renderClassDropdown() {
    const classSelector = document.getElementById('classSelector');
    classSelector.innerHTML = '';
    Object.keys(database).forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        if (className === currentClass) {
            option.selected = true;
        }
        classSelector.appendChild(option);
    });
}

function addNewClass() {
    const newClassName = prompt("Masukkan nama kelas baru (contoh: XII-IPA2):");
    if (newClassName && newClassName.trim() !== "") {
        const trimmedClassName = newClassName.trim();
        if (database[trimmedClassName]) {
            alert("Kelas dengan nama tersebut sudah ada!");
            return;
        }
        database[trimmedClassName] = [];
        currentClass = trimmedClassName;
        renderClassDropdown();
        renderStudentTable();
    }
}

function switchClass() {
    const classSelector = document.getElementById('classSelector');
    currentClass = classSelector.value;
    renderStudentTable();
    document.getElementById('resultsSection').classList.add('hidden');
}


// ===== FUNGSI MODE SELEKSI & HAPUS (Diperbarui untuk Multi-Kelas) =====
function toggleSelectionMode(forceOff = false) {
    const table = document.querySelector('.student-table');
    if (forceOff) {
        table.classList.remove('selection-mode');
    } else {
        table.classList.toggle('selection-mode');
    }
}

function deleteAllStudents() {
    if (!database[currentClass] || database[currentClass].length === 0) {
        alert("Tidak ada data untuk dihapus di kelas ini.");
        return;
    }
    if (confirm(`APAKAH ANDA YAKIN ingin menghapus SEMUA data siswa di kelas ${currentClass}?`)) {
        database[currentClass] = [];
        renderStudentTable();
        document.getElementById('resultsSection').classList.add('hidden');
    }
}

function deleteSelectedStudents() {
    const selectedIndices = [];
    document.querySelectorAll('.student-checkbox:checked').forEach(checkbox => {
        selectedIndices.push(parseInt(checkbox.dataset.index));
    });

    if (selectedIndices.length === 0) {
        alert("Tidak ada siswa yang dipilih untuk dihapus.");
        return;
    }

    if (confirm(`Anda akan menghapus ${selectedIndices.length} data siswa. Lanjutkan?`)) {
        database[currentClass] = database[currentClass].filter((_, index) => !selectedIndices.includes(index));
        renderStudentTable(true);
        document.getElementById('resultsSection').classList.add('hidden');
    }
}

function toggleAllCheckboxes() {
    const selectAll = document.getElementById('selectAllCheckbox');
    const checkboxes = document.querySelectorAll('.student-checkbox');
    checkboxes.forEach(checkbox => checkbox.checked = selectAll.checked);
    updateDeleteOptionsState();
}

function updateDeleteOptionsState() {
    const deleteSelectedLink = document.getElementById('deleteSelectedLink');
    const anyChecked = document.querySelectorAll('.student-checkbox:checked').length > 0;
    deleteSelectedLink.classList.toggle('disabled', !anyChecked);
}


// ===== MANAJEMEN DATA & TAMPILAN TABEL UTAMA (Diperbarui untuk Multi-Kelas) =====
function renderStudentTable(keepSelectionMode = false) {
    const tableBody = document.getElementById('studentTableBody');
    const students = database[currentClass] || [];
    tableBody.innerHTML = ''; 
    
    if (!keepSelectionMode) {
        toggleSelectionMode(true); 
    }

    if (students.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Belum ada data siswa di kelas ini.</td></tr>`;
        toggleSelectionMode(true);
    } else {
        students.forEach((student, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="checkbox-cell">
                    <input type="checkbox" class="student-checkbox" data-index="${index}">
                </td>
                <td>${index + 1}</td>
                <td>${student.name}</td>
                <td>${currentClass}</td>
                <td>${student.score}</td>
                <td>${student.sikap}</td>
                <td class="action-buttons">
                    <button class="btn btn-warning" onclick="editStudent(${index})">✏️</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    document.getElementById('selectAllCheckbox').checked = false;
    updateDeleteOptionsState();
    
    document.querySelectorAll('.student-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', updateDeleteOptionsState);
    });
}


// ===== MANAJEMEN MODAL (POP-UP) (Diperbarui untuk Multi-Kelas) =====
function openModal(index = -1) {
    const modal = document.getElementById('studentModal');
    const modalTitle = document.getElementById('modalTitle');
    document.getElementById('editIndex').value = index;

    if (index === -1) {
        modalTitle.textContent = `Tambah Siswa Baru ke Kelas ${currentClass}`;
        document.getElementById('studentName').value = '';
        document.getElementById('studentScore').value = '';
        document.getElementById('studentSikap').value = 'A';
        document.getElementById('studentPrestasi').value = '';
        document.getElementById('studentJuara').value = '';
        document.getElementById('studentTingkat').value = '';
    } else {
        modalTitle.textContent = 'Edit Data Siswa';
        const student = database[currentClass][index];
        document.getElementById('studentName').value = student.name;
        document.getElementById('studentScore').value = student.score;
        document.getElementById('studentSikap').value = student.sikap;
        document.getElementById('studentPrestasi').value = student.prestasi || '';
        document.getElementById('studentJuara').value = student.juara || '';
        document.getElementById('studentTingkat').value = student.tingkat || '';
    }
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('studentModal').style.display = 'none';
}

function saveStudent() {
    const name = document.getElementById('studentName').value.trim();
    const score = parseFloat(document.getElementById('studentScore').value);
    const sikap = document.getElementById('studentSikap').value;
    const prestasi = document.getElementById('studentPrestasi').value.trim();
    const juara = document.getElementById('studentJuara').value;
    const tingkat = document.getElementById('studentTingkat').value.trim().toLowerCase();
    const index = parseInt(document.getElementById('editIndex').value);

    if (!name || isNaN(score)) {
         alert('Nama dan Nilai tidak boleh kosong!'); return;
    }

    const student = { name, score, sikap, prestasi, juara, tingkat };

    if (index === -1) {
        database[currentClass].push(student);
    } else {
        database[currentClass][index] = student;
    }

    closeModal();
    renderStudentTable();
    document.getElementById('resultsSection').classList.add('hidden');
}

function editStudent(index) {
    openModal(index);
}

// ===== MUAT DATA & NORMALISASI (Diperbarui untuk Multi-Kelas) =====
function loadSampleData() {
    database = {
        "XII-IPA1": [
            { name: "Alfarizi Wijaya", score: 95.7, sikap: "A", prestasi: "Tinju", juara: "1", tingkat: "Nasional" },
            { name: "Nazwa Aidilia Octa Mevia", score: 98.0, sikap: "A", prestasi: "Fisika", juara: "1", tingkat: "Provinsi" },
            { name: "Raffi Anggi Reswen", score: 92.8, sikap: "A", prestasi: "Olahraga", juara: "2", tingkat: "Provinsi" },
            { name: "Budi Prasetyo", score: 78.3, sikap: "B", prestasi: "", juara: "", tingkat: "" },
            { name: "Ammar Kamil Al-Abror", score: 91.9, sikap: "A", prestasi: "Bahasa Inggris", juara: "2", tingkat: "Kabupaten" },
        ]
    };
    currentClass = "XII-IPA1";
}

function normalizeAllData() {
    for (const className in database) {
        database[className] = database[className].map(s => {
            const tingkat = s.tingkat ? s.tingkat.toString().trim().toLowerCase() : '';
            return { ...s, tingkat };
        });
    }
}


// ===== ALGORITMA INSERTION SORT =====
function insertionSort(data, ascending = false) {
    let sortedData = [...data];
    function compareStudent(a, b) {
        if (a.score !== b.score) return ascending ? a.score - b.score : b.score - a.score;
        const sikapOrder = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
        if (sikapOrder[a.sikap] !== sikapOrder[b.sikap]) return sikapOrder[b.sikap] - sikapOrder[a.sikap];
        const juaraOrder = { '1': 3, '2': 2, '3': 1, '': 0 };
        if (juaraOrder[a.juara] !== juaraOrder[b.juara]) return juaraOrder[b.juara] - juaraOrder[a.juara];
        const tingkatOrder = { 'internasional': 4, 'nasional': 3, 'provinsi': 2, 'kabupaten': 1, '': 0 };
        if (tingkatOrder[a.tingkat] !== tingkatOrder[b.tingkat]) return tingkatOrder[b.tingkat] - tingkatOrder[a.tingkat];
        return a.name.localeCompare(b.name);
    }
    for (let i = 1; i < sortedData.length; i++) {
        let key = sortedData[i];
        let j = i - 1;
        while (j >= 0 && compareStudent(sortedData[j], key) > 0) {
            sortedData[j + 1] = sortedData[j];
            j = j - 1;
        }
        sortedData[j + 1] = key;
    }
    return sortedData;
}


// ===== PROSES DATA DAN RANKING (Diperbarui untuk Multi-Kelas) =====
function processRanking() {
    const students = database[currentClass] || [];
    if (students.length === 0) {
        alert('Tidak ada data siswa di kelas ini untuk diproses!');
        return;
    }
    const sortOrder = document.getElementById('sortOrder').value;
    const ascending = sortOrder === 'asc';
    sortedStudents = insertionSort(students, ascending);

    displayRankingTable();
    displayStatistics();
    
    document.getElementById('resultsSection').classList.remove('hidden');
    clearSearch();
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

// ===== FUNGSI TAMPILAN HASIL (Diperbarui untuk Multi-Kelas) =====
function displayRankingTable() {
    const tbody = document.getElementById('rankingTableBody');
    tbody.innerHTML = '';
    
    const sortOrder = document.getElementById('sortOrder').value;
    const totalStudents = sortedStudents.length;

    sortedStudents.forEach((student, index) => {
        const row = document.createElement('tr');
        
        let rank;
        if (sortOrder === 'asc') {
            rank = totalStudents - index;
        } else {
            rank = index + 1;
        }

        let rankClass = '';
        if (rank === 1) rankClass = 'gold';
        else if (rank === 2) rankClass = 'silver';
        else if (rank === 3) rankClass = 'bronze';
        
        const tingkatValue = student.tingkat ? student.tingkat.charAt(0).toUpperCase() + student.tingkat.slice(1) : '-';

        row.innerHTML = `
            <td><span class="rank-badge ${rankClass}">${rank}</span></td>
            <td>${student.name}</td>
            <td>${currentClass}</td>
            <td>${student.score.toFixed(2)}</td>
            <td>${student.sikap}</td>
            <td>${student.prestasi || '-'}</td>
            <td>${tingkatValue}</td>
        `;
        tbody.appendChild(row);
    });
}

function displayStatistics() {
    const students = database[currentClass] || [];
    const scores = students.map(s => s.score);
    const totalStudentsVal = scores.length;
    
    document.getElementById('totalStudents').textContent = totalStudentsVal;
    if (totalStudentsVal === 0) {
        document.getElementById('avgScore').textContent = '0';
        document.getElementById('maxScore').textContent = '0';
        document.getElementById('minScore').textContent = '0';
        return;
    }

    const avgScore = scores.reduce((sum, score) => sum + score, 0) / totalStudentsVal;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    document.getElementById('avgScore').textContent = avgScore.toFixed(2);
    document.getElementById('maxScore').textContent = maxScore.toFixed(2);
    document.getElementById('minScore').textContent = minScore.toFixed(2);
}

// ===== FUNGSI PENCARIAN SISWA =====
function searchStudent() {
    const searchName = document.getElementById('searchName').value.trim().toLowerCase();
    const resultDiv = document.getElementById('searchResult');

    if (!searchName) {
        resultDiv.innerHTML = 'Mohon masukkan nama siswa!';
        resultDiv.className = 'not-found';
        return;
    }

    const baseList = (sortedStudents && sortedStudents.length > 0) ? sortedStudents : (database[currentClass] || []);

    const foundStudents = baseList.filter(s => s.name.toLowerCase().includes(searchName));

    if (foundStudents.length > 0) {
        let htmlResult = `<strong>✅ ${foundStudents.length} siswa ditemukan di kelas ${currentClass}:</strong>`;

        foundStudents.forEach(student => {
            let rankText = '-';
            if (sortedStudents && sortedStudents.length > 0) {
                const pos = sortedStudents.indexOf(student);
                if (pos !== -1) rankText = pos + 1;
            }

            let prestasiHtml = '<strong>Prestasi:</strong> -';
            if (student.prestasi) {
                let detail = student.prestasi;
                if (student.juara && student.tingkat) {
                    const tingkatFormatted = student.tingkat.charAt(0).toUpperCase() + student.tingkat.slice(1);
                    detail += ` (Juara ${student.juara} Tingkat ${tingkatFormatted})`;
                }
                prestasiHtml = `<strong>Prestasi:</strong> ${detail}`;
            }

            htmlResult += `
                <hr>
                <p>
                    <strong>Nama:</strong> ${student.name}<br>
                    <strong>Kelas:</strong> ${currentClass}<br>
                    <strong>Peringkat:</strong> ${rankText}<br>
                    <strong>Sikap:</strong> ${student.sikap}<br>
                    ${prestasiHtml}
                </p>
            `;
        });

        resultDiv.innerHTML = htmlResult;
        resultDiv.className = 'found';
    } else {
        resultDiv.innerHTML = `Siswa tidak ditemukan di kelas ${currentClass}!`;
        resultDiv.className = 'not-found';
    }
}

function clearSearch() {
    document.getElementById('searchName').value = '';
    document.getElementById('searchResult').innerHTML = '';
    document.getElementById('searchResult').className = '';
}