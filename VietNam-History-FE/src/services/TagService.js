import axios from "axios"

export const axiosJWT = axios.create()

export const addTag = async (data) => {
  const res = await axios.post(`${process.env.REACT_APP_API_URL_BACKEND}/tag/create`, data)
  return res.data
}

export const getAllTag = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/tag/get-all`);
    console.log('Raw getAllTag response:', res);

    // Case 1: If response.data is an array directly
    if (Array.isArray(res.data)) {
      console.log('getAllTag: Returning direct array', res.data.length);
      return res.data;
    }
    // Case 2: If response has data.data as array (most common API structure)
    else if (res.data && res.data.data && Array.isArray(res.data.data)) {
      console.log('getAllTag: Returning from data.data', res.data.data.length);
      return res.data.data;
    }
    // Case 3: If response has data property as array
    else if (res.data && Array.isArray(res.data)) {
      console.log('getAllTag: Returning from data array', res.data.length);
      return res.data;
    }
    // Case 4: Normal structure with status and data
    else if (res.data && res.data.status === "OK" && res.data.data) {
      console.log('getAllTag: Returning from OK status', Array.isArray(res.data.data) ? res.data.data.length : 'not array');
      return res.data.data;
    }

    // Default: Return empty array if structure doesn't match
    console.warn('getAllTag: Unexpected data structure, returning empty array');
    return [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    return []; // Return empty array instead of throwing
  }
};


export const getAllTagByUser = async (userId) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/tag/get-all?userTag=${userId}`);
    return response;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};


export const getDetailsTag = async (tagId) => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/tag/get-detail-tag/${tagId}`);
    console.log('Tag data for ID', tagId, ':', res.data);

    // If response has the expected structure
    if (res.data && res.data.status === "OK" && res.data.data) {
      return res.data;
    }
    return res.data;
  } catch (error) {
    console.error(`Error fetching tag ${tagId}:`, error);
    return null;
  }
};

export const deleteTag = async (tagId) => {
  const res = await axios.delete(`${process.env.REACT_APP_API_URL_BACKEND}/tag/delete/${tagId}`
  );
  return res.data;
};

export const updateTag = async (tagId, data) => {
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL_BACKEND}/tag/update/${tagId}`,
    data
  );
  return res.data;
};


