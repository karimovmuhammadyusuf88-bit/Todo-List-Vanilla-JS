// async function updateTodo(id) {
//     let newTodo = {
//         userTd: 1,
//         id: 1,
//         title: "Assalomu alaykum",
//         completed: true,
//     };

//     try {
//         let res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
//             method: "PUT",
//             headers: {
//                 "Content-type": "application/json",
//             },
//             body: JSON.stringify(newTodo),
//         });

//         if(!res.ok){
//             throw new Error("yangilanishda muammo")
//         }
//         let data = await res.json()
//         console.log(data);
//     }catch(error){
//         console.log(error);

//     }
// };







      // Boshlang'ich test ma'lumotlari (Agar LocalStorage bo'sh bo'lsa ishlaydi)
    const defaultTodos = [
        { id: 1, title: "Express bilan TODO API yozish", desc: "CRUD endpointlar: GET (pagination), POST, PATCH, DELETE.", status: "active", created: "2026-05-14" },
        { id: 2, title: "Swagger response formatni tushunish", desc: "API response: count, next, previous, results bilan keladi.", status: "completed", created: "2026-05-13" },
    ];

    // LocalStorage dan yuklash yoki default qiymat berish (YANGI!)
    let todos = JSON.parse(localStorage.getItem('todos')) || defaultTodos;

    // LocalStorage ga saqlash funksiyasi (YANGI!)
    function saveToLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    let currentPage = 1;
    const itemsPerPage = 5;
    let currentFilter = 'all';
    let currentSort = 'newest';
    let searchQuery = '';
    let editId = null;

    const todoContainer = document.getElementById('todoContainer');
    const totalCountEl = document.getElementById('totalCount');
    const doneCountEl = document.getElementById('doneCount');
    const activeCountEl = document.getElementById('activeCount');
    const addBtn = document.getElementById('addBtn');
    const titleInput = document.getElementById('todoTitle');
    const descInput = document.getElementById('todoDesc');
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');

    function renderTodos() {
        todoContainer.innerHTML = '';

        let filtered = todos.filter(todo => {
            const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
            if (currentFilter === 'all') return matchesSearch;
            return todo.status === currentFilter && matchesSearch;
        });

        if (currentSort === 'newest') {
            filtered.sort((a, b) => b.id - a.id);
        } else {
            filtered.sort((a, b) => a.id - b.id);
        }

        totalCountEl.textContent = todos.length;
        doneCountEl.textContent = todos.filter(t => t.status === 'completed').length;
        activeCountEl.textContent = todos.filter(t => t.status === 'active').length;

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        
        if (currentPage > totalPages) currentPage = totalPages;

        totalPagesEl.textContent = totalPages;
        currentPageEl.textContent = currentPage;

        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = filtered.slice(startIndex, endIndex);

        paginatedItems.forEach(todo => {
            const isComp = todo.status === 'completed';
            const item = document.createElement('div');
            item.className = `todo-item ${isComp ? 'completed' : ''}`;
            item.setAttribute('data-id', todo.id);

            item.innerHTML = `
                <div class="todo-checkbox-wrapper">
                    <div class="todo-checkbox" onclick="toggleStatus(${todo.id})">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
                <div class="todo-content">
                    <div class="todo-title">${todo.title}</div>
                    <div class="todo-desc">${todo.desc}</div>
                    <div class="todo-meta">
                        <div class="meta-tag">ID: ${todo.id}</div>
                        <div class="meta-tag">Created: ${todo.created}</div>
                    </div>
                </div>
                <div class="todo-actions">
                    <span class="status-badge ${todo.status}">${todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}</span>
                    <button class="action-btn" onclick="editTodo(${todo.id})"><i class="fas fa-pen"></i></button>
                    <button class="action-btn" onclick="deleteTodo(${todo.id})"><i class="fas fa-trash"></i></button>
                </div>
            `;
            todoContainer.appendChild(item);
        });
    }

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTodos();
        }
    });

    nextBtn.addEventListener('click', () => {
        const filteredCount = todos.filter(todo => {
            const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
            if (currentFilter === 'all') return matchesSearch;
            return todo.status === currentFilter && matchesSearch;
        }).length;

        if (currentPage < Math.ceil(filteredCount / itemsPerPage)) {
            currentPage++;
            renderTodos();
        }
    });

    window.toggleStatus = function(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                todo.status = todo.status === 'active' ? 'completed' : 'active';
            }
            return todo;
        });
        saveToLocalStorage(); // Saqlash
        renderTodos();
    }

    window.deleteTodo = function(id) {
        todos = todos.filter(todo => todo.id !== id);
        saveToLocalStorage(); // Saqlash
        renderTodos();
    }

    window.editTodo = function(id) {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            titleInput.value = todo.title;
            descInput.value = todo.desc;
            editId = id;
            addBtn.textContent = 'Save';
            addBtn.style.backgroundColor = 'var(--accent-blue)';
            titleInput.focus();
        }
    }

    addBtn.addEventListener('click', () => {
        if (!titleInput.value.trim()) return;

        if (editId !== null) {
            todos = todos.map(todo => {
                if (todo.id === editId) {
                    todo.title = titleInput.value;
                    todo.desc = descInput.value;
                }
                return todo;
            });
            editId = null;
            addBtn.textContent = 'Add';
            addBtn.style.backgroundColor = '#1e293b';
        } else {
            const newTodo = {
                id: todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1,
                title: titleInput.value,
                desc: descInput.value || "Izoh qoldirilmagan.",
                status: "active",
                created: new Date().toISOString().split('T')[0]
            };
            todos.push(newTodo);
            currentPage = 1;
        }

        titleInput.value = '';
        descInput.value = '';
        saveToLocalStorage(); // Saqlash
        renderTodos();
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
        titleInput.value = '';
        descInput.value = '';
        editId = null;
        addBtn.textContent = 'Add';
        addBtn.style.backgroundColor = '#1e293b';
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = 1;
        renderTodos();
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            currentPage = 1;
            renderTodos();
        });
    });

    document.getElementById('sortSelect').addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTodos();
    });

    // Refresh tugmasi bosilganda ma'lumotlarni qayta yuklaydi
    document.getElementById('refreshBtn').addEventListener('click', () => {
        todos = JSON.parse(localStorage.getItem('todos')) || defaultTodos;
        renderTodos();
    });

    // "+ New todo" tugmasi bosilganda inputga fokus beradi
    document.getElementById('newTodoBtn').addEventListener('click', () => {
        titleInput.focus();
    });

    // Ilk yuklanishda saqlab olish va chizish
    saveToLocalStorage();
    renderTodos();