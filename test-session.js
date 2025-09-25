// Test session creation
const sessionData = {
  id: `session_${Date.now()}`,
  code: Math.floor(100000 + Math.random() * 900000).toString(),
  hostId: `host_test_${Date.now()}`,
  quizData: {
    title: "テストクイズ",
    description: "CLIテスト用",
    questions: [
      {
        id: "q1",
        type: "choice",
        question: "テスト質問",
        options: ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
        correct: 0
      }
    ],
    timeLimit: 300
  },
  status: 'waiting',
  createdAt: Date.now()
};

const sessionId = sessionData.id;
const sessionCode = sessionData.code;

console.log('Creating test session...');
console.log('Session ID:', sessionId);
console.log('Session Code:', sessionCode);

// Save to Firebase using REST API
fetch(`https://learninggamification-new-default-rtdb.firebaseio.com/sessions/${sessionId}.json`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(sessionData)
})
.then(res => res.json())
.then(data => {
  console.log('Session saved:', data);
  
  // Save session code mapping
  return fetch(`https://learninggamification-new-default-rtdb.firebaseio.com/sessionCodes/${sessionCode}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionId)
  });
})
.then(res => res.json())
.then(data => {
  console.log('Session code mapping saved:', data);
  console.log(`\nSession created successfully!`);
  console.log(`Access URL: http://localhost:3001/host/session/${sessionId}`);
  console.log(`Join Code: ${sessionCode}`);
})
.catch(err => console.error('Error:', err));