import React, { useState, useEffect, useRef, useCallback } from "react";

// --- Image Imports ---
// Ensure your image is named school2.jpeg and is in the src folder
import schoolPic from './school2.jpeg'; 

// --- Initial Data Structures ---
// These are now the primary data source for the application, managed in local state.
const INITIAL_USERS = [
  { id: "admin", password: "admin123", name: "Admin User", progress: 100, role: "admin" },
  { id: "student1", password: "pass1", name: "Student One", progress: 70, role: "member" },
  { id: "student2", password: "pass2", name: "Student Two", progress: 50, role: "member" },
];

const INITIAL_WORK = [
  { id: 1, userId: "student1", title: "Project 1: Personal Website", description: "Designed and built a responsive personal portfolio website using HTML, CSS, and JavaScript.", date: "2024-04-10", imageUrl: "https://placehold.co/300x200/ADD8E6/000000?text=Web+Project" },
  { id: 2, userId: "student2", title: "Project 2: Robotics Arm", description: "Developed a prototype robotic arm controlled by Arduino, focusing on precise movement and object gripping.", date: "2024-05-20", imageUrl: "https://placehold.co/300x200/90EE90/000000?text=Robotics+Arm" },
  { id: 3, userId: "admin", title: "Club Website Redesign", description: "Led the initiative to redesign the official MPS Cyber Club website, improving UI/UX and adding new features.", date: "2024-03-01", imageUrl: "https://placehold.co/300x200/FFD700/000000?text=Club+Website" },
];

const INITIAL_EVENTS = [
  { id: 1, title: "Cyber Security Workshop", date: "2025-06-01", description: "Learn basics of cyber security and ethical hacking. Hands-on exercises included." },
  { id: 2, title: "Hackathon 2025", date: "2025-07-15", description: "Join the club hackathon event. Compete in teams to solve real-world tech challenges." },
  { id: 3, title: "AI & Machine Learning Seminar", date: "2025-08-22", description: "An introductory seminar on Artificial Intelligence and Machine Learning concepts and applications." },
];

const INITIAL_ACHIEVEMENTS = [
  { id: 1, title: "First Prize in State-Level Coding Contest", year: 2024, description: "Awarded for outstanding performance in the annual state-level coding competition." },
  { id: 2, title: "Best Robotics Project Award", year: 2023, description: "Recognized for innovative design and functionality in the inter-school robotics exhibition." },
  { id: 3, title: "National Cyber Olympiad Gold Medal", year: 2024, description: "Secured a gold medal in the National Cyber Olympiad, demonstrating exceptional cybersecurity knowledge." },
];

const INITIAL_ARTICLES = [
  { id: 1, title: "Introduction to Cybersecurity", content: "Cybersecurity involves protecting systems, networks, and programs from digital attacks. These attacks are usually aimed at accessing, changing, or destroying sensitive information; extorting money from users; or interrupting normal business processes. Implementing effective cybersecurity measures is particularly challenging today because there are more devices than people, and attackers are becoming more innovative.", author: "Admin User", date: "2024-01-15" },
  { id: 2, title: "Basics of Networking", content: "Networking is the practice of connecting computers for the purpose of sharing data and resources. It involves a set of rules, conventions, and underlying physical structures that enable communication between devices. Key concepts include IP addresses, protocols (like TCP/IP), and network topologies (like star and mesh). Understanding networking is fundamental to modern computing.", author: "Student One", date: "2024-02-28" },
  { id: 3, title: "Understanding Artificial Intelligence", content: "Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think like humans and mimic their actions. The term may also be applied to any machine that exhibits traits associated with a human mind such as learning and problem-solving. AI is rapidly transforming various industries, from healthcare to finance.", author: "Admin User", date: "2024-03-10" },
];

// For photos, we'll store them in a simple array in local state for now.
// In a real app without Firebase, you'd need a different image storage solution.
const INITIAL_PHOTOS = [];

// --- Menu Items for Navigation ---
const MENU_ITEMS = [
  { key: "home", label: "Home" },
  { key: "members", label: "Member Details", adminOnly: true },
  { key: "progress", label: "Progress" },
  { key: "work", label: "Work Done" },
  { key: "events", label: "Events" },
  { key: "achievements", label: "Achievements" },
  { key: "articles", label: "Tech Articles" },
  { key: "gallery", label: "Gallery" },
  { key: "photoUpload", label: "Photo Upload" },
  { key: "logout", label: "Logout" },
];

// --- Descriptions for Each Page ---
const DESCRIPTIONS = {
  home: `Welcome to the MPS Cyber Club! Engage with fellow tech enthusiasts and explore our projects, events, and achievements.`,
  members: `Admin View: Manage club members, their work, and photos.`,
  progress: `Track your progress and see others' advancement in the club.`,
  work: `List of work and projects submitted by members.`,
  events: `Upcoming events and workshops for MPS Cyber Club members.`,
  achievements: `Achievements and awards won by club members.`,
  articles: `Educational tech articles curated by the MPS Cyber Club.`,
  gallery: `Photos from club events and meetups.`,
  photoUpload: `Upload your photos here from club activities or projects.`,
};

// --- Local Storage Utility Functions ---
// These are now used to persist all application data in the browser's local storage.
const loadFromStorage = (key, defaultVal) => {
  try {
    const val = localStorage.getItem(key);
    if (val) return JSON.parse(val);
  } catch (e) {
    console.error(`Error loading '${key}' from localStorage:`, e);
  }
  return defaultVal;
};

const saveToStorage = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Error saving '${key}' to localStorage:`, e);
  }
};

// --- TOP-LEVEL COMPONENTS ---
// IMPORTANT: These components are defined outside of the main App component
// to ensure React Hook rules are followed (Hooks must be called unconditionally).

/**
 * Renders a customizable message box.
 * @param {object} props - The component props.
 * @param {'success'|'error'|'info'} props.type - The type of message (determines styling).
 * @param {string} props.text - The message content.
 * @param {function} props.onClose - Function to call when the message box is closed.
 */
function MessageBox({ type, text, onClose }) {
  return (
    <div className={`message-box ${type}`}>
      <p>{text}</p>
      <button onClick={onClose}>&times;</button>
    </div>
  );
}

/**
 * Renders a customizable confirmation dialog.
 * @param {object} props - The component props.
 * @param {string} props.text - The confirmation message.
 * @param {function} props.onConfirm - Function to call when 'Yes' is clicked.
 * @param {function} props.onCancel - Function to call when 'No' is clicked.
 */
function ConfirmBox({ text, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <p>{text}</p>
        <div className="confirm-actions">
          <button onClick={onConfirm} className="confirm-yes">Yes</button>
          <button onClick={onCancel} className="confirm-no">No</button>
        </div>
      </div>
    </div>
  );
}

/**
 * Renders the login page.
 * @param {object} props - The component props.
 * @param {function} props.handleLogin - Function to handle login submission.
 * @param {string} props.loginId - Current value of the login ID input.
 * @param {function} props.setLoginId - Setter for login ID.
 * @param {string} props.loginPass - Current value of the login password input.
 * @param {function} props.setLoginPass - Setter for login password.
 * @param {string} props.error - Error message to display.
 * @param {string} props.schoolPic - URL for the background image.
 */
function LoginPage({ handleLogin, loginId, setLoginId, loginPass, setLoginPass, error, schoolPic }) {
  return (
    <div className="login-page-container" style={{ backgroundImage: `url(${schoolPic})` }}>
      <div className="login-form-box">
        <h2>MPS Cyber Club Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="loginId">User ID:</label>
            <input
              id="loginId"
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="loginPass">Password:</label>
            <input
              id="loginPass"
              type="password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              required
              autoComplete="off" // Set to "off" to prevent browser autofill interference
            />
          </div>
          <button type="submit">Login</button>
        </form>
        {error && <p className="error-message">{error}</p>}
        
        {/* The section below showing Admin and Student IDs has been REMOVED as requested.
        <div className="login-info">
          <p>Admin ID: <b>admin</b>, Password: <b>admin123</b></p>
          <p>Student ID: <b>student1</b>, Password: <b>pass1</b></p>
        </div>
        */}
      </div>
    </div>
  );
}

/**
 * Renders the Home page content.
 * @param {object} props - The component props.
 * @param {object} props.user - The currently logged-in user object.
 * @param {object} props.DESCRIPTIONS - Object containing page descriptions.
 * @param {string|null} props.homePageImage - URL of the image to display on the home page.
 * @param {function} props.setHomePageImage - Setter for the homePageImage state.
 * @param {boolean} props.isAdmin - True if the current user is an admin.
 * @param {function} props.showMessage - Function to display a message.
 * @param {function} props.showConfirm - Function to display a confirmation.
 */
function Home({ user, DESCRIPTIONS, homePageImage, setHomePageImage, isAdmin, showMessage, showConfirm }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection for home page image
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, []);

  // Handle upload of home page image
  const handleUploadHomePageImage = useCallback(() => {
    if (!selectedFile) {
      showMessage('error', "Please select an image to upload.");
      return;
    }

    const MAX_FILE_SIZE_MB = 5;
    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      showMessage('error', `File size exceeds ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const url = event.target.result;
      setHomePageImage(url); // Update local state
      saveToStorage('homePageImage', url); // Save to local storage
      showMessage('success', "Home page image uploaded successfully!");
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear file input
      }
    };
    reader.onerror = () => {
      showMessage('error', "Failed to read file.");
    };
    reader.readAsDataURL(selectedFile);
  }, [selectedFile, setHomePageImage, showMessage]);

  // Handle removal of home page image
  const handleRemoveHomePageImage = useCallback(() => {
    showConfirm("Are you sure you want to remove the home page image?", () => {
      setHomePageImage(null); // Update local state
      localStorage.removeItem('homePageImage'); // Remove from local storage
      showMessage('success', "Home page image removed.");
    });
  }, [setHomePageImage, showMessage, showConfirm]);

  return (
    <div className="home-section">
      <h2>Home</h2>
      <p>{DESCRIPTIONS.home}</p>
      {user && <p>Welcome, <b>{user.name}</b> ({user.role})!</p>}
      {!user && <p>Please login to access club features.</p>}

      {/* Home Page Image Display */}
      {homePageImage && (
        <div className="home-page-image-container">
          <img src={homePageImage} alt="Home Page Banner" className="home-page-banner" />
          {isAdmin && (
            <button onClick={handleRemoveHomePageImage} className="delete-btn remove-home-image-btn">Remove Image</button>
          )}
        </div>
      )}

      {/* Admin-only Home Page Image Upload Section */}
      {isAdmin && (
        <div className="admin-section-card home-image-upload-card">
          <h3>{homePageImage ? "Change Home Page Image" : "Upload Home Page Image"}</h3>
          <div className="form-group">
            <label htmlFor="homePageImageFile">Select Image:</label>
            <input
              id="homePageImageFile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>
          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" style={{ maxWidth: 200, maxHeight: 150, borderRadius: 8, border: '1px solid #ddd' }} />
              <p style={{marginTop: '5px', fontSize: '0.9em', color: '#555'}}>New Image Preview</p>
            </div>
          )}
          <button onClick={handleUploadHomePageImage} disabled={!selectedFile}>
            {homePageImage ? "Update Image" : "Upload Image"}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Renders the Member Details page (Admin view).
 * Allows adding/deleting members and deleting photos.
 * @param {object} props - The component props.
 * @param {boolean} props.isAdmin - True if the current user is an admin.
 * @param {Array<object>} props.users - Array of user objects.
 * @param {function} props.setUsers - Setter for users state.
 * @param {Array<object>} props.work - Array of work objects.
 * @param {function} props.setWork - Setter for work state.
 * @param {Array<object>} props.photos - Array of photo objects.
 * @param {function} props.setPhotos - Setter for photos state.
 * @param {function} props.showMessage - Function to display a message.
 * @param {function} props.showConfirm - Function to display a confirmation.
 * @param {object} props.DESCRIPTIONS - Object containing page descriptions.
 */
function MemberDetails({ isAdmin, users, setUsers, work, setWork, photos, setPhotos, showMessage, showConfirm, DESCRIPTIONS }) {
  const [newMemberId, setNewMemberId] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPass, setNewMemberPass] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member");
  const [addMemberMsg, setAddMemberMsg] = useState("");

  // Callback to delete a user and their associated data
  const deleteUser = useCallback((id) => {
    if (id === "admin") {
      showMessage('error', "Cannot delete the default admin user!");
      return;
    }
    showConfirm(`Are you sure you want to delete user "${id}" and all their associated data (work, photos)?`, () => {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== id));
      setWork(prevWork => prevWork.filter(w => w.userId !== id));
      setPhotos(prevPhotos => prevPhotos.filter(p => p.userId !== id));
      showMessage('success', `User "${id}" and their data deleted.`);
    });
  }, [users, work, photos, setUsers, setWork, setPhotos, showMessage, showConfirm]);

  // Callback to delete a photo
  const deletePhoto = useCallback((photoId, userId) => {
    showConfirm("Are you sure you want to delete this photo?", () => {
      setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photoId));
      showMessage('success', "Photo deleted.");
    });
  }, [setPhotos, showMessage, showConfirm]);

  // Callback to handle adding a new member
  const handleAddMember = useCallback((e) => {
    e.preventDefault();
    if (!newMemberId.trim() || !newMemberName.trim() || !newMemberPass.trim()) {
      setAddMemberMsg("All fields are required.");
      return;
    }
    if (users.some(u => u.id === newMemberId.trim())) {
      setAddMemberMsg(`User ID "${newMemberId}" already exists.`);
      return;
    }

    const newUser = {
      id: newMemberId.trim(),
      password: newMemberPass.trim(),
      name: newMemberName.trim(),
      progress: 0,
      role: newMemberRole,
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    setAddMemberMsg(`New member "${newMemberName}" (${newMemberId}) added successfully!`);

    setNewMemberId("");
    setNewMemberName("");
    setNewMemberPass("");
    setNewMemberRole("member");
  }, [newMemberId, newMemberName, newMemberPass, newMemberRole, users, setUsers]);

  // If not admin, show access denied (this check is now after all hooks)
  if (!isAdmin) return <div><h2>Access Denied</h2><p>Only admins can view this page.</p></div>;

  return (
    <div className="member-details-page">
      <h2>Member Details</h2>
      <p>{DESCRIPTIONS.members}</p>

      <h3 style={{marginTop: '25px'}}>Add New Member</h3>
      <form onSubmit={handleAddMember} className="add-member-form">
        <div className="form-group">
          <label htmlFor="newMemberId">User ID:</label>
          <input
            id="newMemberId"
            type="text"
            value={newMemberId}
            onChange={(e) => setNewMemberId(e.target.value)}
            placeholder="e.g., newstudent"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="newMemberName">Name:</label>
          <input
            id="newMemberName"
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="e.g., New Student"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="newMemberPass">Password:</label>
          <input
            id="newMemberPass"
            type="password"
            value={newMemberPass}
            onChange={(e) => setNewMemberPass(e.target.value)}
            placeholder="e.g., securepass"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="newMemberRole">Role:</label>
          <select
            id="newMemberRole"
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value)}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Add Member</button>
        {addMemberMsg && <p className="form-message" style={{ color: addMemberMsg.includes('success') ? "green" : "red" }}>{addMemberMsg}</p>}
      </form>

      <h3 style={{marginTop: '40px'}}>All Club Members</h3>
      <table className="members-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Progress %</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.progress}</td>
              <td>{u.role}</td>
              <td>
                {u.id !== "admin" && <button className="delete-btn" onClick={() => deleteUser(u.id)}>Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{marginTop: '40px'}}>Photos Uploaded by Members</h3>
      <div className="photo-display">
        {photos.length === 0 ? <p>No photos uploaded yet by any member.</p> : (
          photos.map((p) => (
            <div key={p.id} className="photo-item">
              <img src={p.url} alt={p.title} />
              <p><b>{p.title}</b></p>
              <p>By: {users.find(u => u.id === p.userId)?.name || p.userId}</p>
              {/* Pass userId to deletePhoto for correct Firestore path */}
              <button className="delete-btn" onClick={() => deletePhoto(p.id, p.userId)}>Delete Photo</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Renders the Progress tracking page.
 * Allows admins to edit member progress.
 * @param {object} props - The component props.
 * @param {boolean} props.isAdmin - True if the current user is an admin.
 * @param {Array<object>} props.users - Array of user objects.
 * @param {function} props.setUsers - Setter for users state.
 * @param {object} props.DESCRIPTIONS - Object containing page descriptions.
 * @param {function} props.showMessage - Function to display a message.
 */
function Progress({ isAdmin, users, setUsers, DESCRIPTIONS, showMessage }) {
  const [editProgressId, setEditProgressId] = useState(null);
  const [newProgressValue, setNewProgressValue] = useState(0);

  // Callback to update a member's progress
  const updateProgress = useCallback((userId, newProgress) => {
    if (newProgress < 0 || newProgress > 100 || isNaN(newProgress)) {
      showMessage('error', "Progress must be a number between 0 and 100.");
      return;
    }
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === userId ? { ...u, progress: parseInt(newProgress) } : u
      )
    );
    showMessage('success', `Progress for ${users.find(u => u.id === userId)?.name || userId} updated.`);
    setEditProgressId(null);
  }, [users, setUsers, showMessage]);

  return (
    <div className="progress-section">
      <h2>Progress</h2>
      <p>{DESCRIPTIONS.progress}</p>
      <table className="progress-table">
        <thead>
          <tr>
            <th>Member</th>
            <th>Progress %</th>
            {isAdmin && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>
                {isAdmin && editProgressId === u.id ? (
                  <input
                    type="number"
                    value={newProgressValue}
                    onChange={(e) => setNewProgressValue(parseInt(e.target.value))}
                    min="0"
                    max="100"
                    className="progress-input"
                  />
                ) : (
                  u.progress
                )}
              </td>
              {isAdmin && (
                <td>
                  {editProgressId === u.id ? (
                    <>
                      <button onClick={() => updateProgress(u.id, newProgressValue)} className="save-btn">Save</button>
                      <button onClick={() => setEditProgressId(null)} className="cancel-btn">Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => { setEditProgressId(u.id); setNewProgressValue(u.progress); }} className="edit-btn">Edit</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Renders the Work Done page.
 * Allows admins to add, edit, and delete work entries.
 * @param {object} props - The component props.
 * @param {boolean} props.isAdmin - True if the current user is an admin.
 * @param {object} props.user - The currently logged-in user object.
 * @param {Array<object>} props.users - Array of user objects.
 * @param {Array<object>} props.work - Array of work objects.
 * @param {function} props.setWork - Setter for work state.
 * @param {object} props.DESCRIPTIONS - Object containing page descriptions.
 * @param {function} props.showMessage - Function to display a message.
 * @param {function} props.showConfirm - Function to display a confirmation.
 */
function Work({ isAdmin, user, users, work, setWork, DESCRIPTIONS, showMessage, showConfirm }) {
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [addWorkMsg, setAddWorkMsg] = useState('');

  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkDescription, setNewWorkDescription] = useState('');
  const [newWorkDate, setNewWorkDate] = useState('');
  const [newWorkImageUrl, setNewWorkImageUrl] = useState('');
  const [newWorkUserId, setNewWorkUserId] = useState(user?.id || '');

  // Set default new work user ID to current user if logged in
  useEffect(() => {
      if (user) setNewWorkUserId(user.id);
  }, [user]);

  // Callback to start editing a work item
  const startEdit = useCallback((workItem) => {
      setEditingWorkId(workItem.id);
      setEditTitle(workItem.title);
      setEditDescription(workItem.description);
      setEditDate(workItem.date);
      setEditImageUrl(workItem.imageUrl || '');
      setAddWorkMsg('');
  }, []);

  // Callback to save edited work item
  const saveEdit = useCallback((id) => {
      if (!editTitle.trim() || !editDescription.trim() || !editDate.trim()) {
          setAddWorkMsg('Title, description, and date cannot be empty.');
          return;
      }
      setWork(prevWork =>
        prevWork.map(item =>
          item.id === id
            ? { ...item, title: editTitle.trim(), description: editDescription.trim(), date: editDate, imageUrl: editImageUrl.trim() }
            : item
        )
      );
      setEditingWorkId(null);
      showMessage('success', 'Work updated successfully!');
  }, [editTitle, editDescription, editDate, editImageUrl, setWork, showMessage]);

  // Callback to delete a work item
  const deleteWork = useCallback((id) => {
      showConfirm("Are you sure you want to delete this work entry?", () => {
          setWork(prevWork => prevWork.filter(item => item.id !== id));
          showMessage('success', "Work entry deleted.");
      });
  }, [setWork, showMessage, showConfirm]);

  // Callback to handle adding a new work item
  const handleAddWork = useCallback((e) => {
      e.preventDefault();
      if (!newWorkTitle.trim() || !newWorkDescription.trim() || !newWorkDate.trim() || !newWorkUserId.trim()) {
          setAddWorkMsg("All fields (Title, Description, Date, User) are required.");
          return;
      }
      if (!users.some(u => u.id === newWorkUserId)) {
          setAddWorkMsg("Invalid User ID. Please select an existing member.");
          return;
      }

      const newWorkItem = {
          id: work.length > 0 ? Math.max(...work.map(item => item.id)) + 1 : 1, // Simple ID generation
          userId: newWorkUserId,
          title: newWorkTitle.trim(),
          description: newWorkDescription.trim(),
          date: newWorkDate,
          imageUrl: newWorkImageUrl.trim() || "https://placehold.co/300x200/CCCCCC/000000?text=No+Image",
      };
      setWork(prevWork => [...prevWork, newWorkItem]);
      showMessage('success', `Work "${newWorkTitle}" added successfully!`);

      setNewWorkTitle('');
      setNewWorkDescription('');
      setNewWorkDate('');
      setNewWorkImageUrl('');
      setNewWorkUserId(user?.id || '');
      setAddWorkMsg('');
  }, [newWorkTitle, newWorkDescription, newWorkDate, newWorkImageUrl, newWorkUserId, work, users, setWork, showMessage, user]);


  return (
    <div className="work-section">
      <h2>Work Done</h2>
      <p>{DESCRIPTIONS.work}</p>

      {isAdmin && (
          <div className="admin-section-card">
              <h3>Add New Work Entry</h3>
              <form onSubmit={handleAddWork} className="add-form">
                  <div className="form-group">
                      <label htmlFor="newWorkTitle">Title:</label>
                      <input type="text" id="newWorkTitle" value={newWorkTitle} onChange={(e) => setNewWorkTitle(e.target.value)} required />
                  </div>
                  <div className="form-group">
                      <label htmlFor="newWorkDescription">Description:</label>
                      <textarea id="newWorkDescription" value={newWorkDescription} onChange={(e) => setNewWorkDescription(e.target.value)} required />
                  </div>
                  <div className="form-group">
                      <label htmlFor="newWorkDate">Date:</label>
                      <input type="date" id="newWorkDate" value={newWorkDate} onChange={(e) => setNewWorkDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                      <label htmlFor="newWorkImageUrl">Image URL (Optional):</label>
                      <input type="text" id="newWorkImageUrl" value={newWorkImageUrl} onChange={(e) => setNewWorkImageUrl(e.target.value)} placeholder="e.g., https://example.com/image.jpg" />
                  </div>
                  <div className="form-group">
                      <label htmlFor="newWorkUserId">Member:</label>
                      <select id="newWorkUserId" value={newWorkUserId} onChange={(e) => setNewWorkUserId(e.target.value)} required>
                          <option value="">Select Member</option>
                          {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.id})</option>)}
                      </select>
                  </div>
                  <button type="submit">Add Work</button>
                  {addWorkMsg && <p className="form-message" style={{ color: addWorkMsg.includes('success') ? "green" : "red" }}>{addWorkMsg}</p>}
              </form>
          </div>
      )}

      {work.length === 0 ? <p>No work submitted yet.</p> : (
        <div className="work-grid">
          {work.map(w => {
            const author = users.find(u => u.id === w.userId);
            return (
              <div key={w.id} className="work-item-card">
                {editingWorkId === w.id ? (
                  <div className="work-edit-form">
                      <h3>Edit Work</h3>
                      <div className="form-group">
                          <label>Title:</label>
                          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                      </div>
                      <div className="form-group">
                          <label>Description:</label>
                          <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required />
                      </div>
                      <div className="form-group">
                          <label>Date:</label>
                          <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
                      </div>
                      <div className="form-group">
                          <label>Image URL:</label>
                          <input type="text" value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} placeholder="Optional image URL" />
                      </div>
                      {addWorkMsg && <p className="form-message" style={{ color: addWorkMsg.includes('successfully') ? 'green' : 'red' }}>{addWorkMsg}</p>}
                      <button onClick={() => saveEdit(w.id)}>Save</button>
                      <button onClick={() => setEditingWorkId(null)} className="cancel-btn">Cancel</button>
                  </div>
                ) : (
                  <>
                      {w.imageUrl && <img src={w.imageUrl} alt={w.title} className="work-screenshot" />}
                      <h3>{w.title}</h3>
                      <p><b>Date:</b> {w.date}</p>
                      <p><b>Description:</b> {w.description}</p>
                      <p><b>By:</b> {author?.name || w.userId}</p>
                      {isAdmin && (
                          <div className="work-actions">
                              <button onClick={() => startEdit(w)} className="edit-btn">Edit</button>
                              <button onClick={() => deleteWork(w.id)} className="delete-btn">Delete</button>
                          </div>
                      )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Renders the Events page.
 * Allows admins to add, edit, and delete events.
 * @param {object} props - The component props.
 * @param {boolean} props.isAdmin - True if the current user is an admin.
 * @param {Array<object>} props.events - Array of event objects.
 * @param {function} props.setEvents - Setter for events state.
 * @param {object} props.DESCRIPTIONS - Object containing page descriptions.
 * @param {function} props.showMessage - Function to display a message.
 * @param {function} props.showConfirm - Function to display a confirmation.
 */
function Events({ isAdmin, events, setEvents, DESCRIPTIONS, showMessage, showConfirm }) {
  const [editingEventId, setEditingEventId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [addEventMsg, setAddEventMsg] = useState('');

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');

  // Callback to start editing an event
  const startEdit = useCallback((eventItem) => {
      setEditingEventId(eventItem.id);
      setEditTitle(eventItem.title);
      setEditDate(eventItem.date);
      setEditDescription(eventItem.description);
      setAddEventMsg('');
  }, []);

  // Callback to save edited event
  const saveEdit = useCallback((id) => {
      if (!editTitle.trim() || !editDate.trim() || !editDescription.trim()) {
          setAddEventMsg('All fields are required.');
          return;
      }
      setEvents(prevEvents =>
        prevEvents.map(item =>
          item.id === id
            ? { ...item, title: editTitle.trim(), date: editDate, description: editDescription.trim() }
            : item
        )
      );
      setEditingEventId(null);
      showMessage('success', 'Event updated successfully!');
  }, [editTitle, editDate, editDescription, setEvents, showMessage]);

  // Callback to delete an event
  const deleteEvent = useCallback((id) => {
      showConfirm("Are you sure you want to delete this event?", () => {
          setEvents(prevEvents => prevEvents.filter(item => item.id !== id));
          showMessage('success', "Event deleted.");
      });
  }, [setEvents, showMessage, showConfirm]);

  // Callback to handle adding a new event
  const handleAddEvent = useCallback((e) => {
      e.preventDefault();
      if (!newEventTitle.trim() || !newEventDate.trim() || !newEventDescription.trim()) {
          setAddEventMsg("All fields are required.");
          return;
      }
      const newEventItem = {
          id: events.length > 0 ? Math.max(...events.map(item => item.id)) + 1 : 1, // Simple ID generation
          title: newEventTitle.trim(),
          date: newEventDate,
          description: newEventDescription.trim(),
      };
      setEvents(prevEvents => [...prevEvents, newEventItem]);
      showMessage('success', `Event "${newEventTitle}" added successfully!`);
      setNewEventTitle('');
      setNewEventDate('');
      setNewEventDescription('');
      setAddEventMsg('');
  }, [newEventTitle, newEventDate, newEventDescription, events, setEvents, showMessage]);

  return (
    <div className="events-section">
      <h2>Events</h2>
      <p>{DESCRIPTIONS.events}</p>

      {isAdmin && (
          <div className="admin-section-card">
              <h3>Add New Event</h3>
              <form onSubmit={handleAddEvent} className="add-form">
                  <div className="form-group">
                      <label htmlFor="newEventTitle">Title:</label>
                      <input type="text" id="newEventTitle" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} required />
                  </div>
                  <div className="form-group">
                      <label htmlFor="newEventDate">Date:</label>
                      <input type="date" id="newEventDate" value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                      <label htmlFor="newEventDescription">Description:</label>
                      <textarea id="newEventDescription" value={newEventDescription} onChange={(e) => setNewEventDescription(e.target.value)} required />
                  </div>
                  <button type="submit">Add Event</button>
                  {addEventMsg && <p className="form-message" style={{ color: addEventMsg.includes('success') ? "green" : "red" }}>{addEventMsg}</p>}
              </form>
          </div>
      )}

      {events.length === 0 ? <p>No upcoming events.</p> : (
        <ul className="event-list">
          {events.map(e => (
            <li key={e.id} className="event-item">
              {editingEventId === e.id ? (
                  <div className="event-edit-form">
                      <h3>Edit Event</h3>
                      <div className="form-group">
                          <label>Title:</label>
                          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                      </div>
                      <div className="form-group">
                          <label>Date:</label>
                          <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
                      </div>
                      <div className="form-group">
                          <label>Description:</label>
                          <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required />
                      </div>
                      {addEventMsg && <p className="form-message" style={{ color: addEventMsg.includes('success') ? 'green' : 'red' }}>{addEventMsg}</p>}
                      <button onClick={() => saveEdit(e.id)}>Save</button>
                      <button onClick={() => setEditingEventId(null)} className="cancel-btn">Cancel</button>
                  </div>
              ) : (
                  <>
                      <b>{e.title}</b> on {e.date}: {e.description}
                      {isAdmin && (
                          <div className="item-actions">
                              <button onClick={() => startEdit(e)} className="edit-btn">Edit</button>
                              <button onClick={() => deleteEvent(e.id)} className="delete-btn">Delete</button>
                          </div>
                      )}
                  </>
                )}
              </li>
            ))}
          </ul>
      )}
    </div>
  );
}

/**
 * Renders the Achievements page.
 * Allows admins to add, edit, and delete achievements.
 * @param {object} props - The component props.
 * @param {boolean} props.isAdmin - True if the current user is an admin.
 * @param {Array<object>} props.achievements - Array of achievement objects.
 * @param {function} props.setAchievements - Setter for achievements state.
 * @param {object} props.DESCRIPTIONS - Object containing page descriptions.
 * @param {function} props.showMessage - Function to display a message.
 * @param {function} props.showConfirm - Function to display a confirmation.
 */
function Achievements({ isAdmin, achievements, setAchievements, DESCRIPTIONS, showMessage, showConfirm }) {
  const [editingAchievementId, setEditingAchievementId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [addAchievementMsg, setAddAchievementMsg] = useState('');

  const [newAchievementTitle, setNewAchievementTitle] = useState('');
  const [newAchievementYear, setNewAchievementYear] = useState('');
  const [newAchievementDescription, setNewAchievementDescription] = useState('');

  // Callback to start editing an achievement
  const startEdit = useCallback((achievementItem) => {
      setEditingAchievementId(achievementItem.id);
      setEditTitle(achievementItem.title);
      setEditYear(achievementItem.year);
      setEditDescription(achievementItem.description || '');
      setAddAchievementMsg('');
  }, []);

  // Callback to save edited achievement
  const saveEdit = useCallback((id) => {
      if (!editTitle.trim() || !editYear || !editDescription.trim()) {
          setAddAchievementMsg('All fields are required.');
          return;
      }
      setAchievements(prevAchievements =>
        prevAchievements.map(item =>
          item.id === id
            ? { ...item, title: editTitle.trim(), year: parseInt(editYear), description: editDescription.trim() }
            : item
        )
      );
      setEditingAchievementId(null);
      showMessage('success', 'Achievement updated successfully!');
  }, [editTitle, editYear, editDescription, setAchievements, showMessage]);

  // Callback to delete an achievement
  const deleteAchievement = useCallback((id) => {
      showConfirm("Are you sure you want to delete this achievement?", () => {
          setAchievements(prevAchievements => prevAchievements.filter(item => item.id !== id));
          showMessage('success', "Achievement deleted.");
      });
  }, [setAchievements, showMessage, showConfirm]);

  // Callback to handle adding a new achievement
  const handleAddAchievement = useCallback((e) => {
      e.preventDefault();
      if (!newAchievementTitle.trim() || !newAchievementYear || !newAchievementDescription.trim()) {
          setAddAchievementMsg("All fields are required.");
          return;
      }
      const newAchievementItem = {
          id: achievements.length > 0 ? Math.max(...achievements.map(item => item.id)) + 1 : 1, // Simple ID generation
          title: newAchievementTitle.trim(),
          year: parseInt(newAchievementYear),
          description: newAchievementDescription.trim(),
      };
      setAchievements(prevAchievements => [...prevAchievements, newAchievementItem]);
      showMessage('success', `Achievement "${newAchievementTitle}" added successfully!`);
      setNewAchievementTitle('');
      setNewAchievementYear('');
      setNewAchievementDescription('');
      setAddAchievementMsg('');
  }, [newAchievementTitle, newAchievementYear, newAchievementDescription, achievements, setAchievements, showMessage]);

  return (
    <div className="achievements-section">
      <h2>Achievements</h2>
      <p>{DESCRIPTIONS.achievements}</p>

      {isAdmin && (
          <div className="admin-section-card">
              <h3>Add New Achievement</h3>
              <form onSubmit={handleAddAchievement} className="add-form">
                  <div className="form-group">
                      <label htmlFor="newAchievementTitle">Title:</label>
                      <input type="text" id="newAchievementTitle" value={newAchievementTitle} onChange={(e) => setNewAchievementTitle(e.target.value)} required />
                  </div>
                  <div className="form-group">
                      <label htmlFor="newAchievementYear">Year:</label>
                      <input type="number" id="newAchievementYear" value={newAchievementYear} onChange={(e) => setNewAchievementYear(e.target.value)} required min="1900" max="2100" />
                  </div>
                  <div className="form-group">
                      <label htmlFor="newAchievementDescription">Description:</label>
                      <textarea id="newAchievementDescription" value={newAchievementDescription} onChange={(e) => setNewAchievementDescription(e.target.value)} required />
                  </div>
                  <button type="submit">Add Achievement</button>
                  {addAchievementMsg && <p className="form-message" style={{ color: addAchievementMsg.includes('success') ? "green" : "red" }}>{addAchievementMsg}</p>}
              </form>
          </div>
      )}

      {achievements.length === 0 ? <p>No achievements to display yet.</p> : (
          <ul className="achievement-list">
            {achievements.map(a => (
              <li key={a.id} className="achievement-item">
                {editingAchievementId === a.id ? (
                    <div className="achievement-edit-form">
                        <h3>Edit Achievement</h3>
                        <div className="form-group">
                            <label>Title:</label>
                            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Year:</label>
                            <input type="number" value={editYear} onChange={(e) => setEditYear(e.target.value)} required min="1900" max="2100" />
                        </div>
                        <div className="form-group">
                            <label>Description:</label>
                            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required />
                        </div>
                        {addAchievementMsg && <p className="form-message" style={{ color: addAchievementMsg.includes('success') ? 'green' : 'red' }}>{addAchievementMsg}</p>}
                        <button onClick={() => saveEdit(a.id)}>Save</button>
                        <button onClick={() => setEditingAchievementId(null)} className="cancel-btn">Cancel</button>
                    </div>
                ) : (
                    <>
                        <b>{a.title}</b> ({a.year}) - {a.description}
                        {isAdmin && (
                            <div className="item-actions">
                                <button onClick={() => startEdit(a)} className="edit-btn">Edit</button>
                                <button onClick={() => deleteAchievement(a.id)} className="delete-btn">Delete</button>
                            </div>
                        )}
                    </>
                )}
              </li>
            ))}
          </ul>
      )}
    </div>
  );
}

/**
 * Renders the Tech Articles page.
 * Allows admins to add, edit, and delete articles.
 * @param {object} props - The component props.
 * @param {boolean} props.isAdmin - True if the current user is an admin.
 * @param {Array<object>} props.articles - Array of article objects.
 * @param {function} props.setArticles - Setter for articles state.
 * @param {object} props.DESCRIPTIONS - Object containing page descriptions.
 * @param {function} props.showMessage - Function to display a message.
 * @param {function} props.showConfirm - Function to display a confirmation.
 * @param {object} props.user - The currently logged-in user object.
 */
function Articles({ isAdmin, articles, setArticles, DESCRIPTIONS, showMessage, showConfirm, user }) {
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editDate, setEditDate] = useState('');
  const [addArticleMsg, setAddArticleMsg] = useState('');

  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleContent, setNewArticleContent] = useState('');
  const [newArticleAuthor, setNewArticleAuthor] = useState(user?.name || '');
  const [newArticleDate, setNewArticleDate] = useState('');

  // Set default new article author to current user's name if logged in
  useEffect(() => {
      if (user) setNewArticleAuthor(user.name);
  }, [user]);

  // Callback to start editing an article
  const startEdit = useCallback((articleItem) => {
      setEditingArticleId(articleItem.id);
      setEditTitle(articleItem.title);
      setEditContent(articleItem.content);
      setEditAuthor(articleItem.author);
      setEditDate(articleItem.date);
      setAddArticleMsg('');
  }, []);

  // Callback to save edited article
  const saveEdit = useCallback((id) => {
      if (!editTitle.trim() || !editContent.trim() || !editAuthor.trim() || !editDate.trim()) {
          setAddArticleMsg('All fields are required.');
          return;
      }
      setArticles(prevArticles =>
        prevArticles.map(item =>
          item.id === id
            ? { ...item, title: editTitle.trim(), content: editContent.trim(), author: editAuthor.trim(), date: editDate }
            : item
        )
      );
      setEditingArticleId(null);
      showMessage('success', 'Article updated successfully!');
  }, [editTitle, editContent, editAuthor, editDate, setArticles, showMessage]);

  // Callback to delete an article
  const deleteArticle = useCallback((id) => {
      showConfirm("Are you sure you want to delete this article?", () => {
          setArticles(prevArticles => prevArticles.filter(item => item.id !== id));
          showMessage('success', "Article deleted.");
      });
  }, [setArticles, showMessage, showConfirm]);

  // Callback to handle adding a new article
  const handleAddArticle = useCallback((e) => {
      e.preventDefault();
      if (!newArticleTitle.trim() || !newArticleContent.trim() || !newArticleAuthor.trim() || !newArticleDate.trim()) {
          setAddArticleMsg("All fields are required.");
          return;
      }
      const newArticleItem = {
          id: articles.length > 0 ? Math.max(...articles.map(item => item.id)) + 1 : 1, // Simple ID generation
          title: newArticleTitle.trim(),
          content: newArticleContent.trim(),
          author: newArticleAuthor.trim(),
          date: newArticleDate,
      };
      setArticles(prevArticles => [...prevArticles, newArticleItem]);
      showMessage('success', `Article "${newArticleTitle}" added successfully!`);
      setNewArticleTitle('');
      setNewArticleContent('');
      setNewArticleAuthor(user?.name || '');
      setNewArticleDate('');
      setAddArticleMsg('');
  }, [newArticleTitle, newArticleContent, newArticleAuthor, newArticleDate, articles, setArticles, showMessage, user]);

  return (
    <div className="articles-section">
      <h2>Tech Articles</h2>
      <p>{DESCRIPTIONS.articles}</p>

      {isAdmin && (
          <div className="admin-section-card">
              <h3>Add New Article</h3>
              <form onSubmit={handleAddArticle} className="add-form">
                  <div className="form-group">
                      <label htmlFor="newArticleTitle">Title:</label>
                      <input type="text" id="newArticleTitle" value={newArticleTitle} onChange={(e) => setNewArticleTitle(e.target.value)} required />
                  </div>
                  <div className="form-group">
                      <label htmlFor="newArticleContent">Content:</label>
                      <textarea id="newArticleContent" value={newArticleContent} onChange={(e) => setNewArticleContent(e.target.value)} required />
                  </div>
                  <div className="form-group">
                      <label htmlFor="newArticleAuthor">Author:</label>
                      <input type="text" value={newArticleAuthor} onChange={(e) => setNewArticleAuthor(e.target.value)} required />
                  </div>
                  <div className="form-group">
                      <label htmlFor="newArticleDate">Date:</label>
                      <input type="date" value={newArticleDate} onChange={(e) => setNewArticleDate(e.target.value)} required />
                  </div>
                  <button type="submit">Add Article</button>
                  {addArticleMsg && <p className="form-message" style={{ color: addArticleMsg.includes('success') ? "green" : "red" }}>{addArticleMsg}</p>}
              </form>
          </div>
      )}

      {articles.length === 0 ? <p>No articles available yet.</p> : (
          <div className="articles-grid">
              {articles.map(a => (
                  <article key={a.id} className="article-item-card">
                      {editingArticleId === a.id ? (
                          <div className="article-edit-form">
                              <h3>Edit Article</h3>
                              <div className="form-group">
                                  <label>Title:</label>
                                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                              </div>
                              <div className="form-group">
                                  <label>Content:</label>
                                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} required />
                              </div>
                              <div className="form-group">
                                  <label>Author:</label>
                                  <input type="text" value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} required />
                              </div>
                              <div className="form-group">
                                  <label>Date:</label>
                                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
                              </div>
                              {addArticleMsg && <p className="form-message" style={{ color: addArticleMsg.includes('success') ? 'green' : 'red' }}>{addArticleMsg}</p>}
                              <button onClick={() => saveEdit(a.id)}>Save</button>
                              <button onClick={() => setEditingArticleId(null)} className="cancel-btn">Cancel</button>
                          </div>
                      ) : (
                          <>
                              <h3>{a.title}</h3>
                              <p className="article-meta">By: {a.author} | Date: {a.date}</p>
                              <p>{a.content}</p>
                              {isAdmin && (
                                  <div className="item-actions">
                                      <button onClick={() => startEdit(a)} className="edit-btn">Edit</button>
                                      <button onClick={() => deleteArticle(a.id)} className="delete-btn">Delete</button>
                                  </div>
                              )}
                          </>
                      )}
                  </article>
              ))}
          </div>
      )}
    </div>
  );
}

/**
 * Renders the Gallery page.
 * Displays uploaded photos.
 * @param {object} props - The component props.
 * @param {Array<object>} props.photos - Array of photo objects.
 * @param {Array<object>} props.users - Array of user objects (for photo attribution).
 * @param {object} props.DESCRIPTIONS - Object containing page descriptions.
 */
function Gallery({ photos, users, DESCRIPTIONS }) {
  return (
    <div className="gallery-section">
      <h2>Gallery</h2>
      <p>{DESCRIPTIONS.gallery}</p>
      {photos.length === 0 ? <p>No photos to display in the gallery.</p> : (
        <div className="photo-display">
          {photos.map(p => (
            <img key={p.id} src={p.url} alt={p.title} title={p.title + " by " + (users.find(u => u.id === p.userId)?.name || p.userId)} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Renders the Photo Upload page.
 * Allows users to upload photos.
 * @param {object} props - The component props.
 * @param {object} props.user - The currently logged-in user object.
 * @param {Array<object>} props.photos - Array of photo objects.
 * @param {function} props.setPhotos - Setter for photos state.
 * @param {function} props.showMessage - Function to display a message.
 * @param {object} props.DESCRIPTIONS - Object containing page descriptions.
 * @param {Array<object>} props.users - Array of user objects (for photo attribution).
 */
function PhotoUpload({ user, photos, setPhotos, showMessage, DESCRIPTIONS, users }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState("");
  const fileInputRef = useRef(null);

  // Handles file selection and preview generation
  const onFileChange = useCallback((e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      // Set title to filename if not already set
      if (!title) setTitle(f.name.split('.')[0]);
      setPreview(URL.createObjectURL(f));
    } else {
      setFile(null);
      setPreview(null);
      if(!title) setTitle("");
    }
    setMsg("");
  }, [title]);

  // Handles photo upload submission
  const onUpload = useCallback((e) => {
    e.preventDefault();
    if (!user) {
      showMessage('error', "Please log in to upload photos.");
      return;
    }
    if (!file || !title.trim()) {
      showMessage('error', "Please select an image file and enter a title.");
      return;
    }

    const MAX_FILE_SIZE_MB = 5;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      showMessage('error', `File size exceeds ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setMsg("Uploading photo...");

    const reader = new FileReader();
    reader.onload = function (event) {
      const url = event.target.result;
      const newPhoto = {
        id: photos.length > 0 ? Math.max(...photos.map(p => p.id)) + 1 : 1, // Simple ID generation
        userId: user.id, // Associate photo with the current user
        title: title.trim(),
        url,
        timestamp: Date.now() // Add a timestamp for potential sorting
      };
      setPhotos(prevPhotos => [...prevPhotos, newPhoto]);
      showMessage('success', "Photo uploaded successfully!");
      setFile(null);
      setPreview(null);
      setTitle("");
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear file input
      }
    };
    reader.onerror = () => {
      setMsg("Failed to read file.");
    };
    reader.readAsDataURL(file); // Read file as Data URL (base64)
  }, [user, file, title, photos, setPhotos, showMessage]);

  if (!user) {
    return (
      <div className="photo-upload-section">
        <h2>Photo Upload</h2>
        <p>Please log in to upload photos.</p>
      </div>
    );
  }

  return (
    <div className="photo-upload-section">
      <h2>Photo Upload</h2>
      <p>{DESCRIPTIONS.photoUpload}</p>
      <form onSubmit={onUpload} className="photo-upload-form">
        <div className="form-group">
          <label htmlFor="photoTitle">Photo Title:</label>
          <input
            id="photoTitle"
            type="text"
            placeholder="Enter photo title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="photoFile">Select Image:</label>
          <input
            id="photoFile"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            ref={fileInputRef}
            required
          />
        </div>
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" style={{ maxWidth: 200, maxHeight: 150, borderRadius: 8, border: '1px solid #ddd' }} />
            <p style={{marginTop: '5px', fontSize: '0.9em', color: '#555'}}>New Image Preview</p>
          </div>
        )}
        <button type="submit">Upload Photo</button>
      </form>
      {msg && <p className="form-message" style={{ color: msg.includes('success') ? "green" : "red", marginTop: '15px' }}>{msg}</p>}
    </div>
  );
}


// --- Main App Component ---
/**
 * The main application component for the MPS Cyber Club portal.
 * Manages global state, routing, and authentication.
 */
export default function App() {
  // --- State Management for Application Data ---
  // These states are now populated from local storage or initial data.
  const [users, setUsers] = useState(() => loadFromStorage('users', INITIAL_USERS));
  const [work, setWork] = useState(() => loadFromStorage('work', INITIAL_WORK));
  const [events, setEvents] = useState(() => loadFromStorage('events', INITIAL_EVENTS));
  const [achievements, setAchievements] = useState(() => loadFromStorage('achievements', INITIAL_ACHIEVEMENTS));
  const [articles, setArticles] = useState(() => loadFromStorage('articles', INITIAL_ARTICLES));
  const [photos, setPhotos] = useState(() => loadFromStorage('photos', INITIAL_PHOTOS));
  const [homePageImage, setHomePageImage] = useState(() => loadFromStorage('homePageImage', null));

  // --- UI and Authentication States ---
  const [user, setUser] = useState(null); // Currently logged-in user object
  const [loginId, setLoginId] = useState(""); // Input for login ID
  const [loginPass, setLoginPass] = useState(""); // Input for login password
  const [loginError, setLoginError] = useState(""); // Login error message
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar visibility
  const [currentPage, setCurrentPage] = useState("home"); // Current active page for navigation

  // State for custom message/confirm modals
  const [message, setMessage] = useState(null); // { type: 'success'|'error'|'info', text: '...' }
  const [confirm, setConfirm] = useState(null); // { text: '...', onConfirm: fn, onCancel: fn }

  // --- Custom Message/Confirm Modals ---
  // Defined here so they are available immediately and stable.
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    const timer = setTimeout(() => {
      setMessage(null);
    }, 5000); // Message disappears after 5 seconds
    return () => clearTimeout(timer); // Cleanup on unmount/re-render
  }, []);

  const showConfirm = useCallback((text, onConfirmCallback, onCancelCallback = () => {}) => {
    setConfirm({
      text,
      onConfirm: () => {
        onConfirmCallback();
        setConfirm(null);
      },
      onCancel: () => {
        onCancelCallback();
        setConfirm(null);
      },
    });
  }, []);

  // --- Persist data to Local Storage whenever state changes ---
  useEffect(() => {
    saveToStorage('users', users);
  }, [users]);

  useEffect(() => {
    saveToStorage('work', work);
  }, [work]);

  useEffect(() => {
    saveToStorage('events', events);
  }, [events]);

  useEffect(() => {
    saveToStorage('achievements', achievements);
  }, [achievements]);

  useEffect(() => {
    saveToStorage('articles', articles);
  }, [articles]);

  useEffect(() => {
    saveToStorage('photos', photos);
  }, [photos]);

  useEffect(() => {
    saveToStorage('homePageImage', homePageImage);
  }, [homePageImage]);

  // --- Authentication Handlers (now purely client-side) ---
  const handleLogin = useCallback((e) => {
    e.preventDefault();
    setLoginError("");

    const foundUser = users.find(u => u.id === loginId && u.password === loginPass);

    if (foundUser) {
      setUser(foundUser);
      setCurrentPage("home");
      setLoginId("");
      setLoginPass("");
      setLoginError("");
      showMessage('success', `Welcome, ${foundUser.name}!`);
    } else {
      setLoginError("Invalid ID or password");
    }
  }, [loginId, loginPass, users, showMessage]);

  const handleLogout = useCallback(() => {
    showConfirm("Are you sure you want to log out?", () => {
      setUser(null); // Clear local user state
      setCurrentPage("home");
      setSidebarOpen(false);
      setLoginId("");
      setLoginPass("");
      setLoginError("");
      showMessage('info', "You have been logged out.");
    });
  }, [showConfirm, showMessage]);

  // --- Sidebar Management ---
  const sidebarRef = useRef(); 
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest(".hamburger")
      ) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  const isAdmin = user?.role === "admin";

  const onMenuClick = useCallback((key) => {
    if (key === "logout") handleLogout();
    else setCurrentPage(key);
    setSidebarOpen(false);
  }, [handleLogout]);

  // --- Main Render Logic ---
  const renderPage = useCallback(() => {
    if (!user) return <LoginPage
      handleLogin={handleLogin}
      loginId={loginId}
      setLoginId={setLoginId}
      loginPass={loginPass}
      setLoginPass={setLoginPass}
      error={loginError}
      schoolPic={schoolPic}
    />;

    switch (currentPage) {
      case "home": return <Home
        user={user}
        DESCRIPTIONS={DESCRIPTIONS}
        homePageImage={homePageImage}
        setHomePageImage={setHomePageImage}
        isAdmin={isAdmin}
        showMessage={showMessage}
        showConfirm={showConfirm}
      />;
      case "members": return <MemberDetails
        isAdmin={isAdmin}
        users={users}
        setUsers={setUsers}
        work={work}
        setWork={setWork}
        photos={photos}
        setPhotos={setPhotos}
        showMessage={showMessage}
        showConfirm={showConfirm}
        DESCRIPTIONS={DESCRIPTIONS}
      />;
      case "progress": return <Progress
        isAdmin={isAdmin}
        users={users}
        setUsers={setUsers}
        DESCRIPTIONS={DESCRIPTIONS}
        showMessage={showMessage}
      />;
      case "work": return <Work
        isAdmin={isAdmin}
        user={user}
        users={users}
        work={work}
        setWork={setWork}
        DESCRIPTIONS={DESCRIPTIONS}
        showMessage={showMessage}
        showConfirm={showConfirm}
      />;
      case "events": return <Events
        isAdmin={isAdmin}
        events={events}
        setEvents={setEvents}
        DESCRIPTIONS={DESCRIPTIONS}
        showMessage={showMessage}
        showConfirm={showConfirm}
      />;
      case "achievements": return <Achievements
        isAdmin={isAdmin}
        achievements={achievements}
        setAchievements={setAchievements}
        DESCRIPTIONS={DESCRIPTIONS}
        showMessage={showMessage}
        showConfirm={showConfirm}
      />;
      case "articles": return <Articles
        isAdmin={isAdmin}
        articles={articles}
        setArticles={setArticles}
        DESCRIPTIONS={DESCRIPTIONS}
        showMessage={showMessage}
        showConfirm={showConfirm}
        user={user}
      />;
      case "gallery": return <Gallery
        photos={photos}
        users={users}
        DESCRIPTIONS={DESCRIPTIONS}
      />;
      case "photoUpload": return <PhotoUpload
        user={user}
        photos={photos}
        setPhotos={setPhotos}
        showMessage={showMessage}
        DESCRIPTIONS={DESCRIPTIONS}
        users={users}
      />;
      default: return <Home user={user} DESCRIPTIONS={DESCRIPTIONS} />;
    }
  }, [currentPage, user, loginId, loginPass, loginError, homePageImage, isAdmin, users, work, events, achievements, articles, photos, handleLogin, showMessage, showConfirm]);

  return (
    <>
      <header className="app-header">
        <button
          className="hamburger"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        {/* Make sure logo.jpeg is in your public folder or adjust path */}
        <img
          src={process.env.PUBLIC_URL + '/logo.jpeg'} // Use process.env.PUBLIC_URL for correct path in build
          alt="MPS Cyber Club Logo"
          className="header-logo"
          // Fallback in case the image is not found
          onError={(e) => { 
            e.target.onerror = null; // Prevents infinite loop if fallback also fails
            e.target.src="https://placehold.co/40x40/FFD700/000000?text=Logo"; // Placeholder image
            console.error("Logo image not found. Using placeholder. Check public/logo.jpeg and PUBLIC_URL.");
          }}
        />
        <h1 className="club-title">
            MPS Cyber Club
        </h1>
        {user && (
          <div className="logged-in-info">
            Logged in as <b>{user.name}</b> ({user.role})
            <br/>
            {/* Display the local user ID */}
            User ID: <span style={{fontSize: '0.8em', color: '#ccc'}}>{user.id || 'N/A'}</span> 
          </div>
        )}
      </header>

      <div style={{ display: "flex" }}>
        {sidebarOpen && user && (
          <nav
            ref={sidebarRef}
            className="app-sidebar"
          >
            <ul className="sidebar-menu">
              {MENU_ITEMS.map((item) => {
                if (item.adminOnly && !isAdmin) return null;
                return (
                  <li key={item.key} className="sidebar-menu-item">
                    <button
                      onClick={() => onMenuClick(item.key)}
                      className={`sidebar-button ${currentPage === item.key ? "active" : ""}`}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        <main className={`app-main-content ${sidebarOpen && user ? "shifted" : ""}`}>
          {renderPage()}
        </main>
      </div>

      {message && <MessageBox type={message.type} text={message.text} onClose={() => setMessage(null)} />}
      {confirm && <ConfirmBox text={confirm.text} onConfirm={confirm.onConfirm} onCancel={confirm.onCancel} />}
    </>
  );
}