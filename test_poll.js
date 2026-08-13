const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcxYzJlNDYzLWZiMTYtNDYyOC1hOGZhLTRjMTkwNjBkYmMzYiIsImVtYWlsIjoiaW5zdHJ1a3R1ckBnbWFpbC5jb20iLCJuYW1lIjoiVXNlciBJbnN0cnVrdHVyIiwidW5pdCI6Ii0iLCJzdGF0dXMiOiJPbmxpbmUiLCJyb2xlIjoiSW5zdHJ1a3R1ciIsImlhdCI6MTc4NjU4NDkyOCwiZXhwIjoxNzg2NTkyMTI4fQ.TCfEe_DyJnzYInh7g06D57_NtucQFqtWrQfljVuWVbU";
fetch('http://localhost:3000/poll', {
  headers: {
    cookie: `auth_token=${token}`
  }
}).then(res => res.text()).then(html => {
  if (html.includes('Host (Sebagai Instruktur)')) {
    console.log('SUCCESS: Host button is present in HTML');
  } else {
    console.log('FAIL: Host button is MISSING in HTML');
  }
});
