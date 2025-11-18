// Utility functions for patient localStorage operations
export const patientStorage = {
    // Get patients from localStorage
    getPatients: () => {
      try {
        return JSON.parse(localStorage.getItem('patients') || '[]');
      } catch (error) {
        console.error('Error reading patients from storage:', error);
        return [];
      }
    },
  
    // Save patient to localStorage
    savePatient: (patientData) => {
      try {
        const patients = patientStorage.getPatients();
        const newPatient = {
          id: Date.now().toString(),
          ...patientData,
          registrationDate: new Date().toISOString()
        };
        
        const updatedPatients = [...patients, newPatient];
        localStorage.setItem('patients', JSON.stringify(updatedPatients));
        
        // Trigger custom event for other components to listen to
        window.dispatchEvent(new Event('patientsUpdated'));
        
        return newPatient;
      } catch (error) {
        console.error('Error saving patient to storage:', error);
        throw error;
      }
    },
  
    // Update patient in localStorage
    updatePatient: (patientId, patientData) => {
      try {
        const patients = patientStorage.getPatients();
        const updatedPatients = patients.map(patient => 
          patient.id === patientId 
            ? { ...patient, ...patientData }
            : patient
        );
        localStorage.setItem('patients', JSON.stringify(updatedPatients));
        window.dispatchEvent(new Event('patientsUpdated'));
      } catch (error) {
        console.error('Error updating patient in storage:', error);
        throw error;
      }
    },
  
    // Delete patient from localStorage
    deletePatient: (patientId) => {
      try {
        const patients = patientStorage.getPatients();
        const updatedPatients = patients.filter(patient => patient.id !== patientId);
        localStorage.setItem('patients', JSON.stringify(updatedPatients));
        window.dispatchEvent(new Event('patientsUpdated'));
      } catch (error) {
        console.error('Error deleting patient from storage:', error);
        throw error;
      }
    },
  
    // Search patients
    searchPatients: (query) => {
      try {
        const patients = patientStorage.getPatients();
        if (!query.trim()) return patients;
  
        const searchTerm = query.toLowerCase();
        return patients.filter(patient =>
          patient['Full Name']?.toLowerCase().includes(searchTerm) ||
          patient['Email Address']?.toLowerCase().includes(searchTerm) ||
          patient['Phone Number']?.includes(searchTerm) ||
          patient.id?.includes(searchTerm)
        );
      } catch (error) {
        console.error('Error searching patients:', error);
        return [];
      }
    }
  };