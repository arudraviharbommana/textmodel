// Enhanced Three.js galaxy background with random motion

// Function to create circular texture for points
function createCircleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  // Create circular gradient
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  
  return new THREE.CanvasTexture(canvas);
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('three-container').appendChild(renderer.domElement);

// Galaxy center
const galaxyCenter = new THREE.Group();
scene.add(galaxyCenter);

// Central core
const coreGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const coreMaterial = new THREE.MeshBasicMaterial({ 
  color: 0xffffff,
  transparent: true,
  opacity: 0.9
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);
galaxyCenter.add(core);

// Create galaxy spiral arms with stars
const galaxyStars = [];
const galaxyStarsGeometry = new THREE.BufferGeometry();
const galaxyStarsCount = 15000; // Massively increased density
const galaxyPositions = new Float32Array(galaxyStarsCount * 3);
const galaxyColors = new Float32Array(galaxyStarsCount * 3);

for (let i = 0; i < galaxyStarsCount; i++) {
  const i3 = i * 3;
  
  // Create denser spiral galaxy pattern
  const angle = (i / galaxyStarsCount) * Math.PI * 12; // More spiral arms
  const radius = (i / galaxyStarsCount) * 35 + Math.random() * 5; // Larger radius
  
  galaxyPositions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 6;
  galaxyPositions[i3 + 1] = (Math.random() - 0.5) * 3;
  galaxyPositions[i3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 6;
  
  // Color variations for stars
  const colorVariation = Math.random();
  if (colorVariation < 0.3) {
    galaxyColors[i3] = 0.8 + Math.random() * 0.2;     // Red
    galaxyColors[i3 + 1] = 0.6 + Math.random() * 0.4; // Green
    galaxyColors[i3 + 2] = 1.0;                       // Blue
  } else if (colorVariation < 0.6) {
    galaxyColors[i3] = 1.0;                           // Red
    galaxyColors[i3 + 1] = 0.8 + Math.random() * 0.2; // Green
    galaxyColors[i3 + 2] = 0.6 + Math.random() * 0.4; // Blue
  } else {
    galaxyColors[i3] = 1.0;                           // Red
    galaxyColors[i3 + 1] = 1.0;                       // Green
    galaxyColors[i3 + 2] = 0.8 + Math.random() * 0.2; // Blue
  }
}

galaxyStarsGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3));
galaxyStarsGeometry.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));

const galaxyStarsMaterial = new THREE.PointsMaterial({
  size: 0.15, // Slightly larger stars
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  sizeAttenuation: false,
  map: createCircleTexture() // Use circular texture instead of square points
});

const galaxyStarsMesh = new THREE.Points(galaxyStarsGeometry, galaxyStarsMaterial);
galaxyCenter.add(galaxyStarsMesh);

// Random floating stars with individual motion
const floatingStars = [];
const floatingStarsCount = 2000; // Massively increased density

for (let i = 0; i < floatingStarsCount; i++) {
  const starGeometry = new THREE.SphereGeometry(0.03 + Math.random() * 0.08, 8, 8);
  const starMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5 + Math.random() * 0.5),
    transparent: true,
    opacity: 0.8 + Math.random() * 0.2
  });
  
  const star = new THREE.Mesh(starGeometry, starMaterial);
  star.position.set(
    (Math.random() - 0.5) * 120,
    (Math.random() - 0.5) * 120,
    (Math.random() - 0.5) * 120
  );
  
  // Random motion properties
  star.userData = {
    velocityX: (Math.random() - 0.5) * 0.015,
    velocityY: (Math.random() - 0.5) * 0.015,
    velocityZ: (Math.random() - 0.5) * 0.015,
    rotationSpeed: (Math.random() - 0.5) * 0.03
  };
  
  scene.add(star);
  floatingStars.push(star);
}

// Big grey asteroids with random motion - spherical with pulsing animation
const asteroids = [];
const asteroidCount = 400; // Increased count for super galaxy density

for (let i = 0; i < asteroidCount; i++) {
  const baseRadius = 0.3 + Math.random() * 0.8; // Base size for pulsing
  const asteroidGeometry = new THREE.SphereGeometry(baseRadius, 16, 16); // Spherical instead of dodecahedron
  const greyShade = 0.3 + Math.random() * 0.4; // Various shades of grey
  const asteroidMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(greyShade, greyShade, greyShade),
    transparent: true,
    opacity: 0.7 + Math.random() * 0.3
  });
  
  const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
  asteroid.position.set(
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100
  );
  
  // Random motion and pulsing properties
  asteroid.userData = {
    velocityX: (Math.random() - 0.5) * 0.02,
    velocityY: (Math.random() - 0.5) * 0.02,
    velocityZ: (Math.random() - 0.5) * 0.02,
    rotationSpeedX: (Math.random() - 0.5) * 0.08,
    rotationSpeedY: (Math.random() - 0.5) * 0.08,
    rotationSpeedZ: (Math.random() - 0.5) * 0.08,
    baseRadius: baseRadius,
    pulseSpeed: 0.02 + Math.random() * 0.03, // Random pulsing speed
    pulseAmplitude: 0.1 + Math.random() * 0.2, // Random pulsing intensity
    pulseOffset: Math.random() * Math.PI * 2 // Random starting phase
  };
  
  scene.add(asteroid);
  asteroids.push(asteroid);
}

// Dense white pulsing spheres for more immersion
const whiteSpheres = [];
const whiteSphereCount = 800; // Super dense white spheres

for (let i = 0; i < whiteSphereCount; i++) {
  const baseRadius = 0.05 + Math.random() * 0.3; // Smaller base size
  const sphereGeometry = new THREE.SphereGeometry(baseRadius, 12, 12);
  const sphereMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0.9 + Math.random() * 0.1, 0.9 + Math.random() * 0.1, 0.9 + Math.random() * 0.1),
    transparent: true,
    opacity: 0.4 + Math.random() * 0.6
  });
  
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(
    (Math.random() - 0.5) * 150,
    (Math.random() - 0.5) * 150,
    (Math.random() - 0.5) * 150
  );
  
  // Random motion and pulsing properties
  sphere.userData = {
    velocityX: (Math.random() - 0.5) * 0.01,
    velocityY: (Math.random() - 0.5) * 0.01,
    velocityZ: (Math.random() - 0.5) * 0.01,
    rotationSpeedX: (Math.random() - 0.5) * 0.04,
    rotationSpeedY: (Math.random() - 0.5) * 0.04,
    rotationSpeedZ: (Math.random() - 0.5) * 0.04,
    baseRadius: baseRadius,
    pulseSpeed: 0.015 + Math.random() * 0.04, // Varied pulsing speed
    pulseAmplitude: 0.2 + Math.random() * 0.5, // More dramatic pulsing
    pulseOffset: Math.random() * Math.PI * 2 // Random starting phase
  };
  
  scene.add(sphere);
  whiteSpheres.push(sphere);
}

// Nebula particles for super galaxy density
const nebulaParticles = [];
const nebulaCount = 1000;

for (let i = 0; i < nebulaCount; i++) {
  const particleGeometry = new THREE.SphereGeometry(0.02 + Math.random() * 0.15, 8, 8);
  const hue = Math.random() * 0.3; // Purple to blue range
  const particleMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHSL(hue + 0.6, 0.8, 0.6),
    transparent: true,
    opacity: 0.2 + Math.random() * 0.4
  });
  
  const particle = new THREE.Mesh(particleGeometry, particleMaterial);
  particle.position.set(
    (Math.random() - 0.5) * 200,
    (Math.random() - 0.5) * 200,
    (Math.random() - 0.5) * 200
  );
  
  particle.userData = {
    velocityX: (Math.random() - 0.5) * 0.005,
    velocityY: (Math.random() - 0.5) * 0.005,
    velocityZ: (Math.random() - 0.5) * 0.005,
    pulseSpeed: 0.01 + Math.random() * 0.02,
    pulseAmplitude: 0.3 + Math.random() * 0.4,
    pulseOffset: Math.random() * Math.PI * 2
  };
  
  scene.add(particle);
  nebulaParticles.push(particle);
}

// Cosmic dust particles
const cosmicDust = [];
const dustCount = 1500;

for (let i = 0; i < dustCount; i++) {
  const dustGeometry = new THREE.SphereGeometry(0.01 + Math.random() * 0.08, 6, 6);
  const dustMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0.7 + Math.random() * 0.3, 0.6 + Math.random() * 0.4, 0.4 + Math.random() * 0.6),
    transparent: true,
    opacity: 0.1 + Math.random() * 0.3
  });
  
  const dust = new THREE.Mesh(dustGeometry, dustMaterial);
  dust.position.set(
    (Math.random() - 0.5) * 250,
    (Math.random() - 0.5) * 250,
    (Math.random() - 0.5) * 250
  );
  
  dust.userData = {
    velocityX: (Math.random() - 0.5) * 0.003,
    velocityY: (Math.random() - 0.5) * 0.003,
    velocityZ: (Math.random() - 0.5) * 0.003,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    pulseSpeed: 0.008 + Math.random() * 0.015,
    pulseAmplitude: 0.2 + Math.random() * 0.3,
    pulseOffset: Math.random() * Math.PI * 2
  };
  
  scene.add(dust);
  cosmicDust.push(dust);
}

function animate() {
  requestAnimationFrame(animate);
  
  // Rotate galaxy center
  galaxyCenter.rotation.y += 0.001;
  galaxyCenter.rotation.x += 0.0005;
  
  // Rotate core
  core.rotation.y += 0.02;
  
  // Animate floating stars
  floatingStars.forEach(star => {
    star.position.x += star.userData.velocityX;
    star.position.y += star.userData.velocityY;
    star.position.z += star.userData.velocityZ;
    star.rotation.y += star.userData.rotationSpeed;
    
    // Wrap around screen boundaries
    if (star.position.x > 50) star.position.x = -50;
    if (star.position.x < -50) star.position.x = 50;
    if (star.position.y > 50) star.position.y = -50;
    if (star.position.y < -50) star.position.y = 50;
    if (star.position.z > 50) star.position.z = -50;
    if (star.position.z < -50) star.position.z = 50;
  });
  
  // Animate asteroids with pulsing effect
  asteroids.forEach(asteroid => {
    // Move asteroid
    asteroid.position.x += asteroid.userData.velocityX;
    asteroid.position.y += asteroid.userData.velocityY;
    asteroid.position.z += asteroid.userData.velocityZ;
    
    // Rotate asteroid
    asteroid.rotation.x += asteroid.userData.rotationSpeedX;
    asteroid.rotation.y += asteroid.userData.rotationSpeedY;
    asteroid.rotation.z += asteroid.userData.rotationSpeedZ;
    
    // Pulsing effect - shrinking and bulging
    const time = Date.now() * 0.001;
    const pulseValue = Math.sin(time * asteroid.userData.pulseSpeed + asteroid.userData.pulseOffset);
    const currentScale = 1 + pulseValue * asteroid.userData.pulseAmplitude;
    asteroid.scale.set(currentScale, currentScale, currentScale);
    
    // Wrap around screen boundaries
    if (asteroid.position.x > 40) asteroid.position.x = -40;
    if (asteroid.position.x < -40) asteroid.position.x = 40;
    if (asteroid.position.y > 40) asteroid.position.y = -40;
    if (asteroid.position.y < -40) asteroid.position.y = 40;
    if (asteroid.position.z > 40) asteroid.position.z = -40;
    if (asteroid.position.z < -40) asteroid.position.z = 40;
  });
  
  // Animate white pulsing spheres
  whiteSpheres.forEach(sphere => {
    // Move sphere
    sphere.position.x += sphere.userData.velocityX;
    sphere.position.y += sphere.userData.velocityY;
    sphere.position.z += sphere.userData.velocityZ;
    
    // Rotate sphere
    sphere.rotation.x += sphere.userData.rotationSpeedX;
    sphere.rotation.y += sphere.userData.rotationSpeedY;
    sphere.rotation.z += sphere.userData.rotationSpeedZ;
    
    // Pulsing effect - shrinking and bulging
    const time = Date.now() * 0.001;
    const pulseValue = Math.sin(time * sphere.userData.pulseSpeed + sphere.userData.pulseOffset);
    const currentScale = 1 + pulseValue * sphere.userData.pulseAmplitude;
    sphere.scale.set(currentScale, currentScale, currentScale);
    
    // Wrap around screen boundaries
    if (sphere.position.x > 60) sphere.position.x = -60;
    if (sphere.position.x < -60) sphere.position.x = 60;
    if (sphere.position.y > 60) sphere.position.y = -60;
    if (sphere.position.y < -60) sphere.position.y = 60;
    if (sphere.position.z > 60) sphere.position.z = -60;
    if (sphere.position.z < -60) sphere.position.z = 60;
  });
  
  // Animate nebula particles
  nebulaParticles.forEach(particle => {
    particle.position.x += particle.userData.velocityX;
    particle.position.y += particle.userData.velocityY;
    particle.position.z += particle.userData.velocityZ;
    
    // Pulsing effect
    const time = Date.now() * 0.001;
    const pulseValue = Math.sin(time * particle.userData.pulseSpeed + particle.userData.pulseOffset);
    const currentScale = 1 + pulseValue * particle.userData.pulseAmplitude;
    particle.scale.set(currentScale, currentScale, currentScale);
    
    // Wrap around boundaries
    if (particle.position.x > 80) particle.position.x = -80;
    if (particle.position.x < -80) particle.position.x = 80;
    if (particle.position.y > 80) particle.position.y = -80;
    if (particle.position.y < -80) particle.position.y = 80;
    if (particle.position.z > 80) particle.position.z = -80;
    if (particle.position.z < -80) particle.position.z = 80;
  });
  
  // Animate cosmic dust
  cosmicDust.forEach(dust => {
    dust.position.x += dust.userData.velocityX;
    dust.position.y += dust.userData.velocityY;
    dust.position.z += dust.userData.velocityZ;
    
    dust.rotation.y += dust.userData.rotationSpeed;
    
    // Subtle pulsing effect
    const time = Date.now() * 0.001;
    const pulseValue = Math.sin(time * dust.userData.pulseSpeed + dust.userData.pulseOffset);
    const currentScale = 1 + pulseValue * dust.userData.pulseAmplitude;
    dust.scale.set(currentScale, currentScale, currentScale);
    
    // Wrap around boundaries
    if (dust.position.x > 100) dust.position.x = -100;
    if (dust.position.x < -100) dust.position.x = 100;
    if (dust.position.y > 100) dust.position.y = -100;
    if (dust.position.y < -100) dust.position.y = 100;
    if (dust.position.z > 100) dust.position.z = -100;
    if (dust.position.z < -100) dust.position.z = 100;
  });
  
  renderer.render(scene, camera);
}
animate();

// API Configuration
const API_KEY = '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';
const API_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Database Configuration - Supabase
const DATABASE_API_URL = 'https://riejinbjcygjxhhblltt.supabase.co/rest/v1/work_history';
const DATABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZWppbmJqY3lnanhoaGJsbHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjI0MTQsImV4cCI6MjA2ODMzODQxNH0.QaTVAS-2UB4AWqqyS8Qc6FpYR7jzfJnTb2N1N9vIJEI';

// Global variables
let currentInputContent = '';
let currentSessionId = null;
let currentSessionMessages = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeSidebar();
  loadHistoryFromDatabase();
});

// Sidebar functionality
function initializeSidebar() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const toggleSidebar = document.getElementById('toggleSidebar');
  const container = document.querySelector('.container');

  menuToggle.addEventListener('click', function() {
    sidebar.classList.add('open');
    container.classList.add('sidebar-open');
  });

  toggleSidebar.addEventListener('click', function() {
    sidebar.classList.remove('open');
    container.classList.remove('sidebar-open');
  });

  // Close sidebar when clicking outside
  document.addEventListener('click', function(event) {
    if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
      sidebar.classList.remove('open');
      container.classList.remove('sidebar-open');
    }
  });
}

// Button actions with API calls and history saving
async function handleClick(action) {
  const input = document.getElementById("inputText").value;
  const output = document.getElementById("output");
  const diveDeepBox = document.getElementById("diveDeepBox");
  
  if (!input.trim()) {
    output.innerText = "Please enter some text to analyze.";
    return;
  }
  
  // Start new session if input has changed significantly or this is first request
  if (!currentSessionId || input !== currentInputContent) {
    currentSessionId = generateSessionId();
    currentSessionMessages = [];
  }
  
  // Store current input for later use in dive deeper
  currentInputContent = input;
  
  // Show loading state
  output.innerHTML = '<span class="loading">🔄 Processing your request...</span>';
  diveDeepBox.style.display = "none";
  
  try {
    let result = "";
    
    switch(action) {
      case 'summarize':
        result = await callSummarizeAPI(input);
        break;
        
      case 'keynotes':
        result = await callKeyNotesAPI(input);
        break;
        
      case 'explain':
        result = await callExplainAPI(input);
        break;
        
      case 'dive':
        result = await callDiveDeepAPI(input);
        diveDeepBox.style.display = "block";
        break;
        
      default:
        result = `Unknown action: ${action}`;
    }
    
    output.innerText = result;
    
    // If this is a summarize action, convert markdown bold to HTML
    if (action === 'summarize') {
      output.innerHTML = formatSummaryText(result);
    }
    
    // Save to current session
    const message = {
      type: 'analysis',
      action: action,
      input: input,
      output: result,
      timestamp: new Date().toISOString()
    };
    
    currentSessionMessages.push(message);
    
    // Save session to history
    await saveSessionToHistory();
    
  } catch (error) {
    console.error('API Error:', error);
    output.innerHTML = `<span class="error">❌ Error: ${error.message}. Please try again.</span>`;
  }
}

// Handle question for dive deeper
async function handleQuestion() {
  const questionInput = document.getElementById("questionInput").value;
  const questionAnswer = document.getElementById("questionAnswer");
  
  if (!currentInputContent.trim()) {
    questionAnswer.innerText = "Please enter content in the main text area first.";
    return;
  }
  
  if (!questionInput.trim()) {
    questionAnswer.innerText = "Please enter a question.";
    return;
  }
  
  // Show loading state
  questionAnswer.innerHTML = '<span class="loading">🔄 Analyzing your question...</span>';
  
  try {
    const answer = await callQuestionAPI(questionInput, currentInputContent);
    questionAnswer.innerText = `❓ Q: ${questionInput}\n\n💬 A: ${answer}`;
    
    // Add question to current session
    const message = {
      type: 'question',
      question: questionInput,
      answer: answer,
      timestamp: new Date().toISOString()
    };
    
    currentSessionMessages.push(message);
    
    // Save updated session to history
    await saveSessionToHistory();
    
    // Clear the question input
    document.getElementById("questionInput").value = "";
    
  } catch (error) {
    console.error('Question API Error:', error);
    questionAnswer.innerHTML = `<span class="error">❌ Error: ${error.message}. Please try again.</span>`;
  }
}

// Helper Functions
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// History Management Functions
async function saveSessionToHistory() {
  const sessionData = {
    sessionId: currentSessionId,
    messages: currentSessionMessages,
    title: generateSessionTitle(),
    timestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
  
  try {
    // Save to local storage
    const localHistory = JSON.parse(localStorage.getItem('conversationHistory') || '[]');
    const existingIndex = localHistory.findIndex(s => s.sessionId === currentSessionId);
    
    if (existingIndex >= 0) {
      localHistory[existingIndex] = sessionData;
    } else {
      localHistory.unshift(sessionData);
    }
    
    localStorage.setItem('conversationHistory', JSON.stringify(localHistory.slice(0, 50)));
    
    // Save to database
    await saveSessionToDatabase(sessionData);
    
    // Update UI
    updateHistoryUI();
    
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

function generateSessionTitle() {
  if (currentSessionMessages.length === 0) return "New Conversation";
  
  const firstMessage = currentSessionMessages[0];
  if (firstMessage.type === 'analysis') {
    const preview = firstMessage.input.substring(0, 50);
    return `${firstMessage.action.toUpperCase()}: ${preview}${firstMessage.input.length > 50 ? '...' : ''}`;
  }
  
  return "New Conversation";
}

// Format summary text with bold headings
function formatSummaryText(text) {
  // Convert **text** to <strong>text</strong>
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
             .replace(/\n/g, '<br>');
}
async function saveSessionToDatabase(sessionData) {
  try {
    // For now, save individual messages to maintain compatibility
    // In a real implementation, you'd create a sessions table
    const lastMessage = sessionData.messages[sessionData.messages.length - 1];
    
    const response = await fetch(DATABASE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': DATABASE_API_KEY,
        'Authorization': `Bearer ${DATABASE_API_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        session_id: sessionData.sessionId,
        action: lastMessage.type === 'analysis' ? lastMessage.action : 'question',
        input: lastMessage.type === 'analysis' ? lastMessage.input : lastMessage.question,
        output: lastMessage.type === 'analysis' ? lastMessage.output : lastMessage.answer,
        timestamp: lastMessage.timestamp,
        session_title: sessionData.title
      })
    });
    
    if (!response.ok) {
      throw new Error(`Database save failed: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Database save error:', error);
    return false;
  }
}

async function loadHistoryFromDatabase() {
  try {
    const response = await fetch(`${DATABASE_API_URL}?select=*&order=timestamp.desc&limit=50`, {
      method: 'GET',
      headers: {
        'apikey': DATABASE_API_KEY,
        'Authorization': `Bearer ${DATABASE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Convert old format to new session format for backward compatibility
      const sessions = convertToSessions(data);
      
      // Merge with local storage
      const localHistory = JSON.parse(localStorage.getItem('conversationHistory') || '[]');
      const mergedHistory = [...sessions, ...localHistory];
      
      // Remove duplicates based on sessionId
      const uniqueHistory = mergedHistory.filter((item, index, self) => 
        index === self.findIndex(h => h.sessionId === item.sessionId)
      );
      
      // Sort by timestamp (newest first)
      uniqueHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      localStorage.setItem('conversationHistory', JSON.stringify(uniqueHistory.slice(0, 50)));
      updateHistoryUI(uniqueHistory);
    } else {
      updateHistoryUI();
    }
  } catch (error) {
    console.error('Failed to load history from database:', error);
    updateHistoryUI();
  }
}

function convertToSessions(oldData) {
  // Convert old individual items to session format
  const sessions = [];
  
  oldData.forEach(item => {
    const sessionId = item.session_id || `legacy_${item.timestamp}`;
    let existingSession = sessions.find(s => s.sessionId === sessionId);
    
    if (!existingSession) {
      existingSession = {
        sessionId: sessionId,
        messages: [],
        title: item.session_title || `${item.action.toUpperCase()}: ${item.input.substring(0, 50)}...`,
        timestamp: item.timestamp,
        lastUpdated: item.timestamp
      };
      sessions.push(existingSession);
    }
    
    existingSession.messages.push({
      type: item.action === 'question' ? 'question' : 'analysis',
      action: item.action,
      input: item.input,
      output: item.output,
      timestamp: item.timestamp
    });
  });
  
  return sessions;
}

function updateHistoryUI(sessionHistory = null) {
  const historyList = document.getElementById('historyList');
  
  // Use session history if available, otherwise use local storage
  const history = sessionHistory || JSON.parse(localStorage.getItem('conversationHistory') || '[]');
  
  if (history.length === 0) {
    historyList.innerHTML = '<p style="text-align: center; color: #666;">No conversations yet</p>';
    return;
  }
  
  historyList.innerHTML = history.map(session => `
    <div class="history-session" onclick="loadSession('${session.sessionId}')">
      <div class="session-header">
        <span class="session-title">${session.title}</span>
        <span class="session-time">${formatTime(session.lastUpdated)}</span>
      </div>
      <div class="session-preview">
        ${session.messages.length} message${session.messages.length > 1 ? 's' : ''}
      </div>
    </div>
  `).join('');
}

function loadSession(sessionId) {
  const history = JSON.parse(localStorage.getItem('conversationHistory') || '[]');
  const session = history.find(s => s.sessionId === sessionId);
  
  if (session && session.messages.length > 0) {
    const firstMessage = session.messages[0];
    
    // Load the original content
    if (firstMessage.type === 'analysis') {
      document.getElementById('inputText').value = firstMessage.input;
      document.getElementById('output').innerText = firstMessage.output;
      
      // Set current session
      currentSessionId = sessionId;
      currentSessionMessages = [...session.messages];
      currentInputContent = firstMessage.input;
      
      // If there were follow-up questions, show the dive deeper box
      const hasQuestions = session.messages.some(m => m.type === 'question');
      if (hasQuestions) {
        document.getElementById('diveDeepBox').style.display = 'block';
        
        // Show the last question and answer
        const lastQuestion = session.messages.filter(m => m.type === 'question').pop();
        if (lastQuestion) {
          document.getElementById('questionAnswer').innerText = 
            `❓ Q: ${lastQuestion.question}\n\n💬 A: ${lastQuestion.answer}`;
        }
      }
    }
    
    // Close sidebar
    document.getElementById('sidebar').classList.remove('open');
    document.querySelector('.container').classList.remove('sidebar-open');
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function clearHistory() {
  if (confirm('Are you sure you want to clear all conversation history? This action cannot be undone.')) {
    try {
      // Clear local storage
      localStorage.removeItem('conversationHistory');
      
      // Clear database
      const response = await fetch(DATABASE_API_URL, {
        method: 'DELETE',
        headers: {
          'apikey': DATABASE_API_KEY,
          'Authorization': `Bearer ${DATABASE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Reset current session
      currentSessionId = null;
      currentSessionMessages = [];
      
      // Update UI
      updateHistoryUI();
      
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert('Failed to clear history. Please try again.');
    }
  }
}

function exportHistory() {
  const history = JSON.parse(localStorage.getItem('conversationHistory') || '[]');
  
  if (history.length === 0) {
    alert('No conversation history to export.');
    return;
  }
  
  const exportData = {
    exportDate: new Date().toISOString(),
    totalSessions: history.length,
    totalMessages: history.reduce((sum, session) => sum + session.messages.length, 0),
    conversations: history
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `text-analysis-conversations-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// API Call Functions
async function callSummarizeAPI(text) {
  const prompt = `Please provide a structured summary of the following text that is approximately 3/5 the length of the original content. Format your response with bold headings and organized sections:

Text: "${text}"

Please structure your summary with these sections (use **bold** for headings):

**Main Topic:**
[Brief description of the main subject]

**Key Points:**
[3-5 most important points, each as a bullet point]

**Important Details:**
[Supporting information and context]

**Conclusion:**
[Primary takeaway or conclusion]

Make sure the total length is about 60% of the original text length while maintaining all essential information.

Summary:`;

  return await makeAPICall(prompt);
}

async function callKeyNotesAPI(text) {
  const prompt = `Please analyze the following text and generate comprehensive bullet points that capture all key information. Create detailed bullet points by understanding the input thoroughly:

Text: "${text}"

Generate bullet points that include:
- Main concepts and ideas
- Important facts and details
- Key insights and takeaways
- Supporting information
- Conclusions or implications

Bullet Points:`;

  return await makeAPICall(prompt);
}

async function callExplainAPI(text) {
  const prompt = `Please provide a detailed, pin-to-pin explanation of the following text. Explain every aspect thoroughly, breaking down complex concepts, clarifying terminology, and providing comprehensive understanding:

Text: "${text}"

Provide a detailed explanation that covers:
1. Context and background
2. Main concepts explained in detail
3. Breaking down complex terms and ideas
4. Relationships between different elements
5. Implications and significance
6. Examples or clarifications where helpful

Detailed Explanation:`;

  return await makeAPICall(prompt);
}

async function callDiveDeepAPI(text) {
  const prompt = `Please provide a deep analysis of the following text. Analyze it thoroughly and prepare for follow-up questions:

Text: "${text}"

Provide a comprehensive deep analysis covering:
1. In-depth content analysis
2. Themes and patterns
3. Context and implications
4. Significance and relevance
5. Potential areas for further exploration

Deep Analysis:`;

  return await makeAPICall(prompt);
}

async function callQuestionAPI(question, originalText) {
  const prompt = `Based on the following text, please answer the user's question. If the question is not relevant to the content, briefly explain that the prompt is not relevant to the input and provide a brief general response about the content instead.

Original Text: "${originalText}"

User Question: "${question}"

Instructions:
- If the question is relevant to the text, provide a detailed answer based on the content
- If the question is not relevant, respond with: "The prompt is not relevant to the input. However, I can tell you that the content is about [brief description of the actual content]."
- Be thorough and helpful in your response

Answer:`;

  return await makeAPICall(prompt);
}

// Generic API call function
async function makeAPICall(prompt) {
  // Check if API key is configured
  if (!API_KEY || API_KEY === 'sk-or-v1-YOUR_API_KEY_HERE') {
    throw new Error('API key not configured. Please check API_SETUP.md for instructions.');
  }
  
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Text Analysis AI'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant specialized in text analysis, summarization, and explanation. Provide clear, comprehensive, and well-structured responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error('No response from API');
    }
  } catch (error) {
    console.error('API Error Details:', error);
    
    // If API fails, provide a fallback response
    if (error.message.includes('401') || error.message.includes('auth')) {
      throw new Error('Authentication failed. Please check your API key configuration in API_SETUP.md.');
    }
    
    throw error;
  }
}

// Handle window resize for Three.js
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
