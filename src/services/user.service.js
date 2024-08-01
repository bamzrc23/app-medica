import api  from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthService = () => {
  
  const login = async (data) => {
    return await api.post('api/users/login', data);
  };

  const editProfile = async (id, data ) => {
    return await api.post(`api/users/perfil/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const createProfile = async ( data ) => {
    return await api.post(`api/users`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const getUsers = async () => {
    return await api.get('api/users');
  }; 

  const getSpecialty = async () => {
    return await api.get('api/specialty');
  }; 

  const createCita = async (data) => {
    return await api.post('api/citas', data);
  };

  const getCitas = async () => {
    return await api.get('api/citas');
  };

  const updateStatusCita = async (id, data) => {
    return await api.post(`api/citas/${id}`, data);
  };

  const createDocument = async (id, data) => {
    return await api.post(`api/documents/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  const getDocuments = async () => {
    return await api.get('api/documents');
  };

  const createDescriptionCita = async (data) => {
    return await api.post(`api/description`, data);
  }

  const getDescriptionByCita = async (id) => {
    return await api.get(`api/description/byCita/${id}`);
  };

  const createNotification = async (data) => {
    return await api.post(`api/notifications`, data);
  }

  const getNotificationByUser = async (id) => {
    return await api.get(`api/notifications/user/${id}`);
  };

  const useChangePassword = async (token, password) => {
    return await api.post(`api/users/recovered-password/${token}`, password);
  };

  const useCreateFirma = async (data) => {
    return await api.post(`api/firma`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  const downloadSignedPdf = async (id) => {
    const response = await api.get(`api/firma/download/${id}`, {
      responseType: 'blob', // Para asegurar que se maneje como un archivo
    });
    return response.data;
  };

  const signPdf = async (data) => {
    return await api.post('api/firma/sign-pdf', data);
  };

  const useGetFirma = async (id) => {
    return await api.get(`api/firma/${id}`);
  };

  const useFirmarDocumento = async (id) => {
    return await api.get(`api/firma/${id}`);
  };

  const deleteCita = async (id) => {
    return await api.delete(`api/citas/${id}`);
  };
  
  const cancelCita = async (id, data) => {
    return await api.put(`api/citas/${id}/cancelar`, data);
  };
  
  const getOccupiedHours = async (date, doctorId) => {
    return await api.get(`api/citas/hours`, { params: { date, doctorId } });
  };

  const uploadReceta = async (recetaId, data) => {
    return await api.post(`api/recetas/upload/${recetaId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };
  
  const uploadFactura = async (facturaId, data) => {
    return await api.post(`api/facturas/upload/${facturaId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const createMenstrualControl = async (data) => {
    return await api.post('/api/menstrual-control', data);
  };

  const getMenstrualControlByPatient = async (id) => {
    return await api.get(`/api/menstrual-control/user/${id}`);
  };

  const updateMenstrualControl = async (id, data) => {
    return await api.put(`/api/menstrual-control/${id}`, data);
  };

  const getRecetasByUser = async (id) => {
    return await api.get(`/api/recetas/user/${id}`);
  };

  const getFacturasByUser = async (id) => {
    return await api.get(`/api/facturas/user/${id}`);
  };

  const deleteNotification = async (id) => {
    try {
      return await api.delete(`api/notifications/${id}`);
    } catch (error) {
      console.error(`Error al eliminar la notificación con ID ${id}:`, error);
      throw error;
    }
  };

  const getQRCode = async (documentId, documentType) => {
    let endpoint = '';
    if (documentType === 'factura') {
      endpoint = `api/facturas/generate-qr/${documentId}`;
    } else if (documentType === 'receta') {
      endpoint = `api/recetas/generate-qr/${documentId}`;
    }
    const response = await api.get(endpoint);
    return response.qrCode; // Ajuste para obtener la propiedad correcta
  };
  

  
  return {
    login,
    editProfile,
    createProfile,
    getUsers,
    getSpecialty,
    createCita,
    getCitas,
    updateStatusCita,
    createDocument,
    getDocuments,
    createDescriptionCita,
    getDescriptionByCita,
    createNotification,
    getNotificationByUser,
    useChangePassword,
    useCreateFirma,
    useGetFirma,
    useFirmarDocumento,
    deleteCita,
    cancelCita,
    signPdf,
    getOccupiedHours,
    uploadReceta,
    uploadFactura,
    createMenstrualControl,
    getMenstrualControlByPatient,
    updateMenstrualControl,
    getRecetasByUser,
    getFacturasByUser,
    deleteNotification,
    getQRCode,
    downloadSignedPdf
  };
};
