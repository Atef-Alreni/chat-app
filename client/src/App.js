import { useRef, useState } from "react";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyBSZe7MhgggBxQN0Jem16IF6IITPwHRlhg",
  authDomain: "chat-app-d3440.firebaseapp.com",
  projectId: "chat-app-d3440",
  storageBucket: "chat-app-d3440.appspot.com",
  messagingSenderId: "504580102500",
  appId: "1:504580102500:web:5895a9635ba67fc0780271",
  measurementId: "G-RRYF5ZQWP3",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

const converter = {
  toFirestore(m) {
    return {
      message: m.message,
      createdAt: m.createdAt,
      photoURL: m.photoURL,
      author: m.author,
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      message: data.message,
      createdAt: data.createdAt,
      photoURL: data.photoURL,
      author: data.author,
    };
  },
};

function App() {
  const [user] = useAuthState(auth);

  return (
    <>
      <nav>
        <div>
          <h1>Navbar</h1>
          {user ? <SignOut /> : ""}
        </div>
      </nav>
      <main>
        {user ? (
          <div className='chatroom-div'>
            <ChatRoom />
          </div>
        ) : (
          <div className='login-div'>
            <LogIn />
          </div>
        )}
      </main>
    </>
  );
}

function ChatRoom() {
  const scrollTo = useRef();
  const ref = firestore.collection("messages").withConverter(converter);
  const orderedQuery = ref.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(orderedQuery);
  const [form, setForm] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { photoURL, uid } = auth.currentUser;

    await ref.add({
      message: form,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      photoURL,
      author: uid,
    });

    setForm("");
    scrollTo.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className='messages'>
        {messages &&
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        <div ref={scrollTo}></div>
      </div>
      <form onSubmit={sendMessage}>
        <input
          type='text'
          value={form}
          onChange={(e) => setForm(e.target.value)}
          placeholder='type a message'
        />
        <input type='submit' value='Send' disabled={!form} />
      </form>
    </>
  );

  function Message(props) {
    const { message, photoURL, author } = props.message;
    const fromUserClass = author === auth.currentUser.uid ? "sent" : "recieved";

    return (
      <div className={`message ${fromUserClass}`}>
        <img src={photoURL} />
        <h5>{message}</h5>
      </div>
    );
  }
}

function LogIn() {
  const logInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <button onClick={logInWithGoogle} className='login-btn'>
      Sign in with Google
    </button>
  );
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

export default App;
