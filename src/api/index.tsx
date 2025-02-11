import axios, { AxiosResponse } from 'axios';
import { BASE_URL } from '../assets/string.tsx';
import { ShowErrorMessage } from '../component/FlashMessage/FlashMessage.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';


type APIMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface APIParams {
  [key: string]: any;
}

interface APIResponse<T = any> extends AxiosResponse<T> { }

export const API = async <T = any>(
  method: APIMethod,
  endpoint: string,
  data?: any,
  params?: APIParams
): Promise<APIResponse<T>> => {
  try {
    // Retrieve the token from AsyncStorage
    const token = await AsyncStorage.getItem('userToken');

    const response = await axios({
      method: method,
      url: `${BASE_URL}/${endpoint}`,
      data: data ? data : undefined,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '', // Set the Authorization header with the retrieved token
        Accept: 'application/json',
      },
      params,
      maxBodyLength: Infinity, // Set maxBodyLength as per your provided config
    });

    return response;
  } catch (error: any) {
    const statusCode = error.response?.status;
    // ShowErrorMessage(`Error: ${error.message || 'Something went wrong'}`);
    throw { ...error, statusCode }; // Include status code in the thrown error
  }
};

export const API_FOR_UPLOAD = async <T = any>(
  method: APIMethod,
  endpoint: string,
  data?: any,
  params?: APIParams
): Promise<APIResponse<T>> => {
  try {
    // Retrieve the token from AsyncStorage
    const token = await AsyncStorage.getItem('userToken');

    console.log('Request Data:', data, `${BASE_URL}/${endpoint}`);
    const response = await axios({
      method: method,
      url: `${BASE_URL}/${endpoint}`,
      data: data ? data : undefined,
      headers: {
        // 'Authorization': token ? `Bearer ${token}` : '', // Set the Authorization header with the retrieved token
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      params,
      maxBodyLength: Infinity, // Set maxBodyLength as per your provided config
    });

    return response;
  } catch (error) {
    console.error('API Error:', error);
    ShowErrorMessage(`Error: ${error}`);
    throw error;
  }
};

// All API calls

export const loginAPI = (data: any) => API('POST', '', data).then(res => res).catch(err => err);

export const uplaodBadgesAPI = (data: any) => API('POST', '', data).then(res => res).catch(err => err);

export const coursesDetailsAPI = (data: any) => API('GET', `api/development/courses/${data}`).then(res => res).catch(err => err);

// EXAMPLE OF CALLING IN PAGE
// HomeJobData(data).then((res) => {
//  }).catch(err => { return err; });
