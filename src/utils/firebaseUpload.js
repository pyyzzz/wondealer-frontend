const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

let firebaseApp;
let storage;

const hasFirebaseConfig = () =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.storageBucket);

const loadFirebaseStorage = async () => {
  if (storage) return storage;
  if (!hasFirebaseConfig()) {
    throw new Error("Firebase 환경변수가 설정되지 않았습니다.");
  }

  const [{ initializeApp, getApps }, { getStorage }] = await Promise.all([
    import(
      /* webpackIgnore: true */ "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"
    ),
    import(
      /* webpackIgnore: true */ "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js"
    ),
  ]);

  firebaseApp =
    getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  storage = getStorage(firebaseApp);
  return storage;
};

export const uploadImageFiles = async (files, folder = "items") => {
  const imageFiles = files.filter(Boolean);
  if (imageFiles.length === 0) return [];

  const [{ ref, uploadBytes, getDownloadURL }, currentStorage] =
    await Promise.all([
      import(
        /* webpackIgnore: true */ "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js"
      ),
      loadFirebaseStorage(),
    ]);

  return Promise.all(
    imageFiles.map(async (file, index) => {
      const ext = file.name?.split(".").pop() || "jpg";
      const path = `${folder}/${Date.now()}-${index}-${crypto.randomUUID()}.${ext}`;
      const imageRef = ref(currentStorage, path);
      await uploadBytes(imageRef, file);
      return getDownloadURL(imageRef);
    }),
  );
};
