import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';

const childProfilesCollection = collection(db, 'childProfiles');

// Create a new child profile
export const createChildProfile = async (childData) => {
  try {
    // Ensure required fields
    if (!childData.parentUid) {
      return { success: false, error: "Parent UID is required" };
    }
    
    const docRef = await addDoc(childProfilesCollection, {
      ...childData,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating child profile:", error);
    return { success: false, error: error.message };
  }
};

// Get all child profiles for a parent
export const getChildProfilesByParent = async (parentUid) => {
  try {
    const q = query(childProfilesCollection, where("parentUid", "==", parentUid));
    const querySnapshot = await getDocs(q);
    
    const childProfiles = [];
    querySnapshot.forEach((doc) => {
      childProfiles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, childProfiles };
  } catch (error) {
    console.error("Error getting child profiles:", error);
    return { success: false, error: error.message };
  }
};

// Get a single child profile by ID
export const getChildProfileById = async (profileId) => {
  try {
    const docRef = doc(db, 'childProfiles', profileId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        success: true, 
        childProfile: {
          id: docSnap.id,
          ...docSnap.data()
        } 
      };
    } else {
      return { success: false, error: "Child profile not found" };
    }
  } catch (error) {
    console.error("Error getting child profile:", error);
    return { success: false, error: error.message };
  }
};

// Update child profile
export const updateChildProfile = async (profileId, childData) => {
  try {
    const childRef = doc(db, 'childProfiles', profileId);
    await updateDoc(childRef, {
      ...childData,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating child profile:", error);
    return { success: false, error: error.message };
  }
};

// Delete child profile
export const deleteChildProfile = async (profileId) => {
  try {
    await deleteDoc(doc(db, 'childProfiles', profileId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting child profile:", error);
    return { success: false, error: error.message };
  }
}; 