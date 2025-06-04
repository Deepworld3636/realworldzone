// public/dashboard.js

const form = document.getElementById('userForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const userIdInput = document.getElementById('userId');
const tableBody = document.querySelector('#userTable tbody');

const API_URL = '/api/users';

// Fetch and display users
async function loadUsers() {
  const res = await fetch(API_URL);
  const users = await res.json();
  tableBody.innerHTML = '';

  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>
        <button onclick="editUser('${user._id}', '${user.name}', '${user.email}')">✏️ Edit</button>
        <button onclick="deleteUser('${user._id}')">🗑️ Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// Handle form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = nameInput.value;
  const email = emailInput.value;
  const id = userIdInput.value;

  if (id) {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
  } else {
    await fetch('/add-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
  }

  form.reset();
  loadUsers();
});

// Edit user
function editUser(id, name, email) {
  nameInput.value = name;
  emailInput.value = email;
  userIdInput.value = id;
}

// Delete user
async function deleteUser(id) {
  if (confirm('Are you sure you want to delete this user?')) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    loadUsers();
  }
}

// Initial load
loadUsers();
